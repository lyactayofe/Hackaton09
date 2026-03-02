// ===========================
// CLASES DEL SISTEMA
// ===========================

// Clase para manejar el teléfono
class Phone {
    constructor(serialNumber, imei, brand, model, clientName) {
        this.serialNumber = serialNumber;
        this.imei = imei;
        this.brand = brand;
        this.model = model;
        this.clientName = clientName;
        this.status = 'Registrado';
        this.diagnosis = null;
        this.estimatedCost = 0;
        this.authorized = false;
        this.deposit = 0;
        this.technician = null;
        this.spareParts = [];
        this.createdAt = new Date().toISOString();
    }

    // Validar si el teléfono no está reportado
    static isReported(serialNumber, imei) {
        // Simular lista negra de teléfonos reportados
        const reportedDevices = JSON.parse(localStorage.getItem('reportedDevices')) || [];
        return reportedDevices.some(device => 
            device.serialNumber === serialNumber || device.imei === imei
        );
    }

    // Agregar diagnóstico
    addDiagnosis(diagnosis, cost) {
        this.diagnosis = diagnosis;
        this.estimatedCost = cost;
        this.status = 'Diagnosticado';
    }

    // Autorizar servicio
    authorize(depositAmount) {
        const requiredDeposit = this.estimatedCost * 0.5;
        if (depositAmount >= requiredDeposit) {
            this.authorized = true;
            this.deposit = depositAmount;
            this.status = 'Autorizado';
            return true;
        }
        return false;
    }

    // Asignar técnico
    assignTechnician(technician) {
        this.technician = technician;
        this.status = 'En Reparación';
    }

    // Agregar repuesto
    addSparePart(name, cost) {
        this.spareParts.push({ name, cost, addedAt: new Date().toISOString() });
        this.estimatedCost += cost;
    }

    // Actualizar estado
    updateStatus(newStatus) {
        this.status = newStatus;
    }
}

// Clase para manejar técnicos
class Technician {
    constructor(name, skills) {
        this.id = Date.now().toString();
        this.name = name;
        this.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        this.assignedPhones = [];
        this.createdAt = new Date().toISOString();
    }

    // Verificar si el técnico tiene skill para una marca
    hasSkillForBrand(brand) {
        return this.skills.some(skill => 
            skill.toLowerCase() === brand.toLowerCase()
        );
    }

    // Asignar teléfono al técnico
    assignPhone(phoneId) {
        if (!this.assignedPhones.includes(phoneId)) {
            this.assignedPhones.push(phoneId);
        }
    }

    // Completar reparación
    completeRepair(phoneId) {
        this.assignedPhones = this.assignedPhones.filter(id => id !== phoneId);
    }
}

// Clase para manejar sucursales
class Branch {
    constructor(name, location) {
        this.id = Date.now().toString();
        this.name = name;
        this.location = location;
        this.phones = [];
        this.technicians = [];
    }

    addPhone(phone) {
        this.phones.push(phone);
    }

    addTechnician(technician) {
        this.technicians.push(technician);
    }
}

// ===========================
// SISTEMA DE GESTIÓN
// ===========================

class RepairManagementSystem {
    constructor() {
        this.phones = this.loadPhonesFromStorage();
        this.technicians = this.loadTechniciansFromStorage();
        this.reportedDevices = this.loadFromStorage('reportedDevices') || [];
        this.initializeReportedDevices();
    }

    // Inicializar algunos dispositivos reportados de ejemplo
    initializeReportedDevices() {
        if (this.reportedDevices.length === 0) {
            this.reportedDevices = [
                { serialNumber: 'REPORTED001', imei: '111111111111111' },
                { serialNumber: 'REPORTED002', imei: '222222222222222' }
            ];
            this.saveToStorage('reportedDevices', this.reportedDevices);
        }
    }

    // Cargar teléfonos y reconstruir instancias
    loadPhonesFromStorage() {
        const data = this.loadFromStorage('phones');
        if (!data) return [];
        
        return data.map(phoneData => {
            const phone = new Phone(
                phoneData.serialNumber,
                phoneData.imei,
                phoneData.brand,
                phoneData.model,
                phoneData.clientName
            );
            // Restaurar propiedades
            phone.status = phoneData.status;
            phone.diagnosis = phoneData.diagnosis;
            phone.estimatedCost = phoneData.estimatedCost;
            phone.authorized = phoneData.authorized;
            phone.deposit = phoneData.deposit;
            phone.technician = phoneData.technician;
            phone.spareParts = phoneData.spareParts;
            phone.createdAt = phoneData.createdAt;
            return phone;
        });
    }

