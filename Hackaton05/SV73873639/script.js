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
    if (!DB_SISTEMA.modelos[marca]) { select.innerHTML = ''; select.disabled = true; return; }
    select.innerHTML = DB_SISTEMA.modelos[marca].map(m => `<option value="${m}">${m.toUpperCase()}</option>`).join('');
    select.disabled = false;
}

document.getElementById('repair-form').onsubmit = function(e) {
    e.preventDefault();

    const imei = document.getElementById('imei').value;
    const serie = document.getElementById('serie').value;
    const cliente = document.getElementById('cliente').value;
    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    
    // Validación de longitud estricta (IMEI 15, Serie 10)
    if (!imei || imei.length !== 15 || !serie || serie.length !== 10) {
        // Aquí NO enviamos el cuarto parámetro (callback), así NO aparece el botón verde
        return lanzarAlerta(
            "⚠ DATOS INVÁLIDOS",
            `El equipo no puede ingresar al sistema:<br><br>
            • IMEI: Debe tener 15 números (tienes ${imei.length})<br>
            • Serie: Debe tener 10 números (tienes ${serie.length})`,
            'magia'
        );
    }

    ticketActivo.cliente = cliente;
    ticketActivo.equipo = { marca, modelo, imei, serie };
    
    document.getElementById('section-ingreso').classList.add('hidden');
    document.getElementById('section-fases').classList.remove('hidden');
    
    actualizarEstacion();
};

function actualizarEstacion() {
    const area = document.getElementById('fase-dinamica');
    const barra = document.getElementById('main-progress');
    
    const statusEl = document.getElementById('status-display');
    if (statusEl) statusEl.innerHTML = `<b>FASE DE SISTEMA:</b> ${ticketActivo.fase + 1}`;

    if (ticketActivo.fase === 0) {
        if (barra) barra.style.width = "25%";
        if (area) area.innerHTML = `
            <div class="field-group">
                <label>DIAGNÓSTICO INICIAL (REVISIÓN):</label>
                <textarea id="diag" oninput="ticketActivo.diagnostico=this.value; guardarEstado()">${ticketActivo.diagnostico}</textarea>
            </div>`;
    } 
    else if (ticketActivo.fase === 1) {
        if (barra) barra.style.width = "50%";
        if (area) area.innerHTML = `
            <div class="card">
                <label class="checkbox-line">
                    <input type="checkbox" id="c1" ${ticketActivo.auth?'checked':''} onchange="ticketActivo.auth=this.checked; guardarEstado()"> Autorización de Usuario
                </label>
                <label class="checkbox-line">
                    <input type="checkbox" id="c2" ${ticketActivo.pago?'checked':''} onchange="ticketActivo.pago=this.checked; guardarEstado()"> Abono del 50% Confirmado
                </label>
            </div>`;
    } 
    else if (ticketActivo.fase === 2) {
        if (barra) barra.style.width = "75%";
        const marcaActual = ticketActivo.equipo.marca;

        const tablaHTML = DB_SISTEMA.tecnicos.map(t => {
            const esApto = t.skills.includes(marcaActual);
            const dotClass = esApto ? 'green' : 'red';
            
            return `
            <div class="tecnico-row">
                <div class="flex-row">
                    <span class="status-dot ${dotClass}"></span>
                    <span>${t.nombre}</span>
                </div>
                <span class="tech-status">${esApto ? 'Especialista' : 'No Apto'}</span>
                
                <div class="skills-info">
                    <span class="skills-title">HABILIDADES DE ${t.nombre.toUpperCase()}:</span>
                    ${t.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
            </div>`;
        }).join('');

        if (area) area.innerHTML = `
        <div class="info-ticket-header">
            <div><label>CLIENTE</label><br><b>${ticketActivo.cliente}</b></div>
            <div class="info-divider"></div>
            <div><label>EQUIPO</label><br><b>${ticketActivo.equipo.marca} ${ticketActivo.equipo.modelo}</b></div>
        </div>

        <div class="field-grid">
            <div>
                <div class="field-group">
                    <label>TÉCNICO SELECCIONADO:</label>
                    <select id="change-tech" onchange="ticketActivo.tecnicoAsignado=this.value; guardarEstado()">
                        <option value="" disabled ${!ticketActivo.tecnicoAsignado ? 'selected' : ''}>Selecciona un técnico...</option>
                        ${DB_SISTEMA.tecnicos.map(t => `<option value="${t.nombre}" ${t.nombre==ticketActivo.tecnicoAsignado?'selected':''}>${t.nombre}</option>`).join('')}
                    </select>
                </div>
                <div class="field-group">
                    <label>REPUESTOS:</label>
                    <div class="flex-row">
                        <select id="sel-rep">${DB_SISTEMA.repuestos.map((r,i) => `<option value="${i}">${r.nombre} ($${r.precio})</option>`).join('')}</select>
                        <button onclick="addRepuesto()" class="btn-neon-blue btn-inline">+</button>
                    </div>
                    <div id="lista-r" class="repuestos-lista">${ticketActivo.repuestosCargados.map(r=>`• ${r.nombre}`).join('<br>')}</div>
                </div>
            </div>
            <div>
                <label>PLANTILLA DE TÉCNICOS:</label>
                <div class="tech-table-container">${tablaHTML}</div>
            </div>
        </div>`;
    } else {
        if (barra) { barra.style.width = "100%"; barra.classList.add('success'); }
        if (area) area.innerHTML = `
            <h2 style="text-align:center; color:var(--neon-green); margin-bottom: 20px;">✓ REPARACIÓN FINALIZADA</h2>
            <button onclick="finalizarYRegistrar()" class="btn-neon-pink">GUARDAR EN HISTORIAL Y NUEVO TICKET</button>`;
        const btnNext = document.getElementById('btn-next');
        if (btnNext) btnNext.classList.add('hidden');
    }
    guardarEstado();
}

