"use strict";

const KEYS = Object.freeze({
  repairs: "reto2.reparaciones",
  selected: "reto2.reparacionActiva"
});

const ESTADOS = Object.freeze({
  INGRESADO: "Ingresado",
  REVISION: "En revisión inicial",
  ESPERA_CONDICIONES: "Esperando autorización y abono",
  REPARACION: "En reparación",
  CALIDAD: "En control de calidad",
  LISTO: "Listo para entrega",
  ENTREGADO: "Entregado"
});

class Telefono {
  constructor({ serie, imei, marca, modelo }) {
    this.serie = serie;
    this.imei = imei;
    this.marca = marca;
    this.modelo = modelo;
  }
}

class Cliente {
  constructor({ id, nombre, autorizacionEscrita = false }) {
    this.id = id;
    this.nombre = nombre;
    this.autorizacionEscrita = autorizacionEscrita;
  }

  firmarAutorizacion() {
    this.autorizacionEscrita = true;
  }
}

class Tecnico {
  constructor({ id, nombre, skills }) {
    this.id = id;
    this.nombre = nombre;
    this.skills = skills;
  }

  puedeTrabajar(marca) {
    return this.skills.includes(marca);
  }
}

class Repuesto {
  constructor({ codigo, nombre, costo }) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.costo = costo;
  }
}

class Diagnostico {
  constructor({ descripcion, costoEstimado }) {
    this.descripcion = descripcion;
    this.costoEstimado = costoEstimado;
    this.fecha = new Date().toISOString();
  }
}

class HttpClientMock {
  constructor() {
    this.seriesReportadas = new Set(["SERIE-REPORTADA-001", "BLOCK-SERIE-88"]);
    this.imeisReportados = new Set(["IMEI-REPORTADO-999", "000000000000000"]);
  }

  async get(path, query = {}) {
    await this.#delay(80);
    if (path !== "/equipos/reportes") return { ok: false, error: "Endpoint no soportado" };
    return {
      ok: true,
      data: {
        serieReportada: this.seriesReportadas.has(query.serie),
        imeiReportado: this.imeisReportados.has(query.imei)
      }
    };
  }

  async post(path, body = {}) {
    await this.#delay(70);
    return { ok: true, data: { path, ...body } };
  }

  async patch(path, body = {}) {
    await this.#delay(70);
    return { ok: true, data: { path, ...body } };
  }

  #delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class Reparacion {
  constructor({ id, cliente, telefono, sucursal }) {
    this.id = id;
    this.cliente = cliente;
    this.telefono = telefono;
    this.sucursal = sucursal;
    this.diagnostico = null;
    this.abono = 0;
    this.tecnico = null;
    this.repuestos = [];
    this.estado = ESTADOS.REVISION;
    this.historial = [
      this.#marca(ESTADOS.INGRESADO, "Equipo recibido"),
      this.#marca(ESTADOS.REVISION, "Equipo enviado a primera revisión")
    ];
  }

  guardarDiagnostico(diagnostico) {
    this.diagnostico = diagnostico;
    this.#setEstado(ESTADOS.ESPERA_CONDICIONES, "Diagnóstico inicial guardado");
  }

  registrarCondiciones({ autorizacion, abono }) {
    if (autorizacion) this.cliente.firmarAutorizacion();
    this.abono += abono;
  }

  asignarTecnico(tecnico) {
    if (!tecnico.puedeTrabajar(this.telefono.marca)) {
      throw new Error(`El técnico ${tecnico.nombre} no tiene skill para ${this.telefono.marca}.`);
    }
    this.tecnico = tecnico;
  }

  agregarRepuesto(repuesto) {
    this.repuestos.push(repuesto);
  }

  iniciar() {
    this.#validarIngresoAServicio();
    if (!this.tecnico) throw new Error("Primero asigna un técnico.");
    this.#setEstado(ESTADOS.REPARACION, "Reparación iniciada");
  }

  calidad() {
    if (this.estado !== ESTADOS.REPARACION) {
      throw new Error("Solo se puede pasar a calidad desde 'En reparación'.");
    }
    this.#setEstado(ESTADOS.CALIDAD, "Equipo en control de calidad");
  }

  listo() {
    if (this.estado !== ESTADOS.CALIDAD) {
      throw new Error("Solo se puede pasar a 'Listo' desde control de calidad.");
    }
    this.#setEstado(ESTADOS.LISTO, "Equipo listo para entrega");
  }

  entregar() {
    if (this.estado !== ESTADOS.LISTO) {
      throw new Error("Solo se puede entregar si está en 'Listo para entrega'.");
    }
    this.#setEstado(ESTADOS.ENTREGADO, "Equipo entregado");
  }

  #validarIngresoAServicio() {
    if (!this.diagnostico) throw new Error("Falta diagnóstico inicial.");
    if (!this.cliente.autorizacionEscrita) throw new Error("Falta autorización escrita del cliente.");
    const minimo = this.diagnostico.costoEstimado * 0.5;
    if (this.abono < minimo) {
      throw new Error(`Abono insuficiente. Mínimo requerido: S/ ${minimo}.`);
    }
  }

  #setEstado(estado, nota) {
    this.estado = estado;
    this.historial.push(this.#marca(estado, nota));
  }

  #marca(estado, nota) {
    return { estado, nota, fecha: new Date().toISOString() };
  }
}

