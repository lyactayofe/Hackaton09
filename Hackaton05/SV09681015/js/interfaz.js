let reparaciones = [];
let reparacionActual = null;
let modoEdicion = false;   // 🔥 ESTA FALTABA
let indexEdicion = null;   // 🔥 Y ESTA TAMBIÉN
let tecnicos = [];
let pasoActual = 0;
let paginaActual = 1;
const registrosPorPagina = 10;

const pantallas = [
    "pantalla-recepcion",
    "pantalla-diagnostico",
    "pantalla-autorizacion",
    "pantalla-reparacion",
    "pantalla-entrega"
];

// ============================
// CAMBIO DE PANTALLA
// ============================

function mostrarPaso(index) {

    // Ocultar pantallas
    pantallas.forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });

    document.getElementById(pantallas[index]).classList.remove("hidden");

    pasoActual = index;

    const steps = document.querySelectorAll(".progress .step");

    steps.forEach((step, i) => {
        step.classList.remove("active");
        if (i === index) {
            step.classList.add("active");
        }
    });
}

// ============================
// RECEPCION
// ============================
function guardarRecepcion() {

    limpiarMensaje();

    const cliente = document.getElementById("cliente").value.trim();
    const imei = document.getElementById("imei").value.trim();
    const serie = document.getElementById("serie").value.trim();
    const marca = document.getElementById("marca").value;
    const modelo = document.getElementById("modelo").value;
    const sistema = document.getElementById("sistema").value;

    if (!cliente || !imei || !marca || !modelo) {
        mostrarMensaje("Complete los campos obligatorios", "error");
        return;
    }

    // VALIDACIÓN IMEI BLOQUEADO
    if (IMEIS_BLOQUEADOS.includes(imei)) {
        mostrarMensaje("Este IMEI está reportado como robado o perdido. No se puede registrar.", "error");
        return;
    }

    reparacionActual = new Reparacion(
        cliente, imei, serie, marca, modelo, sistema
    );

    mostrarMensaje("Recepción registrada correctamente", "exito");

    mostrarPaso(1);
}

// ============================
// SISTEMA DE MENSAJES UI
// ============================

function mostrarMensaje(texto, tipo = "error") {

    const div = document.getElementById("mensajeSistema");

    div.classList.remove("hidden");
    div.classList.remove("mensaje-error", "mensaje-exito");

    if (tipo === "error") {
        div.classList.add("mensaje-error");
        div.innerHTML = `❌ ${texto}`;
    } else {
        div.classList.add("mensaje-exito");
        div.innerHTML = `✅ ${texto}`;
    }

    div.scrollIntoView({ behavior: "smooth" });

    // Auto ocultar después de 3 segundos
    setTimeout(() => {
        limpiarMensaje();
    }, 2000);
}

function limpiarMensaje() {
    const div = document.getElementById("mensajeSistema");
    div.classList.add("hidden");
    div.innerHTML = "";
}
// ============================
// DIAGNOSTICO
// ============================

function agregarRepuesto() {

    const nombre = document.getElementById("repNombre").value;
    const precio = parseFloat(document.getElementById("repPrecio").value);

    if (!nombre || isNaN(precio)) {
        mostrarMensaje("Ingrese nombre y precio válido", "error");
        return;
    }

    reparacionActual.agregarRepuesto(nombre, precio);

    document.getElementById("repNombre").value = "";
    document.getElementById("repPrecio").value = "";

    actualizarListaRepuestos();
    actualizarTotalDiagnostico();
}

function actualizarTotalDiagnostico() {

    if (!reparacionActual) return;

    const totalRepuestos = reparacionActual.repuestos
        .reduce((sum, rep) => sum + rep.precio, 0);

    reparacionActual.total = reparacionActual.costoBase + totalRepuestos;

    const span = document.getElementById("totalDiagnostico");
    if (span) {
        span.textContent = reparacionActual.total.toFixed(2);
    }
}

function actualizarListaRepuestos() {

    const lista = document.getElementById("listaRepuestos");
    lista.innerHTML = "";

    reparacionActual.repuestos.forEach((r, index) => {

        const item = document.createElement("div");
        item.classList.add("repuesto-item");

        item.innerHTML = `<br>
            <div class="repuesto-info">
                <span class="repuesto-nombre">${r.nombre}</span>
                <span class="repuesto-precio">$${r.precio}</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarRepuestoDiagnostico(${index})">
                ❌
            </button>
        `;

        lista.appendChild(item);
    });
}

