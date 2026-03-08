export class Repuesto {
  constructor(nombre, precio, cantidad) {
    this.nombre = nombre;
    this.precio = Number(precio);
    this.cantidad = Number(cantidad);
  }

  getSubtotal() {
    return this.precio * this.cantidad;
  }
}