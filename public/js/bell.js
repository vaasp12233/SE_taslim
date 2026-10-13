let audioCtx = null;
let bellsRungCount = 0;

// Play a chime using Web Audio API (no sound file needed)
function playBell() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now + i * 0.5);
      gain.gain.setValueAtTime(0, now + i * 0.5);
      gain.gain.linearRampToValueAtTime(0.4, now + i * 0.5 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 0.45);
      osc.start(now + i * 0.5);
      osc.stop(now + i * 0.5 + 0.5);
    }
    bellsRungCount++;
    const bc = document.getElementById("bellCount");
    if (bc) bc.textContent = bellsRungCount;
  } catch (e) {
    console.warn("Bell failed:", e);
  }
}

function showNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") new Notification(title, { body });
}

async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

const rungBells = new Set();

function checkBells(entries) {
  const now = new Date();
  const hhmm =
    String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

  entries.forEach(entry => {
    const startKey = `${entry._id}-start-${entry.startTime}`;
    const endKey = `${entry._id}-end-${entry.endTime}`;

    if (entry.startTime === hhmm && !rungBells.has(startKey)) {
      rungBells.add(startKey);
      playBell();
      showNotification("🔔 Period Starting", `${entry.subject} (${entry.room || "class"})`);
      highlightBell(`🔔 ${entry.subject} period started`);
    }
    if (entry.endTime === hhmm && !rungBells.has(endKey)) {
      rungBells.add(endKey);
      playBell();
      showNotification("🔔 Period Ended", `${entry.subject} ended`);
      highlightBell(`🔔 ${entry.subject} period ended`);
    }
  });
}

function highlightBell(text) {
  const el = document.getElementById("bellStatus");
  if (!el) return;
  el.classList.add("active");
  el.innerHTML = `${text} at ${new Date().toLocaleTimeString()}`;
  setTimeout(() => el.classList.remove("active"), 5000);
}
