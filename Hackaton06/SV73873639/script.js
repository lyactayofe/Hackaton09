let modalAbierto = false;
const DB_SISTEMA = {
    modelos: {
        "Apple": ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 14", "iPhone 13", "iPhone 12"],
        "Samsung": ["Galaxy S24 Ultra", "Galaxy S23", "Galaxy Z Fold 5", "Galaxy A54"],
        "Honor": ["Magic 6 Pro", "Magic 5 Lite", "Honor 90", "Honor X9b"],
        "Oppo": ["Find X7 Ultra", "Reno 11 5G", "A78", "Find N3 Flip"],
        "Xiaomi": ["Xiaomi 14 Ultra", "Redmi Note 13 Pro", "Poco F5 Pro"],
        "Realme": ["Realme 12 Pro+", "Realme 11 Pro+", "C67"],
        "Huawei": ["Pura 70 Ultra", "Mate 60 Pro", "P60 Pro"],
        "Motorola": ["Edge 40 Pro", "Razr 40 Ultra", "Moto G84"],
        "Google": ["Pixel 8 Pro", "Pixel 7a", "Pixel Fold"],
        "Vivo": ["X100 Pro", "V30 Pro", "Y36"]
    },
    repuestos: [
        {nombre: "Pantalla Original", precio: 150},
        {nombre: "Batería Certificada", precio: 45},
        {nombre: "Módulo de Carga", precio: 30},
        {nombre: "Cámara Principal", precio: 85},
        {nombre: "Pin de Carga", precio: 25}
    ],
    tecnicos: [
        {nombre: "Carlos M.", skills: ["Apple", "Samsung", "Google"]},
        {nombre: "Ana R.", skills: ["Oppo", "Xiaomi", "Honor", "Huawei"]},
        {nombre: "Luis T.", skills: ["Apple", "Samsung", "Honor", "Oppo", "Xiaomi", "Realme", "Huawei", "Motorola", "Google", "Vivo"]},
        {nombre: "Marcos P.", skills: ["Xiaomi", "Huawei", "Honor", "Realme"]},
        {nombre: "Sofia L.", skills: ["Samsung", "Motorola", "Vivo"]},
        {nombre: "Diego H.", skills: ["Apple", "Google"]},
        {nombre: "Roberto F.", skills: ["Samsung", "Oppo", "Realme"]},
        {nombre: "Lucía G.", skills: ["Honor", "Huawei", "Xiaomi"]},
        {nombre: "Andrés B.", skills: ["Apple", "Motorola"]},
        {nombre: "Kevin S.", skills: ["Vivo", "Oppo", "Realme"]},
        {nombre: "Patricia V.", skills: ["Xiaomi", "Samsung"]},
        {nombre: "Ricardo J.", skills: ["Huawei", "Honor", "Google"]}
    ]
};

let ticketActivo = { cliente: "", fase: 0, logs: [], equipo: null, repuestosCargados: [], diagnostico: "", tecnicoAsignado: "", auth: false, pago: false };

function guardarEstado() { localStorage.setItem('zhouTicket', JSON.stringify(ticketActivo)); }

let historialGlobal = JSON.parse(localStorage.getItem('zhouHistorialGlobal')) || [];

function cerrarMagia() {
    document.getElementById("modal-magico").style.display = "none";
    modalAbierto = false;
}