function addRepuesto() {
    const sel = document.getElementById('sel-rep');
    if (!sel) return;
    const r = DB_SISTEMA.repuestos[sel.value];
    ticketActivo.repuestosCargados.push(r);
    actualizarEstacion();
}

function siguienteFase() {

    // FASE 0: Diagnóstico mínimo 10 caracteres
    if (ticketActivo.fase === 0) {
        if (!ticketActivo.diagnostico || ticketActivo.diagnostico.trim().length < 10) {
            return lanzarAlerta(
                "⚠ ALERTA DE DIAGNÓSTICO",
                `Debes ingresar un <b>diagnóstico válido</b> antes de continuar.<br><br>
                Mínimo 10 caracteres. (Llevas ${ticketActivo.diagnostico ? ticketActivo.diagnostico.trim().length : 0})`,
                'magia'
            );
        }
    }

    // FASE 1: Autorizaciones
    if (ticketActivo.fase === 1) {
        if (!ticketActivo.auth || !ticketActivo.pago) {
            return lanzarAlerta(
                "🚫 BLOQUEO ADMINISTRATIVO",
                `No puedes continuar sin:<br><br>
                ✔ Autorización del usuario<br>
                ✔ Abono del 50% confirmado`,
                'magia'
            );
        }
    }

    // FASE 2: Asignación técnica y repuestos
    if (ticketActivo.fase === 2) {

        const tecnicoNombre = ticketActivo.tecnicoAsignado;
        if(!tecnicoNombre){
            return lanzarAlerta(
                "⚠ SELECCIÓN DE TÉCNICO",
                `Debes seleccionar a un técnico antes de avanzar.`,
                'magia'
            );
        }

        const tecnicoData = DB_SISTEMA.tecnicos.find(t => t.nombre === tecnicoNombre);
        const marcaEquipo = ticketActivo.equipo.marca;

        if (!tecnicoData || !tecnicoData.skills.includes(marcaEquipo)) {
            return lanzarAlerta(
                "⛔ INCOMPATIBILIDAD TÉCNICA",
                `El técnico <b>${tecnicoNombre}</b> no posee la skill para equipos <b>${marcaEquipo}</b>.`,
                'magia'
            );
        }

        // Validación estilo imagen: sin repuestos cargados
        if (ticketActivo.repuestosCargados.length === 0) {
            return lanzarAlerta(
                "¡ALERTA DE MAGIA TÉCNICA!",
                `🪄<br><br>Estás a punto de avanzar con el técnico <b>${tecnicoNombre}</b> SIN asignar ningún repuesto al equipo.<br><br>
                ¿Seguro que se va a arreglar solo con cariño y buenas intenciones?`,
                'magia',
                () => { avanzarFaseInterna(); }
            );
        }
    }

    avanzarFaseInterna();
}

function avanzarFaseInterna() {
    ticketActivo.fase++;
    actualizarEstacion();
}

// 1. Modifica la navegación para que no abra modales
function navegar(pagina) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const pageEl = document.getElementById(`page-${pagina}`);
    if (pageEl) pageEl.classList.remove('hidden');
    
    const navEl = document.getElementById(`nav-${pagina}`);
    if (navEl) navEl.classList.add('active');

    if (pagina === 'tickets') {
        renderizarPanelTickets();
    }
    if (pagina === 'tecnicos') renderizarListaTecnicos();
}