class StorageRepo {
  static saveRepairs(repairs) {
    localStorage.setItem(KEYS.repairs, JSON.stringify(repairs));
  }

  static loadRepairs() {
    const raw = localStorage.getItem(KEYS.repairs);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSelected(id) {
    sessionStorage.setItem(KEYS.selected, id);
  }

  static loadSelected() {
    return sessionStorage.getItem(KEYS.selected) || "";
  }

  static clearAll() {
    localStorage.removeItem(KEYS.repairs);
    sessionStorage.removeItem(KEYS.selected);
  }
}

class SistemaReparaciones {
  constructor(httpClient, tecnicos) {
    this.http = httpClient;
    this.tecnicos = tecnicos;
    this.reparaciones = new Map();
    this.#restoreFromStorage();
  }

  async registrarIngreso(data) {
    const check = await this.http.get("/equipos/reportes", {
      serie: data.telefono.serie,
      imei: data.telefono.imei
    });

    if (!check.ok) throw new Error("No se pudo validar equipo reportado.");
    if (check.data.serieReportada || check.data.imeiReportado) {
      throw new Error("Equipo rechazado: serie o IMEI reportado.");
    }

    const reparacion = new Reparacion(data);
    this.reparaciones.set(reparacion.id, reparacion);
    this.#persist();
    await this.http.post("/reparaciones", { id: reparacion.id, estado: reparacion.estado });
    return reparacion;
  }

  get(id) {
    const repair = this.reparaciones.get(id);
    if (!repair) throw new Error("Reparación no encontrada.");
    return repair;
  }

  list() {
    return [...this.reparaciones.values()];
  }

  getTecnicoById(id) {
    return this.tecnicos.find((t) => t.id === id);
  }

  async saveDiagnostico(id, diagnostico) {
    const r = this.get(id);
    r.guardarDiagnostico(diagnostico);
    this.#persist();
    await this.http.post("/diagnosticos", { id, diagnostico });
    await this.http.patch("/estados", { id, estado: r.estado });
  }

  async saveEstado(id, nota) {
    const r = this.get(id);
    this.#persist();
    await this.http.patch("/estados", { id, estado: r.estado, nota });
  }

  persistNow() {
    this.#persist();
  }

  #persist() {
    const plain = this.list().map((r) => JSON.parse(JSON.stringify(r)));
    StorageRepo.saveRepairs(plain);
  }

  #restoreFromStorage() {
    const data = StorageRepo.loadRepairs();
    data.forEach((item) => {
      const r = new Reparacion({
        id: item.id,
        cliente: new Cliente(item.cliente),
        telefono: new Telefono(item.telefono),
        sucursal: item.sucursal
      });
      r.diagnostico = item.diagnostico;
      r.abono = item.abono;
      r.tecnico = item.tecnico;
      r.repuestos = item.repuestos || [];
      r.estado = item.estado;
      r.historial = item.historial || r.historial;
      this.reparaciones.set(r.id, r);
    });
  }
}

const tecnicos = [
  new Tecnico({ id: "T1", nombre: "Luis Rojas", skills: ["Samsung", "Xiaomi"] }),
  new Tecnico({ id: "T2", nombre: "Mara Salas", skills: ["Apple", "Motorola"] }),
  new Tecnico({ id: "T3", nombre: "Jorge Pina", skills: ["Samsung", "Apple", "Huawei"] })
];

const sistema = new SistemaReparaciones(new HttpClientMock(), tecnicos);

const ui = {
  formIngreso: document.querySelector("#form-ingreso"),
  formDiagnostico: document.querySelector("#form-diagnostico"),
  formCondiciones: document.querySelector("#form-condiciones"),
  formTecnico: document.querySelector("#form-tecnico"),
  formRepuesto: document.querySelector("#form-repuesto"),
  selectRepair: document.querySelector("#reparacion-select"),
  selectTecnico: document.querySelector("#tecnico-select"),
  estado: document.querySelector("#estado-actual"),
  historial: document.querySelector("#historial"),
  repuestos: document.querySelector("#repuestos"),
  resumen: document.querySelector("#resumen"),
  toast: document.querySelector("#toast"),
  actions: [...document.querySelectorAll("[data-action]")],
  btnLimpiar: document.querySelector("#btn-limpiar")
};

function notify(msg, isError = false) {
  ui.toast.textContent = msg;
  ui.toast.style.background = isError ? "#7f1d1d" : "#152a45";
  ui.toast.classList.add("show");
  setTimeout(() => ui.toast.classList.remove("show"), 1800);
}

function selectedId() {
  return ui.selectRepair.value;
}

function selectedRepair() {
  const id = selectedId();
  if (!id) return null;
  return sistema.get(id);
}