function guardarDiagnostico() {

    const diagnostico = document.getElementById("diagnostico").value;
    const costo = parseFloat(document.getElementById("costo").value);

    if (isNaN(costo)) {
        mostrarMensaje("Ingrese costo base válido", "error");
        return;
    }

    reparacionActual.diagnostico = diagnostico;
    reparacionActual.costoBase = costo;
    console.log(reparacionActual);
    console.log(reparacionActual instanceof Reparacion);
    console.log(typeof reparacionActual.calcularTotal);
    reparacionActual.calcularTotal();

    document.getElementById("abonoMinimo").textContent =
        reparacionActual.calcularAbonoMinimo();

    mostrarMensaje("Diagnostico registrada correctamente", "exito");

    mostrarPaso(2);
}

function eliminarRepuestoDiagnostico(index) {

    reparacionActual.eliminarRepuesto(index);

    actualizarListaRepuestos();
}

function volver() {

    if (pasoActual > 0) {
        mostrarPaso(pasoActual - 1);
    }
}

// ============================
// AUTORIZACION
// ============================

function guardarAutorizacion() {

    const autorizado = document.getElementById("autorizado").checked;
    const abono = parseFloat(document.getElementById("abono").value);

    const minimo = reparacionActual.calcularAbonoMinimo();

    if (!autorizado) {
        mostrarMensaje("Debe estar autorizado", "error");
        return;
    }

    if (isNaN(abono) || abono < minimo) {
        mostrarMensaje("El abono debe ser mínimo 50%: $" + minimo);
        return;
    }

    reparacionActual.autorizado = autorizado;
    reparacionActual.abono = abono;

    mostrarMensaje("Autorizacion registrada correctamente", "exito");

    actualizarSelectTecnicos();   // 👈 AQUÍ VA

    mostrarPaso(3);
}

// ============================
// REPARACION
// ============================

function guardarReparacion() {

    const tecnico = document.getElementById("tecnico").value;

    if (!tecnico) {
        mostrarMensaje("Seleccione técnico", "error");
        return;
    }

    reparacionActual.tecnico = tecnico;

    mostrarMensaje("Reparacion Asignada correctamente", "exito");

    mostrarPaso(4);
    mostrarResumen();
}

// ============================
// RESUMEN
// ============================

function mostrarResumen() {

    const div = document.getElementById("resumen");

    div.innerHTML = `
        <p><strong>Cliente:</strong> ${reparacionActual.cliente}</p>
        <p><strong>Equipo:</strong> ${reparacionActual.marca} ${reparacionActual.modelo}</p>
        <p><strong>Total:</strong> $${reparacionActual.total}</p>
        <p><strong>Técnico:</strong> ${reparacionActual.tecnico}</p>
    `;

}

function finalizarProceso() {

    capturarDatosFormulario();

    // 🔥 Guardar fecha de modificación
    reparacionActual.ultimaModificacion = new Date().toISOString();

    if (modoEdicion) {
        reparaciones[indexEdicion] = reparacionActual;
        modoEdicion = false;
        indexEdicion = null;
    } else {
        reparaciones.push(reparacionActual);
    }

    guardarEnLocalStorage();
    generarTabla();
    actualizarContadorActivos();

    limpiarSistema();

    // 🔥 Restaurar botón
    document.getElementById("btnFinalizar").textContent = "Finalizar";

    mostrarPaso(0);
    mostrarMensaje("Registro guardado con éxito", "exito");
}

function finalizarReparacion(index) {

    reparaciones[index].estado = "Finalizado";

    guardarEnLocalStorage();
    generarTabla();
    actualizarContadorActivos();
}

// ============================
// EDICIÓN DE REPARACIÓN
// ============================

function actualizarReparacion() {

    if (!modoEdicion || indexEdicion === null) return;

    capturarDatosFormulario();

    reparaciones[indexEdicion] = reparacionActual;

    guardarEnLocalStorage();
    generarTabla();
    actualizarContadorActivos();

    modoEdicion = false;
    indexEdicion = null;
    reparacionActual = null;

    limpiarFormulario();
}

