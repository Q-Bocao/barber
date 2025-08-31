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

  // Si estamos en el panel, cargamos turnos
  if (document.body.contains(document.getElementById("tabla-turnos"))) {
    cargarTurnos();
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

  // URL final de tu Apps Script (POST)
  fetch("https://script.google.com/macros/s/AKfycbzYGp8JnvD5kMwqQPiZRK8by48r_02i2eX-kvTAEmtHoCD9yu3GdEZnGwzZQteX1xYk/exec", {
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
function cargarTurnos() {
  const tbody = document.querySelector("#tabla-turnos tbody");
  tbody.innerHTML = "<tr><td colspan='5'>⏳ Cargando turnos...</td></tr>";

  // URL final de tu Apps Script (GET)
  fetch("https://script.google.com/macros/s/AKfycbzYGp8JnvD5kMwqQPiZRK8by48r_02i2eX-kvTAEmtHoCD9yu3GdEZnGwzZQteX1xYk/exec")
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";
      if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>📭 No hay turnos registrados</td></tr>";
        return;
      }
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
    })
    .catch(() => {
      tbody.innerHTML = "<tr><td colspan='5'>❌ Error al cargar los turnos</td></tr>";
    });
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