function renderizarPanelTickets() {
    const busquedaEl = document.getElementById('search-ticket');
    const busqueda = busquedaEl ? busquedaEl.value.toLowerCase() : '';
    const contenedor = document.getElementById('lista-tickets-global');
    
    if (!contenedor) return;

    const filtrados = historialGlobal.filter(h => 
        h.cliente.toLowerCase().includes(busqueda) || 
        h.equipo.toLowerCase().includes(busqueda) ||
        h.tecnico.toLowerCase().includes(busqueda)
    );

    if (filtrados.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding:60px; border: 2px dashed rgba(255,255,255,0.1); border-radius:20px;">
                <p style="opacity:0.5; font-size:1.2rem;">No se encontraron registros coincidentes.</p>
            </div>`;
        return;
    }

    contenedor.innerHTML = filtrados.map((h, idx) => {
        const originalIndex = historialGlobal.indexOf(h);
        return `
        <div class="client-card-modern">
            <div style="display:flex; justify-content:space-between; grid-column: 1 / span 2; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
                <label style="color:var(--neon-blue)">TICKET ID: #ZH-${originalIndex + 100}</label>
                <button class="delete-ticket" onclick="borrarTicketIndividual(${originalIndex})">✕</button>
            </div>
            <div>
                <label>CLIENTE</label>
                <div class="client-value">${h.cliente}</div>
                <label style="margin-top:10px;">DISPOSITIVO</label>
                <div class="client-sub" style="color:#fff;">${h.equipo}</div>
            </div>
            <div class="text-right">
                <label>TÉCNICO ASIGNADO</label>
                <div class="client-value" style="color:var(--neon-pink)">${h.tecnico}</div>
                <label style="margin-top:10px;">FECHA DE CIERRE</label>
                <div class="client-sub">${h.fecha}</div>
            </div>
            <div class="full-width">
                <label style="color:var(--neon-green);">REPORTE TÉCNICO FINAL</label>
                <p class="problem-text">"${h.problema}"</p>
                <label style="margin-top:10px; color:var(--neon-blue);">COMPONENTES / REPUESTOS</label>
                <div class="client-value" style="font-size:0.85rem; opacity:0.9;">${h.repuestos}</div>
            </div>
        </div>
        `;
    }).reverse().join('');
}

// NUEVA ALERTA: Borrar Ticket Individual
function borrarTicketIndividual(index) {
    return lanzarAlerta(
        "🗑️ CONFIRMAR BORRADO",
        "¿Seguro que deseas eliminar este ticket del historial?<br><br>Esta acción es permanente y no se puede deshacer.",
        'magia',
        () => {
            historialGlobal.splice(index, 1);
            localStorage.setItem('zhouHistorialGlobal', JSON.stringify(historialGlobal));
            renderizarPanelTickets();
            renderizarPanelClientesModerno();
        }
    );
}

// NUEVA ALERTA: Borrar TODO el Historial
function limpiarTodoElHistorial() {
    return lanzarAlerta(
        "⚠️ BORRADO TOTAL ⚠️",
        "Estás a punto de borrar <b>TODOS</b> los tickets permanentemente.<br><br>¿Seguro que quieres vaciar el historial completo?",
        'magia',
        () => {
            historialGlobal = [];
            localStorage.setItem('zhouHistorialGlobal', JSON.stringify(historialGlobal));
            renderizarPanelTickets();
            renderizarPanelClientesModerno();
        }
    );
}

function renderizarListaTecnicos() {
    const grid = document.getElementById('lista-tecnicos-grid');
    if (!grid) return;
    grid.innerHTML = DB_SISTEMA.tecnicos.map(t => `
        <div class="card" style="margin-bottom:0; padding:15px; text-align:center;">
            <div class="status-dot green" style="margin-bottom:10px;"></div>
            <div class="client-value">${t.nombre}</div>
            <div class="client-sub" style="font-size:0.6rem; margin-top:5px;">
                ${t.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function validarDigitos(input) { input.value = input.value.replace(/[^0-9]/g, ''); }

function finalizarYRegistrar() {
    const registro = {
        cliente: ticketActivo.cliente,
        equipo: `${ticketActivo.equipo.marca} ${ticketActivo.equipo.modelo}`,
        tecnico: ticketActivo.tecnicoAsignado,
        problema: ticketActivo.diagnostico,
        repuestos: ticketActivo.repuestosCargados.map(r => r.nombre).join(', ') || "Ninguno (Solo cariño)",
        fecha: new Date().toLocaleDateString()
    };
    historialGlobal.push(registro);
    localStorage.setItem('zhouHistorialGlobal', JSON.stringify(historialGlobal));
    
    localStorage.removeItem('zhouTicket');
    location.reload();
}

function renderizarPanelClientesModerno() {
    const modalContent = document.getElementById('historial-content');
    const contenedorFallback = document.getElementById('lista-clientes-global');
    const contenedor = modalContent || contenedorFallback;
    if (!contenedor) return;

    if (historialGlobal.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; opacity:0.5;'>No hay equipos finalizados aún.</p>";
        return;
    }

    contenedor.innerHTML = historialGlobal.map(h => `
        <div class="client-card-modern">
                <label>CLIENTE</label>
                <div class="client-value">${h.cliente}</div>
                <label style="margin-top:10px;">EQUIPO</label>
                <div class="client-sub">${h.equipo}</div>
            </div>
            <div class="text-right">
                <label>TÉCNICO ATENDIÓ</label>
                <div class="client-value">${h.tecnico}</div>
                <label style="margin-top:10px;">FECHA</label>
                <div class="client-sub" style="opacity:0.7;">${h.fecha}</div>
            </div>
            <div class="full-width">
                <label style="color:var(--neon-green);">PROBLEMA SOBRE TODO</label>
                <p class="problem-text">"${h.problema}"</p>
                <label style="margin-top:10px; color:var(--neon-blue);">REPUESTOS</label>
                <div class="client-value" style="font-size:0.85rem; color: #fff;">${h.repuestos}</div>
            </div>
        </div>
    `).reverse().join('');
}
}