function editarReparacion(index) {

    reparacionActual = reparaciones[index]; // 🔥 CLAVE

    modoEdicion = true;
    indexEdicion = index;

    cargarReparacionEnFormulario(reparacionActual);

    mostrarPaso(1); // si usas wizard
}

function recalcularTotal() {

    let totalRepuestos = 0;

    if (reparacionActual.repuestos && reparacionActual.repuestos.length > 0) {
        reparacionActual.repuestos.forEach(r => {
            totalRepuestos += parseFloat(r.precio) || 0;
        });
    }

    const costoBase = reparacionActual.costo || 0;

    reparacionActual.total = costoBase + totalRepuestos;

    const label = document.getElementById("totalDiagnostico");
    if (label) {
        label.textContent = reparacionActual.total.toFixed(2);
    }
}

function capturarDatosFormulario() {

    if (!reparacionActual) return;

    // 🔹 DATOS GENERALES
    reparacionActual.cliente = document.getElementById("cliente").value;
    reparacionActual.imei = document.getElementById("imei").value;
    reparacionActual.serie = document.getElementById("serie").value;
    reparacionActual.marca = document.getElementById("marca").value;
    reparacionActual.modelo = document.getElementById("modelo").value;
    reparacionActual.sistema = document.getElementById("sistema").value;

    // 🔹 DIAGNÓSTICO
    reparacionActual.diagnostico = document.getElementById("diagnostico").value;
    reparacionActual.costoBase =
        parseFloat(document.getElementById("costo").value) || 0;

    // 🔹 AUTORIZACIÓN
    reparacionActual.autorizado =
        document.getElementById("autorizado").checked;

    reparacionActual.abono =
        parseFloat(document.getElementById("abono").value) || 0;

    reparacionActual.tecnico =
        document.getElementById("tecnico").value;
    reparacionActual.calcularTotal();
    // 🔥 Recalcular total
    /*recalcularTotal();*/
}

function cargarReparacionEnFormulario(reparacion) {

    if (!reparacion) return;

    // 🔹 DATOS GENERALES
    document.getElementById("cliente").value = reparacion.cliente || "";
    document.getElementById("imei").value = reparacion.imei || "";
    document.getElementById("serie").value = reparacion.serie || "";
    document.getElementById("marca").value = reparacion.marca || "";
    document.getElementById("modelo").value = reparacion.modelo || "";
    document.getElementById("sistema").value = reparacion.sistema || "";

    // 🔹 DIAGNÓSTICO
    document.getElementById("diagnostico").value =
        reparacion.diagnostico || "";

    document.getElementById("costo").value =
        reparacion.costoBase || "";

    document.getElementById("totalDiagnostico").textContent =
        reparacion.total || "0";

    // 🔹 REPUESTOS
    actualizarListaRepuestos(); // usa reparacionActual

    // 🔹 AUTORIZACIÓN
    document.getElementById("autorizado").checked =
        reparacion.autorizado || false;

    document.getElementById("abono").value =
        reparacion.abono || "";

    document.getElementById("abonoMinimo").textContent =
        reparacion.abonoMinimo || "0";

    // 🔹 REPARACIÓN
    document.getElementById("tecnico").value =
        reparacion.tecnico || "";

    reparacion.calcularTotal();
    document.getElementById("totalDiagnostico").textContent =
        reparacion.total;
}

// ============================
// GESTIÓN DE TÉCNICOS
// ============================

function guardarTecnicos() {
    localStorage.setItem("tecnicos", JSON.stringify(tecnicos));
}

function cargarTecnicos() {
    const data = localStorage.getItem("tecnicos");
    if (data) {
        tecnicos = JSON.parse(data);
    }
}

function guardarTecnico() {

    const nombre = document.getElementById("nombreTecnico").value.trim();
    const id = document.getElementById("idTecnico").value.trim();

    const skillSelect = document.getElementById("skill");
    const skills = Array.from(skillSelect.selectedOptions).map(opt => opt.value);

    if (!nombre || !id || skills.length === 0) {
        mostrarToast("Complete nombre, ID y al menos un skill");
        return;
    }

    if (tecnicos.some(t => t.id === id)) {
        mostrarToast("ID ya existe");
        return;
    }

    tecnicos.push({ nombre, id, skills });

    guardarTecnicos();
    generarListaTecnicos();
    actualizarSelectTecnicos();

    mostrarToast("Técnico creado correctamente");
    document.getElementById("nombreTecnico").value = "";
    document.getElementById("idTecnico").value = "";
    document.getElementById("skill").selectedIndex = -1;

    localStorage.setItem("tecnicos", JSON.stringify(tecnicos));
}

