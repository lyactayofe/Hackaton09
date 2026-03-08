"use strict";

/**
 * Enumeración simple de estaciones/estados del flujo de trabajo.
 */
const EstadoReparacion = Object.freeze({
  INGRESADO: "Ingresado",
  EN_REVISION: "En revisión inicial",
  ESPERANDO_AUTORIZACION: "Esperando autorización y abono",
  EN_REPARACION: "En reparación",
  EN_CONTROL_CALIDAD: "En control de calidad",
  LISTO_ENTREGA: "Listo para entrega",
  ENTREGADO: "Entregado"
});

class Telefono {
  constructor({ numeroSerie, imei, marca, modelo }) {
    if (!numeroSerie || !imei || !marca || !modelo) {
      throw new Error("Telefono inválido: faltan datos obligatorios.");
    }

    this.numeroSerie = numeroSerie;
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
  constructor({ id, nombre, skills = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.skills = skills;
  }

  puedeRepararMarca(marca) {
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
  constructor({ descripcion, costoEstimado, fecha = new Date() }) {
    this.descripcion = descripcion;
    this.costoEstimado = costoEstimado;
    this.fecha = fecha;
  }
}

/**
 * Cliente HTTP simulado para demostrar integración tipo API.
 */
class HttpClientMock {
  constructor() {
    this.blacklist = {
      series: new Set(["SERIE-REPORTADA-001"]),
      imeis: new Set(["IMEI-REPORTADO-999"])
    };
    this.registros = {
      diagnosticos: [],
      estados: []
    };
  }

  async get(path, query = {}) {
    await this.#delay(120);

    if (path === "/reportes/equipo") {
      const serieReportada = this.blacklist.series.has(query.numeroSerie);
      const imeiReportado = this.blacklist.imeis.has(query.imei);
      return { ok: true, data: { serieReportada, imeiReportado } };
    }

    return { ok: false, error: `GET ${path} no implementado.` };
  }

  async post(path, body = {}) {
    await this.#delay(120);

    if (path === "/diagnosticos") {
      this.registros.diagnosticos.push(body);
      return { ok: true, data: body };
    }

    if (path === "/estados") {
      this.registros.estados.push(body);
      return { ok: true, data: body };
    }

    return { ok: false, error: `POST ${path} no implementado.` };
  }

  async patch(path, body = {}) {
    await this.#delay(100);
    if (path === "/reparaciones/estado") {
      this.registros.estados.push(body);
      return { ok: true, data: body };
    }

    return { ok: false, error: `PATCH ${path} no implementado.` };
  }

  #delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class Reparacion {
  constructor({ id, telefono, cliente, sucursal }) {
    this.id = id;
    this.telefono = telefono;
    this.cliente = cliente;
    this.sucursal = sucursal;

    this.diagnosticoInicial = null;
    this.tecnicoAsignado = null;
    this.repuestos = [];
    this.abono = 0;
    this.estadoActual = EstadoReparacion.INGRESADO;
    this.historialEstados = [
      { estado: EstadoReparacion.INGRESADO, fecha: new Date(), nota: "Equipo recibido" }
    ];
  }

  guardarDiagnosticoInicial(diagnostico) {
    if (!(diagnostico instanceof Diagnostico)) {
      throw new Error("El diagnóstico inicial es inválido.");
    }
    this.diagnosticoInicial = diagnostico;
    this.#cambiarEstado(EstadoReparacion.ESPERANDO_AUTORIZACION, "Diagnóstico inicial registrado");
  }

  registrarAbono(monto) {
    if (monto <= 0) {
      throw new Error("El abono debe ser mayor a 0.");
    }
    this.abono += monto;
  }

  validarAutorizacionYAbono() {
    if (!this.diagnosticoInicial) {
      throw new Error("Aún no existe diagnóstico inicial.");
    }

    if (!this.cliente.autorizacionEscrita) {
      throw new Error("Falta autorización escrita del cliente.");
    }

    const minimo = this.diagnosticoInicial.costoEstimado * 0.5;
    if (this.abono < minimo) {
      throw new Error(`Abono insuficiente. Se requiere al menos ${minimo}.`);
    }
  }

  asignarTecnico(tecnico) {
    if (!(tecnico instanceof Tecnico)) {
      throw new Error("Técnico inválido.");
    }

    if (!tecnico.puedeRepararMarca(this.telefono.marca)) {
      throw new Error(
        `El técnico ${tecnico.nombre} no tiene skill para la marca ${this.telefono.marca}.`
      );
    }

    this.tecnicoAsignado = tecnico;
  }

  agregarRepuesto(repuesto) {
    if (!(repuesto instanceof Repuesto)) {
      throw new Error("Repuesto inválido.");
    }
    this.repuestos.push(repuesto);
  }

  iniciarReparacion() {
    this.validarAutorizacionYAbono();
    if (!this.tecnicoAsignado) {
      throw new Error("No se puede iniciar: falta técnico asignado.");
    }
    this.#cambiarEstado(EstadoReparacion.EN_REPARACION, "Reparación iniciada");
  }

  moverAControlCalidad() {
    this.#cambiarEstado(EstadoReparacion.EN_CONTROL_CALIDAD, "Equipo pasa a control de calidad");
  }

  marcarListoParaEntrega() {
    this.#cambiarEstado(EstadoReparacion.LISTO_ENTREGA, "Equipo listo para entrega");
  }

  entregarEquipo() {
    this.#cambiarEstado(EstadoReparacion.ENTREGADO, "Equipo entregado al cliente");
  }

  obtenerResumen() {
    const costoRepuestos = this.repuestos.reduce((acc, r) => acc + r.costo, 0);
    const costoEstimado = this.diagnosticoInicial ? this.diagnosticoInicial.costoEstimado : 0;

    return {
      idReparacion: this.id,
      cliente: this.cliente.nombre,
      equipo: `${this.telefono.marca} ${this.telefono.modelo}`,
      sucursal: this.sucursal,
      tecnico: this.tecnicoAsignado ? this.tecnicoAsignado.nombre : "Sin asignar",
      estadoActual: this.estadoActual,
      costoEstimado,
      abono: this.abono,
      costoRepuestos,
      historial: this.historialEstados
    };
  }

  #cambiarEstado(estado, nota) {
    this.estadoActual = estado;
    this.historialEstados.push({ estado, fecha: new Date(), nota });
  }
}

class SistemaReparaciones {
  constructor(httpClient) {
    this.http = httpClient;
    this.reparaciones = new Map();
  }

  async registrarIngreso({ idReparacion, telefono, cliente, sucursal }) {
    const validacion = await this.http.get("/reportes/equipo", {
      numeroSerie: telefono.numeroSerie,
      imei: telefono.imei
    });

    if (!validacion.ok) {
      throw new Error("No fue posible validar reportes del equipo.");
    }

    const { serieReportada, imeiReportado } = validacion.data;
    if (serieReportada || imeiReportado) {
      throw new Error("Equipo rechazado: serie o IMEI reportado.");
    }

    const reparacion = new Reparacion({
      id: idReparacion,
      telefono,
      cliente,
      sucursal
    });

    reparacion.historialEstados.push({
      estado: EstadoReparacion.EN_REVISION,
      fecha: new Date(),
      nota: "Equipo aceptado y enviado a primera revisión"
    });
    reparacion.estadoActual = EstadoReparacion.EN_REVISION;

    this.reparaciones.set(idReparacion, reparacion);
    return reparacion;
  }

  async registrarPrimeraRevision(idReparacion, diagnostico) {
    const reparacion = this.#obtenerReparacion(idReparacion);
    reparacion.guardarDiagnosticoInicial(diagnostico);

    const result = await this.http.post("/diagnosticos", {
      idReparacion,
      descripcion: diagnostico.descripcion,
      costoEstimado: diagnostico.costoEstimado,
      fecha: diagnostico.fecha.toISOString()
    });

    if (!result.ok) {
      throw new Error("No se pudo persistir el diagnóstico vía HTTP.");
    }
  }

  async actualizarEstadoHTTP(idReparacion, nota) {
    const reparacion = this.#obtenerReparacion(idReparacion);
    const result = await this.http.patch("/reparaciones/estado", {
      idReparacion,
      estado: reparacion.estadoActual,
      nota,
      fecha: new Date().toISOString()
    });

    if (!result.ok) {
      throw new Error("No se pudo actualizar estado vía HTTP.");
    }
  }

  verEstado(idReparacion) {
    const reparacion = this.#obtenerReparacion(idReparacion);
    return reparacion.obtenerResumen();
  }

  #obtenerReparacion(idReparacion) {
    const reparacion = this.reparaciones.get(idReparacion);
    if (!reparacion) {
      throw new Error(`No existe la reparación ${idReparacion}.`);
    }
    return reparacion;
  }
}

async function demo() {
  const http = new HttpClientMock();
  const sistema = new SistemaReparaciones(http);

  const cliente = new Cliente({ id: "C1", nombre: "Ana Torres" });
  const telefono = new Telefono({
    numeroSerie: "SERIE-OK-123",
    imei: "IMEI-OK-456",
    marca: "Samsung",
    modelo: "S22"
  });

  const tecnico = new Tecnico({
    id: "T1",
    nombre: "Luis Rojas",
    skills: ["Samsung", "Xiaomi"]
  });

  const repuestoPantalla = new Repuesto({ codigo: "R-101", nombre: "Pantalla OLED", costo: 180 });
  const repuestoBateria = new Repuesto({ codigo: "R-102", nombre: "Batería", costo: 65 });

  const reparacion = await sistema.registrarIngreso({
    idReparacion: "REP-0001",
    telefono,
    cliente,
    sucursal: "Sucursal Centro"
  });

  const diagnostico = new Diagnostico({
    descripcion: "Pantalla rota y batería degradada",
    costoEstimado: 500
  });

  await sistema.registrarPrimeraRevision(reparacion.id, diagnostico);

  cliente.firmarAutorizacion();
  reparacion.registrarAbono(250);

  reparacion.asignarTecnico(tecnico);
  reparacion.agregarRepuesto(repuestoPantalla);
  reparacion.agregarRepuesto(repuestoBateria);

  reparacion.iniciarReparacion();
  await sistema.actualizarEstadoHTTP(reparacion.id, "Inicia intervención técnica");

  reparacion.moverAControlCalidad();
  await sistema.actualizarEstadoHTTP(reparacion.id, "Pruebas funcionales completas");

  reparacion.marcarListoParaEntrega();
  await sistema.actualizarEstadoHTTP(reparacion.id, "Equipo listo en vitrina de entrega");

  reparacion.entregarEquipo();
  await sistema.actualizarEstadoHTTP(reparacion.id, "Cliente retira equipo");

  const resumen = sistema.verEstado(reparacion.id);
  console.log("\n=== RESUMEN DE REPARACIÓN ===");
  console.log(JSON.stringify(resumen, null, 2));
}

demo().catch((error) => {
  console.error("Error en la demo:", error.message);
});