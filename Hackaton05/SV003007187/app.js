// Datos para el bloqueo
const IMEIS_REPORTADOS = new Set(["123456789012345"]);
const SERIES_REPORTADAS = new Set(["SR-ROBA-001"]);

console.log("Sistema iniciado")


class Telefono {
  constructor(imei, serie, marca, modelo) {
    this.imei = imei;
    this.serie = serie;
    this.marca = marca;
    this.modelo = modelo;
    this.estado = "Ingresado";
    this.repuestos = []; // lista de repuestos
  }

  cambiarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }

  agregarRepuesto(repuesto) {
    this.repuestos.push(repuesto);
  }
}

class Reparacion {
  constructor(telefono, cliente) {
    this.telefono = telefono;
    this.cliente = cliente;
    this.diagnostico = "";
    this.autorizado = false;
    this.abono = 0;
    this.tecnico = null;
    this.costoEstimado = 0;
    this.consentimiento = null; 
  }

  registrarDiagnostico(texto) {
    this.diagnostico = texto;
    this.telefono.cambiarEstado("Diagnóstico");
  }

  autorizar(costoTotal, abono, nombreConsentimiento) {
    this.costoEstimado = costoTotal;
    this.abono = abono;
    this.autorizado = true;
    this.consentimiento = { nombre: nombreConsentimiento, fechaISO: new Date().toISOString() };
    this.telefono.cambiarEstado("Autorizado");
  }

  asignarTecnico(tecnico) {
    this.tecnico = tecnico;
  }
}

class Tecnico {
  constructor(nombre, skills) {
    this.nombre = nombre;
    this.skills = skills; ///samsung, apple...
  }

  puedeReparar(marcaTelefono) {
    return this.skills.includes(marcaTelefono);
  }
}

// cree variables globals
let telefonoActual = null;
let reparacionActual = null;


let tecnicos = [
  new Tecnico("Juan", ["Samsung", "Apple"]),
  new Tecnico("Ana", ["Xiaomi", "Huawei"]),
  new Tecnico("Pedro", ["Motorola", "Nokia"])
];


function render(mensajeExtra = "") {
  const el = document.getElementById("resultado");
  if (!telefonoActual) {
    el.innerText = "Sin teléfono cargado.";
    return;
  }

  const texto = [
    mensajeExtra ? `* ${mensajeExtra}` : "",
    `Cliente: ${reparacionActual?.cliente || "-"}`,
    `Equipo: ${telefonoActual.marca} ${telefonoActual.modelo}`,
    `IMEI: ${telefonoActual.imei} | Serie: ${telefonoActual.serie}`,
    `Estado: ${telefonoActual.estado}`,
    `Diagnóstico: ${reparacionActual?.diagnostico || "-"}`,
    `Autorizado: ${reparacionActual?.autorizado ? "Sí" : "No"}`,
    `Costo estimado: $${reparacionActual?.costoEstimado || 0}`,
    `Abono: $${reparacionActual?.abono || 0}`,
    `Consentimiento: ${reparacionActual?.consentimiento?.nombre || "-"}`,
    `Técnico: ${reparacionActual?.tecnico?.nombre || "-"}`,
    `Repuestos: ${telefonoActual.repuestos.join(", ") || "-"}`
  ].filter(Boolean).join("\n");

  el.innerText = texto;
}

// ======= WebStorage (LocalStorage) =======
const STORAGE_KEYS = {
  estadoActual: "repairApp:estadoActual"
};

//  instancias a objetos "planos" (serializables)
function serializarEstadoActual() {
  if (!telefonoActual || !reparacionActual) return null;

  return {
    telefono: {
      imei: telefonoActual.imei,
      serie: telefonoActual.serie,
      marca: telefonoActual.marca,
      modelo: telefonoActual.modelo,
      estado: telefonoActual.estado,
      repuestos: Array.isArray(telefonoActual.repuestos) ? [...telefonoActual.repuestos] : []
    },
    reparacion: {
      cliente: reparacionActual.cliente,
      diagnostico: reparacionActual.diagnostico,
      autorizado: reparacionActual.autorizado,
      abono: reparacionActual.abono,
      costoEstimado: reparacionActual.costoEstimado,
      consentimiento: reparacionActual.consentimiento,
      tecnico: reparacionActual.tecnico
        ? { nombre: reparacionActual.tecnico.nombre, skills: [...reparacionActual.tecnico.skills] }
        : null
    }
  };
}

