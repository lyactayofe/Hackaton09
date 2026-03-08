console.log("Inicio de la aplicacion");

let objGato01={
    //propiedades o atributos que describen al objeto
    nombre: "Pancho",
    sexo: "Macho",
    peso: 4.5,
    color: "Atigrado",
    raza: "Mestiza",
    //metodos o funciones que describen el comportamiento del objeto
    dormir(){
        console.log("Se esta durmiendo")
    },
    despertar(){
         console.log("Se esta despertando")
    }
}

let objGato02={
    nombre: "Felipa",
    sexo: "Hembra",
    peso: 4,
    color: "Calico",
    raza: "Mestiza",
    dormir(){
        console.log("Felipa esta durmiendo")
    },
    despertar(){
         console.log("Se esta despertando")
    }
}

objGato01.despertar()
//abstraccion

//encapsulamiento

//herencia

//Polimorfismo

//Modularidad
let admin = true;



// let zV1 = new Television("00009","JVC","KTV0001","2025-10-25","LED",55,"GoogleTV");

// console.log(objTV1.nombre);

// let objTV2 = new Television("0009999","Samsung","Cristal","2022-09-01","OLED", 55,"Tizen");

// console.log(objTV2.modelo);

// objTV2.encender();
// objTV1.encender();

// objTV2.modelo = "Apple TV";

// console.log(objTV2.modelo);

// console.log(objTV1.getPrecio());

// objTV1.setPrecio(900);

// console.log(objTV1.getPrecio());

class Dispositivo{
    //  tipo: WIFI, BT, LAN, HDMI, Cable, BT-IN, Parlantes, BT-OUT
    constructor(tipo, isActivo=false){
        this.tipo = tipo;
        this.isActivo = isActivo;
    }
}


class Electrodomesticos{
    //  serie, marca,modelo,conectividad,precio,fechaCompra
    #costo=0
    constructor(serie, marca,modelo,conectividad,precio,fechaCompra= new Date()){
        
        this.serie = serie;
        //marca: JVC, Samsung, LG, Sony, etc
        this.marca = marca; 
        this.modelo = modelo;
        this.conectividad = conectividad;
        this.precio = precio;
        this.fechaCompra = fechaCompra;
    }
    //metodos
    encender(){
        //El metodo encender se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando,
        //ya que cada clase tiene su propia implementacion del metodo encender()
        console.log(`El electrodomestico ${this.marca} se esta encendiendo`)
    }
    apagar(){
        console.log(`El electrodomestico ${this.marca} se esta apagando`)
    }
    getCosto(){
        //El metodo getCosto solo puede ser accedido por el usuario admin,
        //lo que protege la informacion sensible del costo de los electrodomesticos
        if(admin)return this.#costo;
    }
    setCosto(newCosto){
        if(admin) this.#costo = newCosto;
    }
    
    conectarAlInternet(dispositivo){
        //WIFI, BT, LAN
        //Recorrer la lista de conectividad y activar el dispositivo que se le paso por parametro, desactivando los demas
        this.conectividad.forEach(element => {
            if(element.tipo === dispositivo){
                //El metodo conectarAlInternet se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando,
                //ya que cada clase tiene su propia implementacion del metodo conectarAlInternet()
                element.isActivo = true;
                console.log(`El dispositivo de conectividad ${element.tipo} se ha activado`)
            }
            else{
                element.isActivo = false;
                console.log(`El dispositivo de conectividad ${element.tipo} se ha desactivado`)
            }
        });
    }
}

//Linea Blanca: Refrigeradoras, Lavadoras, Microondas, etc
class LineaBlanca extends Electrodomesticos{
    constructor(serie, marca,modelo,conectividad,precio,fechaCompra){
        super(serie, marca,modelo,conectividad,precio,fechaCompra);
    }
}

