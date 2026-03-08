
import { Reparacion } from "../domain/Reparacion.js";
import { StorageService } from "./StorageService.js";

export class ReparacionService {

  constructor() {
    const datosGuardados = StorageService.cargar("reparaciones");
    this.reparaciones = datosGuardados.map(data => {
      const reparacion = new Reparacion(
        data.telefono,
        data.cliente,
        data.sucursal,
        data.id
      );

      reparacion.estado = data.estado;
      reparacion.costoDiagnostico = data.costoDiagnostico;
      reparacion.descripcionDiagnostico = data.descripcionDiagnostico;
      reparacion.abono = data.abono;
      reparacion.repuestos = data.repuestos;
      reparacion.tecnicoAsignado = data.tecnicoAsignado;
      reparacion.historial = data.historial;

      return reparacion;
    });

    //LISTA NEGRA DE IMEIs
    this.imeiReportados = [
      "326514789521465",
      "999999999999999",
      "111111111111111"
    ];

  }

  crearReparacion(telefono, cliente, sucursal) {

    // 🔴 1. Validar si IMEI está reportado
    const imeiRobado = this.imeiReportados.includes(telefono.imei);

    if (imeiRobado) {
      throw new Error("El IMEI está reportado como robado o perdido. No se puede registrar.");
    }

    // 🟡 2. Validar si ya existe reparación activa
    const existeActiva = this.reparaciones.find(r =>
      r.telefono.imei === telefono.imei &&
      r.estado !== "Finalizado"
    );

    if (existeActiva) {
      throw new Error("El teléfono ya tiene una reparación activa.");
    }

    // 🟢 3. Crear reparación
    const nuevaReparacion = new Reparacion(
      telefono,
      cliente,
      sucursal
    );

    this.reparaciones.push(nuevaReparacion);

    StorageService.guardar("reparaciones", this.reparaciones);

    return nuevaReparacion;
  }

  /*
    crearReparacion(telefono, cliente, sucursal) {
  
      const existeActiva = this.reparaciones.find(r =>
        r.telefono.imei === telefono.imei &&
        r.estado !== "Finalizado"
      );
  
      if (existeActiva) {
        throw new Error("El teléfono ya tiene una reparación activa.");
      }
  
      const nuevaReparacion = new Reparacion(
        telefono,
        cliente,
        sucursal
      );
  
      this.reparaciones.push(nuevaReparacion);
  
      StorageService.guardar("reparaciones", this.reparaciones);
  
      return nuevaReparacion;
    }
  */

  finalizarReparacion(id) {
    const reparacion = this.reparaciones.find(r => r.id === id);

    if (!reparacion) throw new Error("No encontrada");

    reparacion.finalizar();

    StorageService.guardar("reparaciones", this.reparaciones);

    return reparacion;
  }

  guardarCambios() {
    StorageService.guardar("reparaciones", this.reparaciones);
  }

}