function generarListaTecnicos() {

    const contenedor = document.getElementById("listaTecnicos");
    contenedor.innerHTML = "";

    tecnicos.forEach(t => {

        // 🔥 CONTAR REPARACIONES ACTIVAS
        const activas = reparaciones.filter(r =>
            r.tecnico === t.id && r.estado !== "Entregado"
        ).length;

        const skillsHTML = t.skills
            ? t.skills.map(skill =>
                `<span class="skill-badge">${skill}</span>`
            ).join("")
            : "";

        contenedor.innerHTML += `
            <div class="card-tecnico">
                <div class="card-header">
                    👨‍🔧 <strong>${t.nombre}</strong>
                </div>

                <div class="card-body">
                    <p><strong>ID:</strong> ${t.id}</p>
                    <p>Reparaciones activas: ${activas}</p>
                    <div class="skills-container">
                        ${skillsHTML}
                    </div>
                </div>
            </div>
        `;
    });
}

function actualizarSelectTecnicos() {

    const select = document.getElementById("tecnico");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione técnico</option>`;

    // 🔴 Si no hay reparación activa, salir
    if (!reparacionActual) return;

    const marcaEquipo = reparacionActual.marca;

    const tecnicosFiltrados = tecnicos.filter(t =>
        Array.isArray(t.skills) && t.skills.includes(marcaEquipo)
    );

    tecnicosFiltrados.forEach(t => {
        const option = document.createElement("option");
        option.value = t.id;
        option.textContent = `${t.nombre} - ${t.skills.join(", ")}`;
        select.appendChild(option);
    });
}

function toggleTecnicos(event) {

    const panel = document.getElementById("panelTecnicos");
    if (!panel) return;

    panel.classList.toggle("hidden");

    const btn = event.target;

    if (panel.classList.contains("hidden")) {
        btn.textContent = "Mostrar";
    } else {
        btn.textContent = "Ocultar";
    }
}

function mostrarPantallaReparacion() {
    cargarTecnicos()
    actualizarSelectTecnicos();
    mostrarPaso(3); // o lo que uses
}

// ============================
// TABLA
// ============================

function generarTabla(filtroCliente = "", filtroEstado = "") {

    const contenedor = document.getElementById("tablaReparaciones");

    let html = `
        <table class="tabla-reparaciones">
            <tr>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
    `;

    // 🔹 Filtrar y ordenar datos
    const datosFiltrados = reparaciones
        .map((r, i) => ({ ...r, indexReal: i }))
        .filter(r =>
            r.cliente.toLowerCase().includes(filtroCliente.toLowerCase()) &&
            (filtroEstado === "" || r.estado === filtroEstado)
        )
        .sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));

    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

    // 🔹 Evitar que la página actual se pase del límite
    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas || 1;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;

    const datosPaginados = datosFiltrados.slice(inicio, fin);

    // 🔹 Generar filas
    datosPaginados.forEach((r) => {

        const fecha = new Date(r.fechaIngreso).toLocaleString();

        let claseEstado = "";

        if (r.estado === "En reparación") {
            claseEstado = "estado-reparacion";
        }
        else if (r.estado === "Reparado") {
            claseEstado = "estado-reparado";
        }
        else if (r.estado === "Entregado") {
            claseEstado = "estado-entregado";
        }

        html += `
            <tr>
                <td>${r.cliente}</td>
                <td>${r.marca} ${r.modelo}</td>
                <td>${fecha}</td>
                <td>$${r.total}</td>
                <td><span class="${claseEstado}">${r.estado}</span></td>
                <td>
                    <button onclick="marcarReparado(${r.indexReal})">Reparado</button>
                    <button onclick="marcarEntregado(${r.indexReal})">Entregado</button>
                    <button onclick="verDetalle(${r.indexReal})">👁️</button>
                    <button 
                            onclick="editarReparacion(${r.indexReal})"
                            ${r.estado === "Entregado" ? "disabled" : ""}>
                            ✏️
                    </button>
                    <button onclick="eliminarReparacion(${r.indexReal})">❌</button>
                </td>
            </tr>
        `;
    });

    html += `</table>`;

    // 🔹 Controles de paginación
    if (totalPaginas > 1) {
        html += `
            <div class="paginacion">
                <button onclick="cambiarPagina(-1)" ${paginaActual === 1 ? "disabled" : ""} class="btn-back">
                    ⬅ Anterior
                </button>
                <span>Página ${paginaActual} de ${totalPaginas}</span>
                <button onclick="cambiarPagina(1)" ${paginaActual === totalPaginas ? "disabled" : ""} class="btn-next">
                    Siguiente ➡
                </button>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

function cambiarPagina(direccion) {
    paginaActual += direccion;

    generarTabla(
        document.getElementById("buscarCliente").value,
        document.getElementById("filtroEstado").value
    );
}

function marcarReparado(index) {
    reparaciones[index].estado = "Reparado";
    guardarEnLocalStorage();   // 👈
    generarTabla();
    actualizarContadorActivos();
}

function marcarEntregado(index) {
    reparaciones[index].estado = "Entregado";
    guardarEnLocalStorage();   // 👈
    generarTabla();
    actualizarContadorActivos();
}

function eliminarReparacion(index) {
    abrirModalConfirmacion(() => {
        reparaciones.splice(index, 1);
        guardarEnLocalStorage();
        generarTabla();
        actualizarContadorActivos();
        mostrarToast("Reparación eliminada correctamente");
    });
}

function abrirModalConfirmacion(callback) {
    const modal = document.getElementById("modalConfirmacion");
    const btnConfirmar = document.getElementById("btnConfirmarEliminar");

    modal.classList.remove("hidden");

    btnConfirmar.onclick = function () {
        callback();
        cerrarModal();
    };
}

function cerrarModal() {
    document.getElementById("modalConfirmacion").classList.add("hidden");
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2500);
}

