
import { Telefono } from "./domain/Telefono.js";
import { Cliente } from "./domain/Cliente.js";
import { Tecnico } from "./domain/Tecnico.js";
import { Sucursal } from "./domain/Sucursal.js";
import { Reparacion } from "./domain/Reparacion.js";
import { ReparacionService } from "./services/ReparacionService.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formReparacion");
  const resultado = document.getElementById("resultado");
  const panel = document.getElementById("panelProceso");
  const historialDiv = document.getElementById("historialEstados");
  const totalSpan = document.getElementById("totalServicio");

  let reparacionActual = null;

  const sucursal = new Sucursal("Centro", "Av Principal");
  sucursal.agregarTecnico(new Tecnico("Carlos", ["Samsung", "Xiaomi"]));
  sucursal.agregarTecnico(new Tecnico("Luis", ["Apple"]));

  const service = new ReparacionService();

  // =============================
  // UI
  // =============================

  function actualizarVista() {
    if (!reparacionActual) return;

    resultado.innerHTML = `
      <p><strong>Estado:</strong> ${reparacionActual.estado}</p>
      <p><strong>Técnico:</strong> ${reparacionActual.tecnicoAsignado
        ? reparacionActual.tecnicoAsignado.nombre
        : "No asignado"
      }</p>
      <p><strong>Abono:</strong> S/ ${reparacionActual.abono || 0}</p>
    `;

    historialDiv.innerHTML = reparacionActual.historial
      .map(h => `<p>${h.estado} - ${new Date(h.fecha).toLocaleString()}</p>`)
      .join("");

    totalSpan.textContent =
      reparacionActual.getTotalServicio().toFixed(2);
  }

  function resetFormulario() {

    // Limpiar objeto en memoria
    reparacionActual = null;

    // Limpiar localStorage
    localStorage.removeItem("reparacion");

    // Resetear formulario HTML
    form.reset();

    // Limpiar campos secundarios
    document.getElementById("descripcionDiag").value = "";
    document.getElementById("costoDiag").value = "";
    document.getElementById("repNombre").value = "";
    document.getElementById("repPrecio").value = "";
    document.getElementById("repCantidad").value = "";
    document.getElementById("abono").value = "";
    document.getElementById("persistenciaInfo").textContent = "";

    // Limpiar UI dinámica
    historialDiv.innerHTML = "";
    totalSpan.textContent = "0.00";
    resultado.innerHTML = "";

    // Asegurar que el panel quede oculto
    panel.classList.add("hidden");
    resultado.classList.add("hidden");

    // Limpiar indicador de persistencia si existe
    const persist = document.getElementById("persistenciaInfo");
    if (persist) persist.textContent = "";
  }
  // =============================
  // CREAR
  // =============================

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    try {

      const telefono = new Telefono(
        document.getElementById("serie").value,
        document.getElementById("imei").value,
        document.getElementById("marca").value,
        document.getElementById("modelo").value
      );

      const cliente = new Cliente(
        document.getElementById("nombre").value,
        document.getElementById("documento").value
      );

      

      reparacionActual = service.crearReparacion(
        telefono,
        cliente,
        sucursal
      );

      resultado.classList.remove("hidden");
      panel.classList.remove("hidden");

      actualizarVista();
      //guardar();//

    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });

  // =============================
  // DIAGNOSTICO
  // =============================

  document.getElementById("btnDiagnostico")?.addEventListener("click", () => {

    try {
      reparacionActual.realizarDiagnostico(
        document.getElementById("descripcionDiag").value,
        Number(document.getElementById("costoDiag").value)
      );
      service.guardarCambios(); 
      actualizarVista();
      //guardar();//

    } catch (error) {
      alert(error.message);
    }
  });

  // =============================
  // REPUESTO
  // =============================

  document.getElementById("btnAgregarRepuesto")?.addEventListener("click", () => {

    try {

      const nombre = document.getElementById("repNombre").value;
      const precio = Number(document.getElementById("repPrecio").value);
      const cantidad = Number(document.getElementById("repCantidad").value);

      reparacionActual.agregarRepuesto(nombre, precio, cantidad);

      actualizarVista();
      //guardar();//

    } catch (error) {
      alert(error.message);
    }
  });

  // =============================
  // AUTORIZAR
  // =============================

  document.getElementById("btnAutorizar")?.addEventListener("click", () => {

    try {

      reparacionActual.cliente.firmarAutorizacion();
      reparacionActual.registrarAbono(
        Number(document.getElementById("abono").value)
      );

      if (!reparacionActual.estaAutorizada()) {
        throw new Error("Debe pagar al menos el 50%");
      }

      actualizarVista();
      //guardar();//

      alert("Reparación autorizada");

    } catch (error) {
      alert(error.message);
    }
  });

  // =============================
  // ASIGNAR TECNICO
  // =============================

  document.getElementById("btnAsignar")?.addEventListener("click", () => {

    try {

      reparacionActual.asignarTecnico();

      actualizarVista();
      //guardar();//

      alert("Técnico asignado correctamente");

    } catch (error) {
      alert(error.message);
    }
  });

  // =============================
  // FINALIZAR
  // =============================



  document.getElementById("btnFinalizar")?.addEventListener("click", () => {
    try {

      reparacionActual = service.finalizarReparacion(reparacionActual.id);

      actualizarVista();

      alert("Reparación finalizada correctamente");

      // esperar 2 segundos antes de limpiar
      setTimeout(() => {
        resetFormulario();
      }, 2000);

    } catch (error) {
      alert(error.message);
    }
  });

});


