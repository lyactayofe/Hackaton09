export class Sucursal {

  constructor(nombre, direccion) {
    this.nombre = nombre;
    this.direccion = direccion;
    this.tecnicos = [];
  }

  agregarTecnico(tecnico) {
    this.tecnicos.push(tecnico);
  }

  obtenerTecnicoDisponible(marca) {
    return this.tecnicos.find(t =>
      t.marcas.includes(marca)
    );
  }

}