function toggleTabla() {

    const contenedor = document.getElementById("contenedorTabla");
    const boton = document.getElementById("btnToggleTabla");

    const visible = !contenedor.classList.contains("hidden");

    contenedor.classList.toggle("hidden");

    boton.innerHTML = visible
        ? "Mostrar ⬇"
        : "Ocultar ⬆";
}

function limpiarSistema() {
    // 🔹 LIMPIAR CAMPOS RECEPCIÓN
    document.getElementById("cliente").value = "";
    document.getElementById("imei").value = "";
    document.getElementById("serie").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("modelo").innerHTML = '<option value="">Seleccionar Modelo</option>';
    document.getElementById("sistema").value = "";

    // 🔹 LIMPIAR DIAGNÓSTICO
    document.getElementById("diagnostico").value = "";
    document.getElementById("costo").value = "";
    document.getElementById("repNombre").value = "";
    document.getElementById("repPrecio").value = "";
    document.getElementById("totalDiagnostico").textContent = "0";
    document.getElementById("listaRepuestos").innerHTML = "";

    // 🔹 LIMPIAR AUTORIZACIÓN
    document.getElementById("autorizado").checked = false;
    document.getElementById("abono").value = "";
    document.getElementById("abonoMinimo").textContent = "0";

    // 🔹 LIMPIAR REPARACIÓN
    document.getElementById("tecnico").value = "";

    // 🔹 REINICIAR OBJETO
    reparacionActual = null;// todo el bloque de limpieza aquí
}

// ============================
// DETALLE DE REPARACIÓN
// ============================

