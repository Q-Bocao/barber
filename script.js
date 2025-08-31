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
    setInterval(cargarTurnos, 5000); // auto-refresh cada 5s
  }
});

function cargarHorarios() {
  const barbero = document.getElementById("barbero").value;
  const horariosDiv = document.getElementById("horarios");
  horariosDiv.innerHTML = "";

  if (!barbero) return;

  // Generar horarios de 10:00 a 20:00 (cada 30 min)
  const horarios = [];
  for (let h = 10; h <= 20; h++) {
    horarios.push(`${h}:00`);
    if (h < 20) horarios.push(`${h}:30`);
  }

  // Obtener turnos ya ocupados desde Google Sheets
  fetch("https://script.google.com/macros/s/AKfycbwIIlRrbiR7yeT6FWo9NuE5q4IDCYL-7IRrlaMsszxzuLXLNrxyyXfuCIHz-_8JUSo2/exec")
    .then(res => res.json())
    .then(data => {
      const hoy = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      const ocupados = data
        .filter(t => t.barbero === barbero && t.fecha === hoy)
        .map(t => t.hora);

      horarios.forEach(hora => {
        const btn = document.createElement("button");
        btn.type = "button";

        if (ocupados.includes(hora)) {
          btn.textContent = `${hora} (Agotado)`;
          btn.disabled = true;
          btn.classList.add("agotado");
        } else {
          btn.textContent = hora;
          btn.onclick = () => book(hora);
        }

        horariosDiv.appendChild(btn);
      });
    })
    .catch(() => {
      showMessage("❌ Error al cargar horarios", "error");
    });
}

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
    fecha: new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  };

  // ✅ URL de tu Apps Script (POST)
  fetch("https://script.google.com/macros/s/AKfycbwIIlRrbiR7yeT6FWo9NuE5q4IDCYL-7IRrlaMsszxzuLXLNrxyyXfuCIHz-_8JUSo2/exec", {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(() => {
    showMessage("✅ Turno reservado correctamente", "success");
    document.getElementById("form-reserva")?.reset();
    cargarHorarios(); // refresca horarios y bloquea el recién reservado
  })
  .catch(() => showMessage("❌ Error al reservar", "error"));
}

// -----------------------------
// LOGIN
// -----------------------------
function loginUser(e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  if ((usuario === "admin" && clave === "1234") ||
      (usuario === "barbero" && clave === "abcd")) {
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
  if (isNaN(fecha)) return fechaStr;
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatTime(horaStr) {
  if (/^\d{1,2}:\d{2}$/.test(horaStr)) return horaStr + " hs";
  const fecha = new Date(horaStr);
  if (isNaN(fecha)) return horaStr;
  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  }) + " hs";
}

function cargarTurnos(filtrar = false) {
  const tbody = document.querySelector("#tabla-turnos tbody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='5'>⏳ Cargando turnos...</td></tr>";

  // ✅ URL de tu Apps Script (GET)
  fetch("https://script.google.com/macros/s/AKfycbwIIlRrbiR7yeT6FWo9NuE5q4IDCYL-7IRrlaMsszxzuLXLNrxyyXfuCIHz-_8JUSo2/exec")
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";

      const hoy = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      let turnos = data;

      if (!filtrar) {
        turnos = data.filter(t => {
          const fechaTurno = new Date(t.fecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });
          return fechaTurno === hoy;
        });
      }

      const filtroBarbero = document.getElementById("filtroBarbero")?.value;
      const filtroFecha = document.getElementById("filtroFecha")?.value;

      if (filtrar) {
        if (filtroBarbero) turnos = turnos.filter(t => t.barbero === filtroBarbero);
        if (filtroFecha) {
          const fechaFormateada = new Date(filtroFecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });
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

  setTimeout(() => div.remove(), 3000);
}
