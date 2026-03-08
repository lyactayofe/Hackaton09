
export class Reparacion {
constructor(telefono, cliente, sucursal, id = null) {
  this.id = id || crypto.randomUUID();

  this.telefono = telefono;
  this.cliente = cliente;
  this.sucursal = sucursal;

  this.estado = "Ingresado";
  this.costoDiagnostico = 0;
  this.descripcionDiagnostico = "";
  this.abono = 0;

  this.repuestos = [];
  this.tecnicoAsignado = null;

  this.historial = [];

  if (!id) {
    this.registrarEstado("Ingresado");
  }
}


  registrarEstado(estado) {
    this.estado = estado;
    this.historial.push({
      estado,
      fecha: new Date()
    });
  }

  realizarDiagnostico(descripcion, costo) {
    if (this.estado !== "Ingresado") {
      throw new Error("Solo se puede diagnosticar si está ingresado.");
    }

    this.descripcionDiagnostico = descripcion;
    this.costoDiagnostico = costo;

    this.registrarEstado("Esperando autorización");
  }

  agregarRepuesto(nombre, precio, cantidad) {
    if (this.estado === "Finalizado") {
      throw new Error("No se pueden agregar repuestos a una reparación finalizada.");
    }

    this.repuestos.push({
      nombre,
      precio,
      cantidad
    });
  }

  registrarAbono(monto) {
    this.abono += monto;
  }

  estaAutorizada() {
    return this.abono >= this.getTotalServicio() * 0.5;
  }

  asignarTecnico() {
    if (!this.estaAutorizada()) {
      throw new Error("Debe estar autorizada antes de asignar técnico.");
    }

    if (this.estado !== "Esperando autorización") {
      throw new Error("Estado inválido para asignar técnico.");
    }

    const tecnico = this.sucursal.obtenerTecnicoDisponible(this.telefono.marca);

    if (!tecnico) {
      throw new Error("No hay técnico disponible para esta marca.");
    }

    this.tecnicoAsignado = tecnico;
    this.registrarEstado("En reparación");
  }

  finalizar() {
    if (this.estado !== "En reparación") {
      throw new Error("Solo se puede finalizar si está en reparación.");
    }

    this.registrarEstado("Finalizado");
  }

  getTotalRepuestos() {
    return this.repuestos.reduce((acc, r) => {
      return acc + (r.precio * r.cantidad);
    }, 0);
  }

  getTotalServicio() {
    return this.costoDiagnostico + this.getTotalRepuestos();
  }

}