function verDetalle(index) {

    const r = reparaciones[index];
    const contenedor = document.getElementById("detalleReparacion");
    const tecnicoObj = tecnicos.find(t => t.id === r.tecnico);
    const nombreTecnico = tecnicoObj ? tecnicoObj.nombre : "No asignado";

    let listaRepuestos = "";

    if (r.repuestos.length === 0) {
        listaRepuestos = "<p>No tiene repuestos</p>";
    } else {
        listaRepuestos = "<ul>";
        r.repuestos.forEach(rep => {
            listaRepuestos += `<li>${rep.nombre} - $${rep.precio}</li>`;
        });
        listaRepuestos += "</ul>";
    }

    contenedor.innerHTML = `<br>
        <div style="border:1px solid #ccc; padding:15px; border-radius:8px; background:white">
            <div><h3>Detalle de Reparación</h3></div>
            <div><h3><strong>Cliente:</strong> ${r.cliente}</h3></div>
            <div class="detalle-grid" >
                <p><strong>Equipo:</strong> ${r.marca} ${r.modelo}</p>
                <p><strong>IMEI:</strong> ${r.imei}</p>
                <p><strong>Serie:</strong> ${r.serie}</p>
                <p><strong>Sistema:</strong> ${r.sistema}</p>
                <p><strong>Fecha ingreso:</strong> ${new Date(r.fechaIngreso).toLocaleString()}</p>
                <p><strong>Diagnóstico:</strong> ${r.diagnostico}</p>
                <p><strong>Costo Reparacion:</strong> $${r.costoBase}</p>
                <p><strong>Costo Total:</strong> $${r.total}</p>
                <p><strong>Abono:</strong> $${r.abono}</p>
                <p><strong>Técnico:</strong> ${nombreTecnico}</p>
                <p><strong>Estado:</strong> ${r.estado}</p>
            </div>
            <div>
                <p><strong>Repuestos:</strong></p>
                ${listaRepuestos}
            </div>
            <button onclick="cerrarDetalle()" class="btn-cerrar">Cerrar</button>
        </div>
    `;

    contenedor.classList.remove("hidden");
    contenedor.scrollIntoView({ behavior: "smooth" });
}

function cerrarDetalle() {
    document.getElementById("detalleReparacion").classList.add("hidden");
}

// ============================
// PERSISTENCIA LOCALSTORAGE
// ============================

function guardarEnLocalStorage() {
    localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
}

function cargarDesdeLocalStorage() {

    const data = localStorage.getItem("reparaciones");

    if (data) {
        const array = JSON.parse(data);

        // Reconstruir objetos como clase Reparacion
        reparaciones = array.map(obj => {

            const r = new Reparacion(
                obj.cliente,
                obj.imei,
                obj.serie,
                obj.marca,
                obj.modelo,
                obj.sistema
            );

            r.fechaIngreso = new Date(obj.fechaIngreso);
            r.diagnostico = obj.diagnostico;
            r.costoBase = obj.costoBase;
            r.repuestos = obj.repuestos;
            /*r.total = 0;*/
            r.calcularTotal();
            /*r.total = obj.total;*/
            r.autorizado = obj.autorizado;
            r.abono = obj.abono;
            r.tecnico = obj.tecnico;
            r.estado = obj.estado;

            return r;
        });

        generarTabla();
        actualizarContadorActivos();
    }
}

function actualizarContadorActivos() {

    const activos = reparaciones.filter(r =>
        r.estado === "En reparación" || r.estado === "Reparado"
    ).length;

    document.getElementById("contadorActivos").textContent = activos;
}

// ============================
// CARGAR MODELOS POR MARCA
// ============================

document.getElementById("marca").addEventListener("change", function () {

    const marca = this.value;
    const modeloSelect = document.getElementById("modelo");

    modeloSelect.innerHTML = '<option value="">Seleccionar Modelo</option>';

    if (BASE_MODELOS[marca]) {
        BASE_MODELOS[marca].forEach(m => {
            const option = document.createElement("option");
            option.textContent = m;
            option.value = m;
            modeloSelect.appendChild(option);
        });
    }

});
document.addEventListener("DOMContentLoaded", function () {
    cargarDesdeLocalStorage();
});
document.getElementById("buscarCliente").addEventListener("input", function () {
    generarTabla(
        this.value,
        document.getElementById("filtroEstado").value
    );
});
document.getElementById("filtroEstado").addEventListener("change", function () {
    generarTabla(
        document.getElementById("buscarCliente").value,
        this.value
    );
});
document.getElementById("costo").addEventListener("input", function () {

    if (!reparacionActual) return;

    reparacionActual.costoBase = parseFloat(this.value) || 0;
    reparacionActual.calcularTotal();

    document.getElementById("totalDiagnostico").textContent =
        reparacionActual.total;
});
document.addEventListener("DOMContentLoaded", function () {
    cargarTecnicos();
    actualizarSelectTecnicos();
});
window.onload = function () {

    const tecnicosGuardados = localStorage.getItem("tecnicos");

    if (tecnicosGuardados) {
        tecnicos = JSON.parse(tecnicosGuardados);
    }

    generarListaTecnicos();
    actualizarSelectTecnicos();
};