//Linea Marron: Televisores, Equipos de sonido, etc
class LineaMarron extends Electrodomesticos{
    constructor(serie, marca,modelo,conectividad,precio,fechaCompra, entradas , salidas){
        super(serie, marca,modelo,conectividad,precio,fechaCompra);
        //entradas: HDMI, Cable, BT-IN
        this.entradas = entradas;
        //salidas: Parlantes, BT-OUT
        this.salidas = salidas;
    }
    cambiarEntrada(entrada){
        //Recorrer la lista de entradas y activar el dispositivo que se le paso por parametro, desactivando los demas
        //HDMI, Cable, BT-IN
        this.entradas.forEach(element=>{
            if(element.tipo === entrada){
                element.isActivo = true;
                console.log(`El dispositivo de entrada ${element.tipo} se ha activado`)
            }
            else{
                element.isActivo = false;
                console.log(`El dispositivo de entrada ${element.tipo} se ha desactivado`)
            }
        })
    }
    cambiarSalida(salida){
        this.salidas.forEach(element=>{
            if(element.tipo === salida){
                element.isActivo = true;
                console.log(`El dispositivo de salida ${element.tipo} se ha activado`)
            }
            else{
                element.isActivo = false;
                console.log(`El dispositivo de salida ${element.tipo} se ha desactivado`)
            }
        })
    }
}

//Televisores, Equipos de sonido, etc
//formato: 4K, FullHD, HD
//tamaño: 32, 55, 75
//Sistema Operativo: GoogleTV, Tizen, WebOS, AndroidTV
//Metodos: cambiarCanal(numeroCanal), encender(), apagar(), cambiarEntrada(entrada), cambiarSalida(salida)
//Polimorfismo: El metodo encender() se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando
//Encapsulamiento: El atributo costo solo puede ser accedido y modificado por el metodo getCosto() y setCosto(), respectivamente, y solo si el usuario es admin
//Abstraccion: El usuario no necesita conocer los detalles de como se implementa el metodo cambiarCanal() para poder utilizarlo, solo necesita saber que le tiene que pasar un numero de canal y el metodo se encargara del resto
//Herencia: La clase Television hereda los atributos y metodos de la clase LineaMarron, y la clase LineaMarron hereda los atributos y metodos de la clase Electrodomesticos
//Modularidad: El codigo esta organizado en clases y metodos, lo que facilita su mantenimiento y reutilizacion
//Ejemplo de polimorfismo: El metodo encender() se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando, ya que cada clase tiene su propia implementacion del metodo encender()
//Ejemplo de encapsulamiento: El atributo costo solo puede ser accedido y modificado por el metodo getCosto() y setCosto(), respectivamente, y solo si el usuario es admin, lo que protege la informacion sensible del costo de los electrodomesticos
//Ejemplo de abstraccion: El usuario no necesita conocer los detalles de como se implementa el metodo cambiarCanal() para poder utilizarlo, solo necesita saber que le tiene que pasar un numero de canal y el metodo se encargara del resto, lo que simplifica la interaccion del usuario con el electrodomestico
//Ejemplo de herencia: La clase Television hereda los atributos y metodos de la clase LineaMarron, y la clase LineaMarron hereda los atributos y metodos de la clase Electrodomesticos, lo que permite reutilizar codigo y evitar la duplicacion de codigo en las clases hijas
//Ejemplo de modularidad: El codigo esta organizado en clases y metodos, lo que facilita su mantenimiento y reutilizacion, ya que cada clase tiene una responsabilidad clara y definida, y los metodos permiten realizar acciones especificas sobre los objetos de cada clase
//Ejemplo de uso de la clase Television: Se crea un objeto de la clase Television con sus atributos y se utilizan sus metodos para realizar acciones sobre el objeto, como encenderlo, cambiar su entrada, cambiar su canal, etc.
//Ejemplo de uso de la clase LineaBlanca: Se crea un objeto de la clase LineaBlanca con sus atributos y se utiliza su metodo encender() para encender el electrodomestico, lo que demuestra el polimorfismo del metodo encender() ya que se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando
//Ejemplo de uso de la clase LineaMarron: Se crea un objeto de la clase LineaMarron con sus atributos y se utiliza su metodo cambiarEntrada() para cambiar la entrada del electrodomestico, lo que demuestra el polimorfismo del metodo cambiarEntrada() ya que se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando
//Ejemplo de uso de la clase Electrodomesticos: Se crea un objeto de la clase Electrodomesticos con sus atributos y se utiliza su metodo conectarAlInternet() para conectar el electrodomestico a internet, lo que demuestra el polimorfismo del metodo conectarAlInternet() ya que se comporta diferente dependiendo del tipo de electrodomestico que se este utilizando
//Ejemplo de uso de la clase Dispositivo: Se crea un objeto de la clase Dispositivo con sus atributos y se utiliza su metodo isActivo para verificar si el dispositivo esta activo o no, lo que demuestra el encapsulamiento del atributo isActivo ya que solo puede ser accedido a traves del metodo isActivo() y no directamente desde el objeto
//Ejemplo de uso de la clase Dispositivo: Se crea un objeto de la clase Dispositivo con sus atributos y se utiliza su metodo tipo para verificar el tipo de dispositivo, lo que demuestra el encapsulamiento del atributo tipo ya que solo puede ser accedido a traves del metodo tipo() y no directamente desde el objeto

