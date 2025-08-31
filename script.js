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

    // 🔄 Auto-actualizar cada 10 segundos
    setInterval(cargarTurnos, 5000);
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

  // URL de tu Apps Script (POST)
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
function formatDate(fechaStr) {
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return fechaStr; // por si viene mal
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatTime(horaStr) {
  const fecha = new Date(horaStr);
  if (isNaN(fecha)) return horaStr;
  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  }) + " hs";
}

function cargarTurnos(filtrar = false) {
  const tbody = document.querySelector("#tabla-turnos tbody");
  tbody.innerHTML = "<tr><td colspan='5'>⏳ Cargando turnos...</td></tr>";

  fetch("https://script.google.com/macros/s/AKfycbzYGp8JnvD5kMwqQPiZRK8by48r_02i2eX-kvTAEmtHoCD9yu3GdEZnGwzZQteX1xYk/exec")
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";

      const hoy = new Date().toLocaleDateString("es-AR");
      let turnos = data;

      // 👉 Por defecto: solo turnos de hoy
      if (!filtrar) {
        turnos = data.filter(t => t.fecha === hoy);
      }

      // Si hay filtros aplicados
      const filtroBarbero = document.getElementById("filtroBarbero")?.value;
      const filtroFecha = document.getElementById("filtroFecha")?.value;

      if (filtrar) {
        if (filtroBarbero) {
          turnos = turnos.filter(t => t.barbero === filtroBarbero);
        }
        if (filtroFecha) {
          const fechaFormateada = new Date(filtroFecha).toLocaleDateString("es-AR");
          turnos = turnos.filter(t => t.fecha === fechaFormateada);
        }
      }

      if (turnos.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>📭 No hay turnos registrados</td></tr>";
        return;
      }

      turnos.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${t.nombre}</td>
          <td>${t.servicio}</td>
          <td>${t.barbero}</td>
          <td>${formatTime(t.hora)}</td>
          <td>${formatDate(t.fecha)}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(() => {
      tbody.innerHTML = "<tr><td colspan='5'>❌ Error al cargar los turnos</td></tr>";
    });
}

// -----------------------------
// FILTRO
// -----------------------------
function aplicarFiltro() {
  cargarTurnos(true);
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
