const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token || user.role !== "admin") window.location.href = "index.html";
document.getElementById("welcome").textContent = `Hi, ${user.username}`;

let editingId = null;

function showTab(name, btn) {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("tab-timetable").classList.toggle("hidden", name !== "timetable");
  document.getElementById("tab-users").classList.toggle("hidden", name !== "users");
}

async function loadEntries() {
  const section = document.getElementById("filter-section").value.trim();
  const day = document.getElementById("filter-day").value;
  const params = new URLSearchParams();
  if (section) params.set("section", section);
  if (day) params.set("day", day);

  const res = await fetch("/api/timetable?" + params, {
    headers: { Authorization: "Bearer " + token },
  });
  const entries = await res.json();

  document.getElementById("entriesBody").innerHTML =
    entries
      .map(
        e => `
    <tr>
      <td>${e.section}</td><td>${e.day}</td><td>${e.period}</td>
      <td>${e.startTime} - ${e.endTime}</td>
      <td>${e.subject}</td><td>${e.teacher || "-"}</td><td>${e.room || "-"}</td>
      <td>
        <button onclick='editEntry(${JSON.stringify(e).replace(/'/g, "&apos;")})'>✏️</button>
        <button class="danger" onclick="deleteEntry('${e._id}')">🗑️</button>
      </td>
    </tr>`
      )
      .join("") || '<tr><td colspan="8" style="text-align:center;">No entries</td></tr>';
}

function editEntry(e) {
  editingId = e._id;
  document.getElementById("formTitle").textContent = "Update Timetable Entry";
  document.getElementById("f-section").value = e.section;
  document.getElementById("f-day").value = e.day;
  document.getElementById("f-period").value = e.period;
  document.getElementById("f-subject").value = e.subject;
  document.getElementById("f-teacher").value = e.teacher || "";
  document.getElementById("f-room").value = e.room || "";
  document.getElementById("f-start").value = e.startTime;
  document.getElementById("f-end").value = e.endTime;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  document.getElementById("formTitle").textContent = "Add Timetable Entry";
  ["f-section", "f-period", "f-subject", "f-teacher", "f-room", "f-start", "f-end"].forEach(
    id => (document.getElementById(id).value = "")
  );
}

async function saveEntry() {
  const body = {
    section: document.getElementById("f-section").value.trim(),
    day: document.getElementById("f-day").value,
    period: Number(document.getElementById("f-period").value),
    subject: document.getElementById("f-subject").value.trim(),
    teacher: document.getElementById("f-teacher").value.trim(),
    room: document.getElementById("f-room").value.trim(),
    startTime: document.getElementById("f-start").value,
    endTime: document.getElementById("f-end").value,
  };
  if (!body.section || !body.subject || !body.startTime || !body.endTime || !body.period)
    return alert("Please fill all required fields");

  const url = editingId ? `/api/timetable/${editingId}` : "/api/timetable";
  const method = editingId ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(body),
  });
  if (!res.ok) return alert("Failed to save");
  resetForm();
  loadEntries();
}

async function deleteEntry(id) {
  if (!confirm("Delete this entry?")) return;
  await fetch(`/api/timetable/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
  loadEntries();
}

async function createUser() {
  const body = {
    username: document.getElementById("u-username").value.trim(),
    password: document.getElementById("u-password").value,
    role: document.getElementById("u-role").value,
    section: document.getElementById("u-section").value.trim(),
  };
  const msg = document.getElementById("userMsg");
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    msg.style.color = "green";
    msg.textContent = "✅ User created";
    ["u-username", "u-password", "u-section"].forEach(
      id => (document.getElementById(id).value = "")
    );
  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "❌ " + err.message;
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

loadEntries();