class Television extends LineaMarron{
    constructor(serie, marca,modelo,conectividad,precio,fechaCompra, entradas , salidas,formato,tamaño,sistemaOperativo){
        super(serie, marca,modelo,conectividad,precio,fechaCompra, entradas , salidas);
        this.formato = formato;
        this.tamaño = tamaño;
        this.sistemaOperativo =sistemaOperativo;
    }
    cambiarCanal(numeroCanal){
        let exito = false;
        this.entradas.forEach(element=>{
            if(element.isActivo && element.tipo === "Cable"){
                exito =true;
                console.log(`La television ${this.marca} ${this.modelo} esta mostrando el canal ${numeroCanal}`);
            }
            if(!exito){
                console.log(`La television ${this.marca} ${this.modelo} no puede realizar esta accion`);
            }
        })
    }
    encender(){
        console.log(`La Television ${this.marca} ${this.modelo} se esta encendiendo`)
    }
}


//Creacion de objetos
//Serie, marca,modelo,conectividad,precio,fechaCompra, entradas , salidas,formato,tamaño,sistemaOperativo
//Conectividad: WIFI, BT, LAN
//Entradas: HDMI, Cable, BT-IN
//Salidas: Parlantes, BT-OUT
//Formato: 4K, FullHD, HD
//Tamaño: 32, 55, 75
//Sistema Operativo: GoogleTV, Tizen, WebOS, AndroidTV
//Ejemplo de creacion de un objeto de la clase Television
//Serie: "000001", marca: "JVC", modelo: "KTV0001", conectividad: [WIFI, BT, LAN], precio: 900.99, fechaCompra: null, entradas: [HDMI, Cable, BT-IN], salidas: [Parlantes, BT-OUT], formato: 4K, tamaño: 55, sistemaOperativo: GoogleTV
let objTV0001 = new Television("000001","JVC","KTV0001",[
    new Dispositivo("WIFI"),
    new Dispositivo("BT"),
    new Dispositivo("LAN",true)
],900.99,null,[
    new Dispositivo("HDMI"),
    new Dispositivo("Cable", true),
    new Dispositivo("BT-IN")
],[
    new Dispositivo("Parlantes"),
    new Dispositivo("BT-OUT")
],"4K",55,"GoogleTV");
console.log(objTV0001)


objTV0001.apagar();
objTV0001.conectarAlInternet("WIFI");
objTV0001.cambiarEntrada("HDMI");

objTV0001.cambiarEntrada("Cable");
objTV0001.cambiarCanal(88);

objTV0001.encender();

let objLineaBlanca = new LineaBlanca("ttttt","Sony", "3333",[],99,null);

objLineaBlanca.encender()