    // Cargar técnicos y reconstruir instancias
    loadTechniciansFromStorage() {
        const data = this.loadFromStorage('technicians');
        if (!data) return [];
        
        return data.map(techData => {
            const technician = new Technician(techData.name, techData.skills);
            technician.id = techData.id;
            technician.assignedPhones = techData.assignedPhones || [];
            technician.createdAt = techData.createdAt;
            return technician;
        });
    }

    // Guardar en LocalStorage (datos persistentes)
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Cargar desde LocalStorage
    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Guardar en SessionStorage (datos de sesión)
    saveToSession(key, data) {
        sessionStorage.setItem(key, JSON.stringify(data));
    }

    // Cargar desde SessionStorage
    loadFromSession(key) {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Registrar teléfono
    registerPhone(serialNumber, imei, brand, model, clientName) {
        // Validar que no esté reportado
        if (Phone.isReported(serialNumber, imei)) {
            alert('⚠️ Este teléfono está reportado y no puede acceder al servicio.');
            return null;
        }

        // Crear nuevo teléfono
        const phone = new Phone(serialNumber, imei, brand, model, clientName);
        this.phones.push(phone);
        this.saveToStorage('phones', this.phones);
        
        // Guardar en sesión el último teléfono registrado
        this.saveToSession('lastRegisteredPhone', phone);
        
        return phone;
    }

    // Agregar diagnóstico
    addDiagnosis(serialNumber, diagnosis, cost) {
        const phone = this.phones.find(p => p.serialNumber === serialNumber);
        if (phone) {
            phone.addDiagnosis(diagnosis, cost);
            this.saveToStorage('phones', this.phones);
            return true;
        }
        return false;
    }

    // Autorizar servicio
    authorizeService(serialNumber, depositAmount) {
        const phone = this.phones.find(p => p.serialNumber === serialNumber);
        if (!phone) {
            alert('Teléfono no encontrado');
            return false;
        }

        if (!phone.diagnosis) {
            alert('El teléfono debe tener un diagnóstico primero');
            return false;
        }

        if (phone.authorize(depositAmount)) {
            this.saveToStorage('phones', this.phones);
            return true;
        } else {
            alert(`El abono debe ser al menos el 50% del costo estimado ($${phone.estimatedCost * 0.5})`);
            return false;
        }
    }

    // Registrar técnico
    registerTechnician(name, skills) {
        const technician = new Technician(name, skills);
        this.technicians.push(technician);
        this.saveToStorage('technicians', this.technicians);
        return technician;
    }

    // Asignar técnico y repuesto
    assignTechnicianAndSparePart(serialNumber, technicianId, sparePart, cost) {
        const phone = this.phones.find(p => p.serialNumber === serialNumber);
        const technician = this.technicians.find(t => t.id === technicianId);

        if (!phone || !technician) {
            alert('Teléfono o técnico no encontrado');
            return false;
        }

        if (!phone.authorized) {
            alert('El servicio debe estar autorizado primero');
            return false;
        }

        // Verificar que el técnico tenga skill para la marca
        if (!technician.hasSkillForBrand(phone.brand)) {
            alert(`El técnico ${technician.name} no tiene skills para la marca ${phone.brand}`);
            return false;
        }

        phone.assignTechnician(technician.name);
        technician.assignPhone(phone.serialNumber);

        if (sparePart && cost > 0) {
            phone.addSparePart(sparePart, cost);
        }

        this.saveToStorage('phones', this.phones);
        this.saveToStorage('technicians', this.technicians);
        return true;
    }

    // Actualizar estado del equipo
    updatePhoneStatus(serialNumber, newStatus) {
        const phone = this.phones.find(p => p.serialNumber === serialNumber);
        if (phone) {
            phone.updateStatus(newStatus);
            this.saveToStorage('phones', this.phones);
            return true;
        }
        return false;
    }

    // Obtener todos los teléfonos
    getAllPhones() {
        return this.phones;
    }

    // Obtener todos los técnicos
    getAllTechnicians() {
        return this.technicians;
    }

    // Limpiar todos los datos
    clearAllData() {
        if (confirm('¿Está seguro de que desea eliminar todos los datos?')) {
            localStorage.clear();
            sessionStorage.clear();
            this.phones = [];
            this.technicians = [];
            this.reportedDevices = [];
            this.initializeReportedDevices();
            alert('Todos los datos han sido eliminados');
            location.reload();
        }
    }

    // Mostrar información del storage
    showStorageInfo() {
        const localStorageSize = new Blob([JSON.stringify(localStorage)]).size;
        const sessionStorageSize = new Blob([JSON.stringify(sessionStorage)]).size;
        
        const info = `
📊 INFORMACIÓN DE STORAGE

LocalStorage:
- Tamaño: ${localStorageSize} bytes
- Teléfonos registrados: ${this.phones.length}
- Técnicos registrados: ${this.technicians.length}
- Dispositivos reportados: ${this.reportedDevices.length}

SessionStorage:
- Tamaño: ${sessionStorageSize} bytes
- Último teléfono registrado: ${this.loadFromSession('lastRegisteredPhone')?.serialNumber || 'Ninguno'}
        `;
        
        alert(info);
    }
}

// ===========================
// INICIALIZACIÓN DEL SISTEMA
// ===========================

const repairSystem = new RepairManagementSystem();

// ===========================
// FUNCIONES DE INTERFAZ
// ===========================

// Actualizar selectores
function updateSelectors() {
    const phones = repairSystem.getAllPhones();
    const technicians = repairSystem.getAllTechnicians();

    // Actualizar selector de teléfonos para diagnóstico
    const phoneSelect = document.getElementById('phoneSelect');
    phoneSelect.innerHTML = '<option value="">Seleccione un teléfono...</option>';
    phones.filter(p => p.status === 'Registrado').forEach(phone => {
        const option = document.createElement('option');
        option.value = phone.serialNumber;
        option.textContent = `${phone.brand} ${phone.model} - ${phone.clientName} (${phone.serialNumber})`;
        phoneSelect.appendChild(option);
    });

    // Actualizar selector de teléfonos para autorización
    const authPhoneSelect = document.getElementById('authPhoneSelect');
    authPhoneSelect.innerHTML = '<option value="">Seleccione un teléfono...</option>';
    phones.filter(p => p.status === 'Diagnosticado').forEach(phone => {
        const option = document.createElement('option');
        option.value = phone.serialNumber;
        option.textContent = `${phone.brand} ${phone.model} - ${phone.clientName} (${phone.serialNumber})`;
        authPhoneSelect.appendChild(option);
    });

    // Actualizar selector de teléfonos para asignación
    const assignPhoneSelect = document.getElementById('assignPhoneSelect');
    assignPhoneSelect.innerHTML = '<option value="">Seleccione un teléfono...</option>';
    phones.filter(p => p.status === 'Autorizado').forEach(phone => {
        const option = document.createElement('option');
        option.value = phone.serialNumber;
        option.textContent = `${phone.brand} ${phone.model} - ${phone.clientName} (${phone.serialNumber})`;
        assignPhoneSelect.appendChild(option);
    });

    // Actualizar selector de técnicos
    const technicianSelect = document.getElementById('technicianSelect');
    technicianSelect.innerHTML = '<option value="">Seleccione un técnico...</option>';
    technicians.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = `${tech.name} (Skills: ${tech.skills.join(', ')})`;
        technicianSelect.appendChild(option);
    });
}