function hydrateSelectors() {
  ui.selectTecnico.innerHTML = "";
  tecnicos.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = `${t.nombre} (${t.skills.join(", ")})`;
    ui.selectTecnico.appendChild(option);
  });

  ui.selectRepair.innerHTML = "";
  sistema.list().forEach((r) => {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = `${r.id} | ${r.telefono.marca} ${r.telefono.modelo}`;
    ui.selectRepair.appendChild(option);
  });

  const fromSession = StorageRepo.loadSelected();
  if (fromSession && sistema.list().some((r) => r.id === fromSession)) {
    ui.selectRepair.value = fromSession;
  }
}

function render() {
  const r = selectedRepair();
  if (!r) {
    ui.estado.textContent = "Sin casos";
    ui.historial.innerHTML = "";
    ui.repuestos.innerHTML = "";
    ui.resumen.textContent = "{}";
    return;
  }

  ui.estado.textContent = `Estado actual: ${r.estado}`;

  ui.historial.innerHTML = "";
  r.historial.forEach((h) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(h.fecha).toLocaleString()} | ${h.estado} | ${h.nota}`;
    ui.historial.appendChild(li);
  });

  ui.repuestos.innerHTML = "";
  r.repuestos.forEach((rep) => {
    const li = document.createElement("li");
    li.textContent = `${rep.codigo} - ${rep.nombre} (S/ ${rep.costo})`;
    ui.repuestos.appendChild(li);
  });

  ui.resumen.textContent = JSON.stringify(r, null, 2);
}

ui.formIngreso.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const fd = new FormData(ui.formIngreso);
    const id = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

    await sistema.registrarIngreso({
      id,
      cliente: new Cliente({ id: crypto.randomUUID(), nombre: String(fd.get("cliente")).trim() }),
      telefono: new Telefono({
        serie: String(fd.get("serie")).trim(),
        imei: String(fd.get("imei")).trim(),
        marca: String(fd.get("marca")).trim(),
        modelo: String(fd.get("modelo")).trim()
      }),
      sucursal: String(fd.get("sucursal")).trim()
    });

    hydrateSelectors();
    ui.selectRepair.value = id;
    StorageRepo.saveSelected(id);
    ui.formIngreso.reset();
    render();
    notify(`Reparación ${id} registrada.`);
  } catch (err) {
    notify(err.message, true);
  }
});

ui.formDiagnostico.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = selectedId();
    if (!id) throw new Error("Selecciona una reparación.");

    const fd = new FormData(ui.formDiagnostico);
    const diagnostico = new Diagnostico({
      descripcion: String(fd.get("descripcion")).trim(),
      costoEstimado: Number(fd.get("costo"))
    });

    await sistema.saveDiagnostico(id, diagnostico);
    render();
    notify("Diagnóstico inicial guardado.");
  } catch (err) {
    notify(err.message, true);
  }
});

ui.formCondiciones.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const r = selectedRepair();
    if (!r) throw new Error("Selecciona una reparación.");

    const fd = new FormData(ui.formCondiciones);
    r.registrarCondiciones({
      autorizacion: fd.get("autorizacion") === "on",
      abono: Number(fd.get("abono") || 0)
    });

    sistema.persistNow();
    render();
    notify("Autorización y abono actualizados.");
  } catch (err) {
    notify(err.message, true);
  }
});

ui.formTecnico.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const r = selectedRepair();
    if (!r) throw new Error("Selecciona una reparación.");

    const fd = new FormData(ui.formTecnico);
    const tecnico = sistema.getTecnicoById(String(fd.get("tecnico")));
    r.asignarTecnico(tecnico);

    sistema.persistNow();
    render();
    notify(`Técnico ${tecnico.nombre} asignado.`);
  } catch (err) {
    notify(err.message, true);
  }
});

ui.formRepuesto.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const r = selectedRepair();
    if (!r) throw new Error("Selecciona una reparación.");

    const fd = new FormData(ui.formRepuesto);
    r.agregarRepuesto(
      new Repuesto({
        codigo: String(fd.get("codigo")).trim(),
        nombre: String(fd.get("nombre")).trim(),
        costo: Number(fd.get("costo"))
      })
    );

    sistema.persistNow();
    ui.formRepuesto.reset();
    render();
    notify("Repuesto agregado.");
  } catch (err) {
    notify(err.message, true);
  }
});

ui.actions.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      const r = selectedRepair();
      if (!r) throw new Error("Selecciona una reparación.");

      const action = button.dataset.action;
      if (action === "iniciar") r.iniciar();
      if (action === "calidad") r.calidad();
      if (action === "listo") r.listo();
      if (action === "entregar") r.entregar();

      await sistema.saveEstado(r.id, `Cambio de estación: ${r.estado}`);
      render();
      notify(`Estado actualizado: ${r.estado}`);
    } catch (err) {
      notify(err.message, true);
    }
  });
});

ui.selectRepair.addEventListener("change", () => {
  StorageRepo.saveSelected(selectedId());
  render();
});

ui.btnLimpiar.addEventListener("click", () => {
  StorageRepo.clearAll();
  location.reload();
});

hydrateSelectors();
if (!ui.selectRepair.value && sistema.list().length > 0) {
  ui.selectRepair.value = sistema.list()[0].id;
}
if (ui.selectRepair.value) StorageRepo.saveSelected(ui.selectRepair.value);
render();





