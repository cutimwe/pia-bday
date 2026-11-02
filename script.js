const cfg = window.PIA_SITE || {};
const $ = id => document.getElementById(id);
const birthdayTime = new Date(cfg.birthday || "2026-11-03T00:00:00+08:00").getTime();
// Kahit lampas na ang birthday, may 20-second countdown muna bago mag-unlock
const COUNTDOWN_MS = 20 * 1000;
const target = Math.max(birthdayTime, Date.now() + COUNTDOWN_MS);

// Preview mode: open index.html?preview=1 to view the inside early
const preview = new URLSearchParams(location.search).get("preview") === "1";
function locked() { return !preview && Date.now() < target; }

/* ---------- Countdown + lock state ---------- */
function update() {
  const n = Math.max(0, target - Date.now());
  const s = Math.floor(n / 1000);
  $("days").textContent = String(Math.floor(s / 86400)).padStart(2, "0");
  $("hours").textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, "0");
  $("mins").textContent = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
  $("secs").textContent = String(s % 60).padStart(2, "0");
  $("unlockBtn").textContent = locked() ? "🔒 Locked" : "♡ Open your gifts ♡";
}
update();
setInterval(update, 1000);

/* ---------- Page navigation ---------- */
const pages = ["home", "gifts", "letter", "roses", "cake"];
function show(id) {
  pages.forEach(p => $(p).classList.toggle("hidden", p !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("unlockBtn").onclick = () => {
  if (locked()) $("lockModal").classList.remove("hidden");
  else show("gifts");
};
$("okay").onclick = () => $("lockModal").classList.add("hidden");

document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => {
  if (locked()) { $("lockModal").classList.remove("hidden"); return; }
  const id = b.dataset.open;
  show(id);
  if (id === "letter") typeLetter();
});
document.querySelectorAll(".back").forEach(b => b.onclick = () => show("gifts"));

/* ---------- Letter typing ---------- */
let typing;
function typeLetter() {
  clearInterval(typing);
  const t = cfg.letter || "Happy Birthday, Ate Pia! ♡";
  const chars = Array.from(t);
  $("letterText").textContent = "";
  let i = 0;
  typing = setInterval(() => {
    $("letterText").textContent += chars[i++] || "";
    if (i > chars.length) clearInterval(typing);
  }, 24);
}

/* ---------- Cake wish ---------- */
let blown = false;
$("wishBtn").onclick = () => {
  blown = !blown;
  $("flames").classList.toggle("off", blown);
  $("wishCopy").textContent = blown ? "Your wish is on its way! ♡" : "Your candles are waiting...";
  $("wishBtn").textContent = blown ? "Light the candles again ♡" : "Make a wish ♡";
};

/* ---------- Music ---------- */
const audio = $("bgm");
audio.loop = true;
audio.volume = 0.5;
audio.preload = "auto";

function setMusicLabel() { $("musicLabel").textContent = audio.paused ? "Play music" : "Pause music"; }
audio.addEventListener("play", setMusicLabel);
audio.addEventListener("pause", setMusicLabel);

let userPaused = false;
async function tryPlay() {
  try { await audio.play(); } catch (e) { /* blocked until user interacts */ }
  setMusicLabel();
}

$("musicToggle").onclick = async (e) => {
  e.stopPropagation();
  if (audio.paused) { userPaused = false; await tryPlay(); }
  else { userPaused = true; audio.pause(); }
  setMusicLabel();
};

// Browsers block autoplay with sound, so start on the first tap/click anywhere
function firstInteraction() {
  if (!userPaused && audio.paused) tryPlay();
  if (!audio.paused) {
    ["click", "touchstart", "keydown"].forEach(ev => document.removeEventListener(ev, firstInteraction));
  }
}
["click", "touchstart", "keydown"].forEach(ev => document.addEventListener(ev, firstInteraction));
tryPlay();
setMusicLabel();

/* ---------- Falling petals ---------- */
function petal() {
  const e = document.createElement("span");
  e.className = "petal";
  e.textContent = Math.random() > .5 ? "🌹" : "🌸";
  e.style.left = Math.random() * 100 + "vw";
  e.style.setProperty("--drift", (Math.random() * 140 - 70) + "px");
  e.style.animationDuration = (8 + Math.random() * 7) + "s";
  $("petals").append(e);
  setTimeout(() => e.remove(), 16000);
}
setInterval(petal, 900);