// --- MODAL UNIVERSAL (creación y utilidades) ---
function lanzarAlerta(titulo, mensaje, tipo = "magia", callback = null) {
    if (modalAbierto) return; 
    modalAbierto = true;

    const modal = document.getElementById("modal-magico");
    const tituloEl = document.getElementById("titulo-magico");
    const mensajeEl = document.getElementById("mensaje-magico");
    const botones = document.getElementById("botones-magicos");

    // LÍNEA CLAVE: Borra todo lo anterior para que no se dupliquen los botones
    botones.innerHTML = ""; 
    
    tituloEl.innerHTML = titulo;
    mensajeEl.innerHTML = mensaje;

    if (callback) {
        // MODO CONFIRMACIÓN (Como tu imagen: botones Cancelar y Avanzar)
        const btnCancel = document.createElement("button");
        btnCancel.className = "btn-rojo";
        btnCancel.textContent = "CANCELAR";
        btnCancel.onclick = cerrarMagia;

        const btnOk = document.createElement("button");
        btnOk.className = "btn-verde";
        btnOk.textContent = "SÍ, AVANZAR";
        btnOk.onclick = () => {
            cerrarMagia();
            setTimeout(() => { callback(); }, 200);
        };

        botones.appendChild(btnCancel);
        botones.appendChild(btnOk);
    } else {
        // MODO ERROR (Solo un botón, NO permite avanzar si faltan datos)
        const btn = document.createElement("button");
        btn.className = "btn-rojo";
        btn.textContent = "ENTENDIDO";
        btn.onclick = cerrarMagia;
        botones.appendChild(btn);
    }

    modal.style.display = "flex";
}


// --- HISTORIAL MODAL (EMERGENTE) ---
function crearHistorialModal() {
    if (document.getElementById('historial-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'historial-modal';
    modal.className = 'modal-overlay hidden';
    // floating overlay centered above everything
    modal.style.cssText = 'position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index:10040; padding:24px;';
    modal.innerHTML = `
        <div id="historial-box" class="modal-content card" style="max-width:760px; width:100%; margin:0 auto; position:relative; border-radius:12px; padding:20px; box-shadow:0 20px 50px rgba(0,0,0,0.6);">
            <button id="historial-close" class="btn-close" style="position:absolute; right:14px; top:12px; z-index:10061;">✕</button>
            <h3 style="margin:0 0 12px 0; color:var(--neon-blue); text-align:left;">📚 HISTORIAL DE CLIENTES (FINALIZADOS)</h3>
            <div id="historial-content" style="max-height:60vh; overflow:auto; padding-top:8px;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // close handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal) ocultarHistorialModal();
    });
    document.getElementById('historial-close').addEventListener('click', ocultarHistorialModal);
}

function mostrarHistorialModal() {
    const modal = document.getElementById('historial-modal');
    if (!modal) return;
    modal.style.zIndex = 10040;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderizarPanelClientesModerno(); // asegurar contenido actualizado
    // focus close button for accessibility
    const closeBtn = document.getElementById('historial-close');
    if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', _escCloseHistorial);
}

function _escCloseHistorial(e){ if (e.key === 'Escape') ocultarHistorialModal(); }

function ocultarHistorialModal() {
    const modal = document.getElementById('historial-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', _escCloseHistorial);
} // <--- ¡ESTA ES LA LLAVE QUE FALTA!

// 2. Limpia el window.onload (quita la creación del modal)
window.onload = function() {
    const marcaSelect = document.getElementById('marca');
    if (marcaSelect) {
        marcaSelect.innerHTML = '<option value="" selected disabled>Seleccione marca</option>' + 
            Object.keys(DB_SISTEMA.modelos).map(m => `<option value="${m}">${m}</option>`).join('');
    }

    navegar('servicio');

    const backup = localStorage.getItem('zhouTicket');
    if (backup) {
        ticketActivo = JSON.parse(backup);
        if (ticketActivo.equipo) {
            document.getElementById('section-ingreso').classList.add('hidden');
            document.getElementById('section-fases').classList.remove('hidden');
            actualizarEstacion();
        }
    }
};
function cargarModelos() {
    const marca = document.getElementById('marca').value;
    const select = document.getElementById('modelo');
    
    // Si no hay marca seleccionada o hubo un error
    if (!DB_SISTEMA.modelos[marca]) { 
        select.innerHTML = ''; 
        select.disabled = true; 
        return; 
    }
    
    // Inyectamos una opción por defecto y luego los modelos correspondientes
    select.innerHTML = '<option value="" selected disabled>Seleccione modelo</option>' + 
                       DB_SISTEMA.modelos[marca].map(m => `<option value="${m}">${m.toUpperCase()}</option>`).join('');
    
    // Habilitamos el campo para que puedas interactuar
    select.disabled = false;
};
