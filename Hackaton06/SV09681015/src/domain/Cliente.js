export class Cliente {
  constructor(nombre, documento) {
    this.nombre = nombre;
    this.documento = documento;
    this.autorizacionFirmada = false;
  }

  firmarAutorizacion() {
    this.autorizacionFirmada = true;
  }
}