// Reconstrui las instancias desde objetos planos
function deserializarEstadoActual(data) {
  if (!data) return;

  const t = data.telefono;
  const r = data.reparacion;

  telefonoActual = new Telefono(t.imei, t.serie, t.marca, t.modelo);
  telefonoActual.estado = t.estado;
  telefonoActual.repuestos = Array.isArray(t.repuestos) ? t.repuestos : [];

  reparacionActual = new Reparacion(telefonoActual, r.cliente);
  reparacionActual.diagnostico = r.diagnostico || "";
  reparacionActual.autorizado = !!r.autorizado;
  reparacionActual.abono = Number(r.abono || 0);
  reparacionActual.costoEstimado = Number(r.costoEstimado || 0);
  reparacionActual.consentimiento = r.consentimiento || null;

  if (r.tecnico) {
    reparacionActual.tecnico = new Tecnico(r.tecnico.nombre, r.tecnico.skills || []);
  }
}

function guardarEstadoActual() {
  const plano = serializarEstadoActual();
  if (!plano) return;
  try {
    localStorage.setItem(STORAGE_KEYS.estadoActual, JSON.stringify(plano));
  } catch (e) {
    console.warn("No se pudo guardar en LocalStorage:", e);
  }
  console.log("[LS] Guardado:", plano);
}

function cargarEstadoActual() {
  const raw = localStorage.getItem(STORAGE_KEYS.estadoActual);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    deserializarEstadoActual(data);
    return true;
  } catch (e) {
    console.warn("No se pudo cargar desde LocalStorage:", e);
    return false;
  }
}

function limpiarEstadoActual() {
  localStorage.removeItem(STORAGE_KEYS.estadoActual);
}

//  Botón: ingresar teléfono
document.getElementById("btnIngresarTelefono").addEventListener("click", async () => {
  const { value: formValues } = await Swal.fire({
    title: "Ingresar Teléfono",
    html: `
      <input id="cli" type="text" placeholder="Cliente" class="swal2-input">
      <input id="imei" type="text" placeholder="IMEI (15 dígitos)" class="swal2-input" maxlength="16" inputmode="numeric">
      <input id="serie" type="text" placeholder="Número de Serie" class="swal2-input">
      <input id="marca" type="text" placeholder="Marca" class="swal2-input">
      <input id="modelo" type="text" placeholder="Modelo" class="swal2-input">
    `,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      const cli = document.getElementById("cli").value.trim();
      const imei = document.getElementById("imei").value.trim();
      const serie = document.getElementById("serie").value.trim();
      const marca = document.getElementById("marca").value.trim();
      const modelo = document.getElementById("modelo").value.trim();

      if (!cli) { Swal.showValidationMessage("El cliente es obligatorio."); return false; }
      if (!/^\d{14,16}$/.test(imei)) { Swal.showValidationMessage("IMEI debe tener 14–16 dígitos."); return false; }
      if (!serie) { Swal.showValidationMessage("La serie es obligatoria."); return false; }
      if (!marca) { Swal.showValidationMessage("La marca es obligatoria."); return false; }
      if (!modelo) { Swal.showValidationMessage("El modelo es obligatorio."); return false; }

      return { cli, imei, serie, marca, modelo };
    }
  });

  if (!formValues) return;

  // Bloqueo por reportados
  if (IMEIS_REPORTADOS.has(formValues.imei)) {
    await Swal.fire("Denegado", "El IMEI está reportado. No puede acceder al servicio.", "error");
    return;
  }
  if (SERIES_REPORTADAS.has(formValues.serie)) {
    await Swal.fire("Denegado", "La Serie está reportada. No puede acceder al servicio.", "error");
    return;
  }

  telefonoActual = new Telefono(formValues.imei, formValues.serie, formValues.marca, formValues.modelo);
  reparacionActual = new Reparacion(telefonoActual, formValues.cli);

  guardarEstadoActual();
  render("Teléfono ingresado.");
});

// registrar diagnóstico 
document.getElementById("btnDiagnostico").addEventListener("click", async () => {
  if (!reparacionActual) {
    Swal.fire("Primero ingresa un teléfono");
    return;
  }

  const { value: diagnostico } = await Swal.fire({
    title: "Diagnóstico Inicial",
    input: "textarea",
    inputPlaceholder: "Describe el problema…",
    showCancelButton: true,
    preConfirm: (v) => {
      const t = (v || "").trim();
      if (!t) { Swal.showValidationMessage("El diagnóstico es obligatorio."); return false; }
      return t;
    }
  });

  if (!diagnostico) return;

  reparacionActual.registrarDiagnostico(diagnostico);
  guardarEstadoActual();
  render("Diagnóstico registrado.");
});

