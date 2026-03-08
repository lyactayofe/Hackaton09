export class Telefono {
  constructor(numeroSerie, imei, marca, modelo) {
    this.numeroSerie = numeroSerie;
    this.imei = imei;
    this.marca = marca;
    this.modelo = modelo;
    this.reportado = false;
  }

  estaDisponible() {
    return !this.reportado;
  }
}