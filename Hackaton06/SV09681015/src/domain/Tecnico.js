/*
export class Tecnico {
  constructor(nombre, skills = []) {
    this.nombre = nombre;
    this.skills = skills;
  }

  puedeReparar(marca) {
    return this.skills.includes(marca);
  }
}
*/

export class Tecnico {

  constructor(nombre, marcas = []) {
    this.nombre = nombre;
    this.marcas = marcas;
  }

}
  