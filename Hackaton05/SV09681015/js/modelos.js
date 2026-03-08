// ============================
// BASE DE DATOS DE MODELOS
// ============================

const BASE_MODELOS = {
    Samsung: ["S21", "S22", "S23", "A54"],
    Apple: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14"],
    Xiaomi: ["Redmi Note 11", "Redmi Note 12", "Mi 11"],
    Motorola: ["Moto G20", "Moto G30", "Moto G60"],
    Huawei: ["P30", "P40", "Mate 20"]
};

// ============================
    // LISTA NEGRA IMEI
    // ============================
const IMEIS_BLOQUEADOS = [
        "123456789012345",
        "987654321098765",
        "111111111111111"
    ];

// ============================
// CLASE REPARACION
// ============================

class Reparacion {

    constructor(cliente, imei, serie, marca, modelo, sistema) {
        this.cliente = cliente;
        this.imei = imei;
        this.serie = serie;
        this.marca = marca;
        this.modelo = modelo;
        this.sistema = sistema;

        this.fechaIngreso = new Date();   // 👈 NUEVO

        this.diagnostico = "";
        this.costoBase = 0;
        this.repuestos = [];
        this.total = 0;

        this.autorizado = false;
        this.abono = 0;

        this.tecnico = "";
        this.estado = "En reparación";
    }

    agregarRepuesto(nombre, precio) {
        this.repuestos.push({
            nombre: nombre,
            precio: precio
        });
        this.calcularTotal();
    }

    calcularTotal() {
        let totalRepuestos = 0;
        this.repuestos.forEach(r => {
            totalRepuestos += r.precio;
        });

        this.total = Number(this.costoBase) + totalRepuestos;
    }

    calcularAbonoMinimo() {
        return this.total * 0.5;
    }

    eliminarRepuesto(index) {
        this.repuestos.splice(index, 1);
        this.calcularTotal();
    }

}