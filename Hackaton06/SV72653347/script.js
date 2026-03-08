class Telefono{
 constructor(serie, imei, marca, reportado=null){
  this.serie = serie;
  this.imei = imei;
  this.marca = marca.trim();
  this.reportado = reportado ?? Math.random() < 0.3;
 }

 validarIngreso(){
  if(!this.serie || !this.imei)
   throw new Error("Telefono invalido");

  if(this.reportado)
   throw new Error("EL CELULAR ESTA REPORTADO");
 }
}

class Cliente{
 constructor(nombre, documento, autorizacion=false){
  this.nombre = nombre;
  this.documento = documento;
  this.autorizacion = autorizacion;
 }

 firmar(){
  this.autorizacion = true;
 }
}

class Tecnico{
 constructor(nombre, skills){
  this.nombre = nombre;
  this.skills = skills;
 }

 puedeReparar(marca){
  return this.skills
   .map(s=>s.toLowerCase().trim())
   .includes(marca.toLowerCase().trim());
 }
}

class Repuesto{
 constructor(nombre, precio){
  this.nombre = nombre;
  this.precio = precio;
 }
}

class Reparacion{

 #estado="Ingresado";

 constructor(telefono, cliente){
  telefono.validarIngreso();

  this.telefono = telefono;
  this.cliente = cliente;
  this.diagnostico = null;
  this.tecnico = null;
  this.repuestos=[];
  this.costo=0;
  this.abono=0;
 }

 diagnosticar(txt){
  this.diagnostico = txt;
  this.#estado="Diagnostico";
 }

 asignarTecnico(t){
  if(!t.puedeReparar(this.telefono.marca))
   throw new Error("Tecnico no sabe reparar esa marca");

  this.tecnico = t;
 }

 agregarRepuesto(r){
  this.repuestos.push(r);
  this.costo += r.precio;
 }

 abonar(monto){
  this.abono+=monto;
 }

 autorizar(){

  if(!this.cliente.autorizacion)
   throw new Error("Falta autorizacion del cliente");

  if(this.abono < this.costo/2)
   throw new Error("Debe pagar minimo 50%");

  this.#estado="Reparando";
 }

 terminar(){
  this.#estado="Terminado";
 }

 entregar(){
  if(this.#estado!=="Terminado")
   throw new Error("Aun no esta listo");

  this.#estado="Entregado";
 }

 getEstado(){
  return this.#estado;
 }

 setEstado(e){
  this.#estado=e;
 }

 toJSON(){
  return {
   telefono:this.telefono,
   cliente:this.cliente,
   diagnostico:this.diagnostico,
   costo:this.costo,
   abono:this.abono,
   estado:this.#estado
  }
 }
}

class Sucursal{
 constructor(nombre){
  this.nombre=nombre;
  this.reparaciones=[];
 }

 agregar(rep){
  this.reparaciones.push(rep);
 }
}

const sucursal = new Sucursal("Principal");
const tecnicoGeneral = new Tecnico("Carlos",["Samsung","Xiaomi","iPhone"]);
const tabla = document.getElementById("tabla");

document.getElementById("btnRegistrar").addEventListener("click",()=>{

 try{

  let cliente = new Cliente(
   document.getElementById("cliente").value,
   document.getElementById("doc").value
  );

  let telefono = new Telefono(
   document.getElementById("serie").value,
   document.getElementById("imei").value,
   document.getElementById("marca").value
  );

  let rep = new Reparacion(telefono,cliente);

  rep.diagnosticar("Falla general");
  rep.asignarTecnico(tecnicoGeneral);
  rep.agregarRepuesto(new Repuesto("Repuesto base",100));

  cliente.firmar();
  rep.abonar(50);

  if(confirm("¿Cliente autorizó y pagó el 50%?")){
    rep.autorizar();
  }else{
    return;
  }

  sucursal.agregar(rep);
  guardarDatos();
  render();

 }catch(err){
  alert(err.message);
 }

});

function render(){

 tabla.innerHTML="";

 sucursal.reparaciones.forEach((r,i)=>{

  tabla.innerHTML+=`
  <tr>
   <td>${r.cliente.nombre}</td>
   <td>${r.telefono.marca}</td>
   <td>${r.telefono.imei}</td>
   <td>${r.getEstado()}</td>
   <td>
     <button class="btn btn-success btn-sm" onclick="terminar(${i})">Terminar</button>
     <button class="btn btn-dark btn-sm" onclick="entregar(${i})">Entregar</button>
   </td>
  </tr>
  `
 })
}

function guardarDatos(){
 localStorage.setItem(
  "reparaciones",
  JSON.stringify(sucursal.reparaciones)
 );
}

function cargarDatos(){

 let data = localStorage.getItem("reparaciones");
 if(!data) return;

 let arr = JSON.parse(data);

 arr.forEach(r=>{

  let tel = new Telefono(
   r.telefono.serie,
   r.telefono.imei,
   r.telefono.marca,
   r.telefono.reportado
  );

  let cli = new Cliente(
   r.cliente.nombre,
   r.cliente.documento,
   r.cliente.autorizacion
  );

  let rep = new Reparacion(tel,cli);

  rep.diagnostico=r.diagnostico;
  rep.abono=r.abono;
  rep.costo=r.costo;
  rep.setEstado(r.estado);

  sucursal.agregar(rep);
 });

 render();
}

function terminar(i){
 sucursal.reparaciones[i].terminar();
 guardarDatos();
 render();
}

function entregar(i){
 try{
  sucursal.reparaciones[i].entregar();
  guardarDatos();
  render();
 }catch(e){
  alert(e.message);
 }
}

cargarDatos();