// Actualizar lista de técnicos
function updateTechniciansList() {
    const technicians = repairSystem.getAllTechnicians();
    const list = document.getElementById('techniciansList');
    
    if (technicians.length === 0) {
        list.innerHTML = '<p>No hay técnicos registrados</p>';
        return;
    }

    list.innerHTML = '<h3>Técnicos Registrados:</h3>';
    technicians.forEach(tech => {
        const div = document.createElement('div');
        div.className = 'technician-item';
        div.innerHTML = `
            <strong>${tech.name}</strong><br>
            Skills: ${tech.skills.join(', ')}<br>
            Teléfonos asignados: ${tech.assignedPhones.length}
        `;
        list.appendChild(div);
    });
}

// Actualizar estado de equipos
function updateEquipmentStatus() {
    const phones = repairSystem.getAllPhones();
    const statusDiv = document.getElementById('equipmentStatus');

    if (phones.length === 0) {
        statusDiv.innerHTML = '<p>No hay equipos registrados</p>';
        return;
    }

    // Agrupar por estado
    const groupedByStatus = phones.reduce((acc, phone) => {
        if (!acc[phone.status]) {
            acc[phone.status] = [];
        }
        acc[phone.status].push(phone);
        return acc;
    }, {});

    statusDiv.innerHTML = '<h3>Estaciones de Trabajo:</h3>';
    
    Object.keys(groupedByStatus).forEach(status => {
        const section = document.createElement('div');
        section.className = 'status-section';
        section.innerHTML = `<h4>${status} (${groupedByStatus[status].length})</h4>`;
        
        groupedByStatus[status].forEach(phone => {
            const phoneDiv = document.createElement('div');
            phoneDiv.className = 'phone-card';
            phoneDiv.innerHTML = `
                <strong>${phone.brand} ${phone.model}</strong><br>
                Serial: ${phone.serialNumber}<br>
                Cliente: ${phone.clientName}<br>
                ${phone.diagnosis ? `Diagnóstico: ${phone.diagnosis}<br>` : ''}
                ${phone.estimatedCost > 0 ? `Costo: $${phone.estimatedCost.toFixed(2)}<br>` : ''}
                ${phone.technician ? `Técnico: ${phone.technician}<br>` : ''}
                ${phone.spareParts.length > 0 ? `Repuestos: ${phone.spareParts.map(p => p.name).join(', ')}<br>` : ''}
                ${phone.deposit > 0 ? `Abono: $${phone.deposit.toFixed(2)}<br>` : ''}
            `;
            
            // Botones para cambiar estado
            if (phone.status === 'En Reparación') {
                const btnComplete = document.createElement('button');
                btnComplete.textContent = 'Marcar como Completado';
                btnComplete.className = 'btn-small';
                btnComplete.onclick = () => {
                    repairSystem.updatePhoneStatus(phone.serialNumber, 'Completado');
                    updateEquipmentStatus();
                    alert('Reparación completada');
                };
                phoneDiv.appendChild(btnComplete);
            }
            
            if (phone.status === 'Completado') {
                const btnDeliver = document.createElement('button');
                btnDeliver.textContent = 'Entregar al Cliente';
                btnDeliver.className = 'btn-small';
                btnDeliver.onclick = () => {
                    repairSystem.updatePhoneStatus(phone.serialNumber, 'Entregado');
                    updateEquipmentStatus();
                    alert('Equipo entregado al cliente');
                };
                phoneDiv.appendChild(btnDeliver);
            }
            
            section.appendChild(phoneDiv);
        });
        
        statusDiv.appendChild(section);
    });
}

