// 👇 Un solo lugar para cambiar el Script URL cuando lo vuelvas a publicar
const API_URL = "https://script.google.com/macros/s/AKfycbwIIlRrbiR7yeT6FWo9NuE5q4IDCYL-7IRrlaMsszxzuLXLNrxyyXfuCIHz-_8JUSo2/exec";

let selectedService = "";

// Utilidad: fecha dd/mm/yyyy (dos dígitos)
function hoyAR() {
  return new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// -----------------------------
// INICIO
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("[INIT] DOM listo");

  // Hook servicio
  const servicioSelect = document.getElementById("servicio");
  servicioSelect?.addEventListener("change", e => {
    selectedService = e.target.value;
  });

  // Hook barbero -> cargar horarios
  const barberoSelect = document.getElementById("barbero");
  barberoSelect?.addEventListener("change", () => {
    console.log("[RESERVA] Barbero seleccionado -> cargarHorarios()");
    cargarHorarios();
  });

  // Si estamos en el panel, cargar turnos + auto-refresh
  if (document.getElementById("tabla-turnos")) {
    console.log("[PANEL] Detectado panel, cargar turnos");
    cargarTurnos();
    setInterval(cargarTurnos, 5000); // cada 5s
  }
});

// -----------------------------
// GENERAR HORARIOS DINÁMICOS (10:00 a 20:00 cada 30')
// y marcar como AGOTADO si ya está reservado
// -----------------------------
async function cargarHorarios() {
  const barbero = document.getElementById("barbero")?.value;
  const horariosDiv = document.getElementById("horarios");
  if (!horariosDiv) return;
  horariosDiv.innerHTML = "";

  if (!barbero) return;

  // Generar slots
  const horarios = [];
  for (let h = 10; h <= 20; h++) {
    horarios.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 20) horarios.push(`${String(h).padStart(2, "0")}:30`);
  }

  try {
    // Pedimos SOLO turnos de hoy (tu doGet ya devuelve hoy)
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("[RESERVA] Turnos (hoy) recibidos:", data);

    // Horarios ocupados para ese barbero hoy
    const ocupados = data
      .filter(t => t.barbero === barbero && normalizarFecha(t.fecha) === hoyAR())
      .map(t => t.hora);

    horarios.forEach(hora => {
      const btn = document.createElement("button");
      btn.type = "button";

      if (ocupados.includes(hora)) {
        btn.textContent = `${hora} (Agotado)`;
        btn.disabled = true;
        btn.className = "agotado";
      } else {
        btn.textContent = hora;
        btn.onclick = () => book(hora);
      }

      horariosDiv.appendChild(btn);
    });
  } catch (err) {
    console.error("[RESERVA] Error cargando horarios:", err);
    showMessage("❌ Error al cargar horarios", "error");
  }
}

// Normaliza fecha a dd/mm/yyyy aunque venga sin ceros
function normalizarFecha(f) {
  try {
    // Si ya viene dd/mm/yyyy con 2 dígitos, devuelvo tal cual
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) return f;

    // Si viene d/m/yyyy o similares, parseo y devuelvo con padStart
    const [d, m, y] = f.split("/");
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  } catch {
    return f;
  }
}

// -----------------------------
// RESERVAR
// -----------------------------
async function book(hora) {
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
    nombre,
    servicio: selectedService,
    barbero,
    hora,
    fecha: hoyAR()
  };

  try {
    console.log("[BOOK] Enviando reserva:", data);
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(data) });
    const txt = await res.text();
    console.log("[BOOK] Respuesta Script:", txt);

    showMessage("✅ Turno reservado correctamente", "success");
    document.getElementById("form-reserva")?.reset();
    selectedService = "";
    // Refrescar horarios (bloquea el recién reservado)
    await cargarHorarios();
  } catch (err) {
    console.error("[BOOK] Error al reservar:", err);
    showMessage("❌ Error al reservar", "error");
  }
}

// -----------------------------
// LOGIN (demo)
// -----------------------------
function loginUser(e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario")?.value;
  const clave = document.getElementById("clave")?.value;

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
function formatDatePretty(fechaStr) {
  // Muestra lindo en el panel
  const [d, m, y] = normalizarFecha(fechaStr).split("/");
  const dt = new Date(`${y}-${m}-${d}T12:00:00`);
  return dt.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(horaStr) {
  if (/^\d{1,2}:\d{2}$/.test(horaStr)) {
    // Con AM/PM
    const [h, min] = horaStr.split(":");
    const date = new Date();
    date.setHours(parseInt(h), parseInt(min), 0, 0);
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  return horaStr;
}

async function cargarTurnos(filtrar = false) {
  const tbody = document.querySelector("#tabla-turnos tbody");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='5'>⏳ Cargando turnos...</td></tr>";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("[PANEL] Turnos (hoy) recibidos:", data);

    let turnos = data;

    // Por defecto: hoy
    if (!filtrar) {
      turnos = data.filter(t => normalizarFecha(t.fecha) === hoyAR());
    }

    // Filtros
    const fb = document.getElementById("filtroBarbero")?.value;
    const ff = document.getElementById("filtroFecha")?.value;
    if (filtrar) {
      if (fb) turnos = turnos.filter(t => t.barbero === fb);
      if (ff) {
        const f = new Date(ff).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
        turnos = turnos.filter(t => normalizarFecha(t.fecha) === f);
      }
    }

    // Orden
    turnos.sort((a, b) => (a.barbero || "").localeCompare(b.barbero || "") || (a.hora || "").localeCompare(b.hora || ""));

    // Pintar
    if (turnos.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>📭 No hay turnos</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    turnos.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.nombre || ""}</td>
        <td>${t.servicio || ""}</td>
        <td>${t.barbero || ""}</td>
        <td>${formatTime(t.hora || "")}</td>
        <td>${formatDatePretty(t.fecha || "")}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("[PANEL] Error cargando turnos:", err);
    tbody.innerHTML = "<tr><td colspan='5'>❌ Error al cargar los turnos</td></tr>";
  }
}

function aplicarFiltro() {
  cargarTurnos(true);
}

// -----------------------------
// MENSAJES
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
