let selectedService = "";

// Si estamos en reserva.html, capturamos el select de servicios
document.addEventListener("DOMContentLoaded", () => {
  const servicioSelect = document.getElementById("servicio");
  if (servicioSelect) {
    servicioSelect.addEventListener("change", e => {
      selectedService = e.target.value;
    });
  }
});

// Reservar turno
function book(hora) {
  const nombre = document.getElementById("nombre").value;
  const barbero = document.getElementById("barbero").value;

  // Si estamos en index.html, el servicio lo toma de tarjetas
  if (!selectedService && document.getElementById("servicio")) {
    selectedService = document.getElementById("servicio").value;
  }

  if (!nombre || !selectedService || !barbero) {
    showMessage("⚠️ Completa todos los campos", "error");
    return;
  }

  const data = {
    nombre: nombre,
    servicio: selectedService,
    barbero: barbero,
    hora: hora
  };

  // 👉 Reemplazá con la URL de tu Apps Script publicado como Web App
  fetch("https://script.google.com/macros/s/TU_URL_AQUI/exec", {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(() => showMessage("✅ Turno reservado correctamente", "success"))
  .catch(() => showMessage("❌ Error al reservar", "error"));
}

// Mostrar mensajes flotantes
function showMessage(msg, type) {
  let container = document.getElementById("msg-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "msg-container";
    document.body.appendChild(container);
  }

  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerHTML = msg;
  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}