// ===========================
// EVENT LISTENERS
// ===========================

// Registrar teléfono
document.getElementById('phoneForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serialNumber = document.getElementById('serialNumber').value;
    const imei = document.getElementById('imei').value;
    const brand = document.getElementById('brand').value;
    const model = document.getElementById('model').value;
    const clientName = document.getElementById('clientName').value;

    const phone = repairSystem.registerPhone(serialNumber, imei, brand, model, clientName);
    
    if (phone) {
        alert('✅ Teléfono registrado exitosamente');
        e.target.reset();
        updateSelectors();
        updateEquipmentStatus();
    }
});

// Guardar diagnóstico
document.getElementById('diagnosisForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serialNumber = document.getElementById('phoneSelect').value;
    const diagnosis = document.getElementById('diagnosis').value;
    const cost = parseFloat(document.getElementById('estimatedCost').value);

    if (repairSystem.addDiagnosis(serialNumber, diagnosis, cost)) {
        alert('✅ Diagnóstico guardado exitosamente');
        e.target.reset();
        updateSelectors();
        updateEquipmentStatus();
    }
});

// Autorizar servicio
document.getElementById('authorizationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serialNumber = document.getElementById('authPhoneSelect').value;
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    const authorized = document.getElementById('authorizationCheck').checked;

    if (!authorized) {
        alert('Debe marcar la autorización escrita del cliente');
        return;
    }

    if (repairSystem.authorizeService(serialNumber, depositAmount)) {
        alert('✅ Servicio autorizado exitosamente');
        e.target.reset();
        updateSelectors();
        updateEquipmentStatus();
    }
});

// Registrar técnico
document.getElementById('technicianForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('technicianName').value;
    const skills = document.getElementById('technicianSkills').value;

    repairSystem.registerTechnician(name, skills);
    alert('✅ Técnico registrado exitosamente');
    e.target.reset();
    updateSelectors();
    updateTechniciansList();
});

// Asignar técnico y repuesto
document.getElementById('assignmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serialNumber = document.getElementById('assignPhoneSelect').value;
    const technicianId = document.getElementById('technicianSelect').value;
    const sparePart = document.getElementById('sparePart').value;
    const cost = parseFloat(document.getElementById('sparePartCost').value) || 0;

    if (repairSystem.assignTechnicianAndSparePart(serialNumber, technicianId, sparePart, cost)) {
        alert('✅ Técnico asignado y repuesto agregado exitosamente');
        e.target.reset();
        updateSelectors();
        updateEquipmentStatus();
    }
});

// ===========================
// SISTEMA DE PESTAÑAS
// ===========================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Remover clase active de todos los botones y panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Agregar clase active al botón clickeado y su pane correspondiente
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Guardar la pestaña activa en sessionStorage
            sessionStorage.setItem('activeTab', targetTab);
        });
    });

    // Restaurar la última pestaña activa
    const savedTab = sessionStorage.getItem('activeTab');
    if (savedTab) {
        const savedButton = document.querySelector(`[data-tab="${savedTab}"]`);
        if (savedButton) {
            savedButton.click();
        }
    }
}

// Inicializar interfaz al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    updateSelectors();
    updateTechniciansList();
    updateEquipmentStatus();
    
    console.log('🔧 Sistema de Reparación de Celulares iniciado');
    console.log('📱 Teléfonos registrados:', repairSystem.getAllPhones().length);
    console.log('👨‍🔧 Técnicos registrados:', repairSystem.getAllTechnicians().length);
});