const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token) window.location.href = "index.html";
document.getElementById("welcome").textContent = `Hi, ${user.username}`;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let todayEntries = [];

const toMin = hhmm => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

async function loadTimetable() {
  const today = DAYS[new Date().getDay()];
  document.getElementById("today").textContent = today;

  const section = user.section || "";
  const url = `/api/timetable?day=${today}` + (section ? `&section=${section}` : "");
  const res = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  todayEntries = await res.json();
  renderTable();
  updateCurrentNext();
}

function renderTable() {
  const tbody = document.getElementById("timetableBody");
  if (todayEntries.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">No classes today 🎉</td></tr>';
    return;
  }
  tbody.innerHTML = todayEntries
    .map(
      e => `
    <tr id="row-${e._id}">
      <td>${e.period}</td>
      <td>${e.startTime} - ${e.endTime}</td>
      <td>${e.subject}</td>
      <td>${e.teacher || "-"}</td>
      <td>${e.room || "-"}</td>
    </tr>`
    )
    .join("");
}

function updateCurrentNext() {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  let current = null,
    next = null;

  for (const e of todayEntries) {
    const s = toMin(e.startTime),
      en = toMin(e.endTime);
    if (cur >= s && cur < en) current = e;
    else if (s > cur && (!next || s < toMin(next.startTime))) next = e;
  }

  document.getElementById("currentPeriod").textContent = current ? current.subject : "Free";
  document.getElementById("nextPeriod").textContent = next ? next.subject : "--";

  document.querySelectorAll("tr").forEach(r => r.classList.remove("current-period", "next-period"));
  if (current) document.getElementById(`row-${current._id}`)?.classList.add("current-period");
  if (next) document.getElementById(`row-${next._id}`)?.classList.add("next-period");
}

function tick() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString();
  updateCurrentNext();
  checkBells(todayEntries);
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

requestNotificationPermission();
loadTimetable();
setInterval(tick, 1000);
setInterval(loadTimetable, 60000);
