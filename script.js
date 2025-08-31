let selectedService = "";

// -----------------------------
// RESERVA
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const servicioSelect = document.getElementById("servicio");
  if (servicioSelect) {
    servicioSelect.addEventListener("change", e => {
      selectedService = e.target.value;
    });
  }
});

function book(hora) {
  const nombre = document.getElementById("nombre")?.value;
  const barbero = document.getElementById("barbero")?.value;

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
    hora: hora,
    fecha: new Date().toLocaleDateString("es-AR")
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

// -----------------------------
// LOGIN
// -----------------------------
function loginUser(e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  // 🔑 Usuarios de prueba
  if ((usuario === "admin" && clave === "1234") ||
      (usuario === "barbero" && clave === "abcd")) {
    // Guardamos sesión en localStorage
    localStorage.setItem("usuario", usuario);
    window.location.href = "panel.html";
  } else {
    document.getElementById("login-msg").innerText = "❌ Usuario o contraseña incorrectos";
  }
}

// -----------------------------
// PANEL
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.contains(document.getElementById("tabla-turnos"))) {
    cargarTurnos();
  }
});

function cargarTurnos() {
  const tbody = document.querySelector("#tabla-turnos tbody");
  tbody.innerHTML = "<tr><td colspan='5'>⏳ Cargando turnos...</td></tr>";

  // 👉 Simulación (más adelante lo conectamos con Google Sheets)
  setTimeout(() => {
    const data = [
      { nombre: "Juan Pérez", servicio: "Corte de Pelo", barbero: "Carlos", hora: "10:00", fecha: "2025-08-30" },
      { nombre: "Luis Gómez", servicio: "Barba", barbero: "Martín", hora: "11:30", fecha: "2025-08-30" },
    ];

    tbody.innerHTML = "";
    data.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.nombre}</td>
        <td>${t.servicio}</td>
        <td>${t.barbero}</td>
        <td>${t.hora}</td>
        <td>${t.fecha}</td>
      `;
      tbody.appendChild(tr);
    });
  }, 1000);
}

// -----------------------------
// MENSAJES FLOTANTES
// -----------------------------
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
