

class Telefono {
    constructor(marca, imei, serie){
        this.marca = marca;
        this.imei = imei;
        this.serie = serie;
    }

    validarImei(){
        return /^\d{15}$/.test(this.imei);
    }
}

class Tecnico {
    constructor(nombre, skills){
        this.nombre = nombre;
        this.skills = skills;
    }
    puedeReparar(marca) {
        return this.skills.includes(marca);
    }
}

class Reparacion{
    constructor(telefono, diagnostico, costo, tecnico){
        this.telefono = telefono;
        this.diagnostico = diagnostico;
        this.costo = costo;
        this.tecnico = tecnico;
        this.repuestos = [];
        this.estado = "Recepcion";
        this.abono = 0;
        this.autorizado = false;
    }

    autorizar() {
        this.autorizado = true;
    }

    registrarAbono(monto) {
        this.abono = monto;
    }

    abonoValido() {
        return this.abono >= this.costo * 0.5;
    }

    agregarRepuesto(repuesto) {
        this.repuestos.push(repuesto);
    }

    cambiarEstado() {
        const estados = [
            "Diagnostico",
            "Recepcion",
            "Reparacion",
            "Equipo listo"
        ];

        let index = estados.indexOf(this.estado);
        if (index < estados.length - 1){
            this.estado = estados[index + 1];
        }
    }
}

class SistemaReparaciones {
    constructor() {
        this.tecnicos = [
            new Tecnico("Carlos", ["Apple", "apple"]),
            new Tecnico("Maria", ["Samsung", "Huawei", "samsung", "huawei"]),
            new Tecnico("Juan", ["Motorola", "Xiaomi", "motorola", "xiaomi"]),
        ];
        this.reparaciones = [];
    }
     
    buscarTecnico(marca){
        return this.tecnicos.find(t => t.puedeReparar(marca));
    }

    registrarReparacion(datos){

        const telefono = new Telefono(datos.marca, datos.imei, datos.serie);
       const tecnico = this.buscarTecnico(datos.marca);

       if(!tecnico){
        alert("No hay tecnico disponible para esas marca.");
        return;
       }

       const reparacion = new Reparacion(
        telefono, 
        datos.diagnostico,
        datos.costo,
        tecnico.nombre
       );

       if(!datos.autorizacion){
        alert("Se requiere autorizacion escrita");
        return;
       }

       reparacion.autorizar();
       reparacion.registrarAbono(datos.abono);

       if (!reparacion.abonoValido()){
        alert("Debe pagar por lo menos el 50%");
        return;
       }

       this.reparaciones.push(reparacion);
       this.mostrarReparaciones();
    }

    mostrarReparaciones(){
        const contenedor = document.getElementById("listaEquipos");
        contenedor.innerHTML = "";

        this.reparaciones.forEach((rep, index) => {

            const div = document.createElement("div");
            div.classList.add("card");

            div.innerHTML = `
                <strong>Marca:</strong>${rep.telefono.marca}<br>
                <strong>IMEI:</strong>${rep.telefono.imei}<br>
                <strong>Tecnico:</strong>${rep.tecnico}<br>
                <strong>Estado:</strong>${rep.estado}<br>
                <strong>Diagnostico:</strong>${rep.diagnostico}<br>
                <strong>Repuestos:</strong>${rep.repuestos.join(",") || "ninguno"}<br><br>
                <button onclick="sistema.cambiarEstado(${index})">Cambiar estado</button>
                <button onclick="sistema.agregarRepuesto(${index})">Agregar repuesto</button>
                <button onclick="sistema.entregar(${index})">Entregar</button>
            `;
            contenedor.appendChild(div);
        });
    }

    cambiarEstado(index){
        this.reparaciones[index].cambiarEstado();
        this.mostrarReparaciones();
    }

    agregarRepuesto(index) {
        const repuesto = prompt("Ingrese repuesto:");
        if (repuesto){
            this.reparaciones[index].agregarRepuesto(repuesto);
            this.mostrarReparaciones();
        }
    }  

    entregar(index){
        if(confirm("¿Seguro que desea entregar este equipo?")){
            this.reparaciones.splice(index, 1);
            this.mostrarReparaciones();
        }

    }
    
}

const sistema = new SistemaReparaciones();

document.getElementById("ingreso")
.addEventListener("submit", function(e){
    e.preventDefault();

    const datos = {
        marca: document.getElementById("marca").value.trim(),
        imei: document.getElementById("imei").value.trim(),
        serie: document.getElementById("serie").value.trim(),
        diagnostico: document.getElementById("diagnostico").value.trim(),
        costo: parseFloat(document.getElementById("costo").value),
        autorizacion: document.getElementById("autorizacion").checked,
        abono: parseFloat(document.getElementById("abono").value)
    };

    sistema.registrarReparacion(datos);
    this.reset();

    console.log("Equipo registrado")
});