// autorización y pago (50%) 
document.getElementById("btnAutorizacion").addEventListener("click", async () => {
  if (!reparacionActual) {
    Swal.fire("Primero ingresa un teléfono");
    return;
  }
  if (!reparacionActual.diagnostico) {
    Swal.fire("Primero registra el diagnóstico");
    return;
  }

  const { value: datos } = await Swal.fire({
    title: "Autorización y Abono (≥ 50%)",
    html: `
      <input id="costo" type="number" step="0.01" min="1" placeholder="Costo estimado total" class="swal2-input">
      <input id="abono" type="number" step="0.01" min="0.01" placeholder="Abono (≥ 50%)" class="swal2-input">
      <input id="cons" type="text" placeholder="Nombre (consentimiento escrito)" class="swal2-input">
    `,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      const costo = Number(document.getElementById("costo").value);
      const abono = Number(document.getElementById("abono").value);
      const cons = document.getElementById("cons").value.trim();

      if (!costo || costo <= 0) { Swal.showValidationMessage("Costo estimado inválido."); return false; }
      if (!abono || abono <= 0) { Swal.showValidationMessage("Abono inválido."); return false; }
      if (abono < costo * 0.5) { Swal.showValidationMessage("El abono debe ser al menos 50%."); return false; }
      if (!cons) { Swal.showValidationMessage("Consentimiento requerido."); return false; }

      return { costo, abono, cons };
    }
  });

  if (!datos) return;

  reparacionActual.autorizar(datos.costo, datos.abono, datos.cons);
  guardarEstadoActual();
  render("Reparación autorizada y abonada.");
});

// Botón: asignar técnico
document.getElementById("btnAsignarTecnico").addEventListener("click", async () => {
  if (!reparacionActual) {
    Swal.fire("Primero ingresa un teléfono");
    return;
  }
  if (!reparacionActual.autorizado) {
    Swal.fire("Debes autorizar y abonar primero");
    return;
  }

  let disponibles = tecnicos.filter(t => t.puedeReparar(telefonoActual.marca));

  if (disponibles.length === 0) {
    Swal.fire("No hay técnicos disponibles para esta marca");
    return;
  }

  let opciones = disponibles
    .map(t => `<option value="${t.nombre}">${t.nombre} (${t.skills.join(", ")})</option>`)
    .join("");

  const { value: tecnicoSeleccionado } = await Swal.fire({
    title: "Asignar Técnico",
    html: `<select id="tecnico" class="swal2-select">${opciones}</select>`,
    showCancelButton: true,
    preConfirm: () => document.getElementById("tecnico").value
  });

  if (tecnicoSeleccionado) {
    let tecnico = disponibles.find(t => t.nombre === tecnicoSeleccionado);
    reparacionActual.asignarTecnico(tecnico);
    telefonoActual.cambiarEstado("En Reparación");
    guardarEstadoActual();
    render(`Técnico asignado: ${tecnico.nombre}.`);
  }
});

// ======= Botón: agregar repuesto =======
document.getElementById("btnAgregarRepuesto").addEventListener("click", async () => {
  if (!telefonoActual) {
    Swal.fire("Primero ingresa un teléfono");
    return;
  }
  if (!reparacionActual || !reparacionActual.tecnico) {
    Swal.fire("Asigna un técnico antes de agregar repuestos");
    return;
  }

  const { value: repuesto } = await Swal.fire({
    title: "Agregar Repuesto",
    input: "text",
    inputPlaceholder: "Nombre del repuesto (ej. Pantalla, Batería)",
    showCancelButton: true,
    preConfirm: (v) => {
      const t = (v || "").trim();
      if (!t) { Swal.showValidationMessage("El nombre del repuesto es obligatorio."); return false; }
      return t;
    }
  });

  if (repuesto) {
    telefonoActual.agregarRepuesto(repuesto);
    guardarEstadoActual();
    render(`Repuesto agregado: ${repuesto}.`);
  }
});

//decidi agregar una prueba para ver si se  guardaban datos al apretar f5
window.addEventListener("DOMContentLoaded", () => {
  const ok = cargarEstadoActual();
  if (ok) {
    render("Estado restaurado desde LocalStorage.");
  } else {
    render();
  }
});