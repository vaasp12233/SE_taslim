async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");
  msg.textContent = "";

  if (!username || !password) {
    msg.textContent = "Please fill all fields";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    window.location.href = data.role === "admin" ? "admin.html" : "dashboard.html";
  } catch (err) {
    msg.textContent = err.message;
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter") login();
});
