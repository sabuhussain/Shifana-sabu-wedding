/* ============================================================
   SHIFANA & SABU — WEDDING INVITATION
   Interaction layer: envelope, countdown, scroll reveal,
   scratch card, RSVP, background music.
   ============================================================ */

/* ---------- Envelope open ---------- */
const seal = document.getElementById("seal");
const env = document.getElementById("envelope");
const stage = document.getElementById("envelopeStage");

seal.addEventListener("click", () => {
  env.classList.add("open");
  setTimeout(() => {
    stage.classList.add("done");
    document.body.classList.remove("locked");
  }, 1500);
  setTimeout(() => stage.remove(), 2600);
});

/* ---------- Countdown ---------- */
const wedding = new Date("2026-12-27T11:00:00+05:30");
function tick() {
  const diff = Math.max(0, wedding - new Date());
  const parts = [
    Math.floor(diff / 86400000),
    Math.floor(diff / 3600000) % 24,
    Math.floor(diff / 60000) % 60,
    Math.floor(diff / 1000) % 60,
  ];
  ["d", "h", "m", "s"].forEach((id, i) => {
    document.getElementById(id).textContent = String(parts[i]).padStart(i ? 2 : 3, "0");
  });
}
tick();
setInterval(tick, 1000);

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        io.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("show"));
}

/* ---------- Scratch card ---------- */
const canvas = document.getElementById("scratch");
const wrap = document.getElementById("scratchWrap");
const ctx = canvas.getContext("2d");
let drawing = false;

function setupScratch() {
  const r = wrap.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  const g = ctx.createLinearGradient(0, 0, r.width, r.height);
  g.addColorStop(0, "#7c2436");
  g.addColorStop(0.5, "#c9a24d");
  g.addColorStop(1, "#5c1626");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, r.width, r.height);

  ctx.fillStyle = "#fbf7ef";
  ctx.textAlign = "center";
  ctx.font = "18px 'Cormorant Garamond'";
  ctx.fillText("Scratch to reveal", r.width / 2, r.height / 2);

  ctx.globalCompositeOperation = "destination-out";
}
setupScratch();

function scratch(e) {
  if (!drawing) return;
  const r = canvas.getBoundingClientRect();
  const p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  const x = p.clientX - r.left;
  const y = p.clientY - r.top;
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
}

["pointerdown", "touchstart"].forEach((n) =>
  canvas.addEventListener(n, (e) => { drawing = true; scratch(e); }, { passive: false })
);
["pointermove", "touchmove"].forEach((n) =>
  canvas.addEventListener(n, (e) => { if (drawing) { e.preventDefault(); scratch(e); } }, { passive: false })
);
["pointerup", "pointercancel", "touchend"].forEach((n) =>
  window.addEventListener(n, () => (drawing = false))
);
window.addEventListener("resize", () => setupScratch());

/* ---------- RSVP form ---------- */
const form = document.getElementById("form");
const thanks = document.getElementById("thanks");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.style.opacity = ".7";
  thanks.textContent = "Thank you — we can't wait to celebrate with you.";
  setTimeout(() => { btn.disabled = false; btn.style.opacity = "1"; }, 1200);
});

/* ---------- Background music ---------- */
const music = document.getElementById("weddingMusic");
const musicToggle = document.getElementById("musicToggle");
const musicControl = document.getElementById("musicControl");
const musicStatus = document.getElementById("musicStatus");
const musicIcon = document.getElementById("musicIcon");
let musicStarted = false;

function setMusicUI(playing) {
  musicControl.classList.toggle("playing", playing);
  musicStatus.textContent = playing ? "Playing" : "Paused";
  musicIcon.textContent = playing ? "♫" : "♪";
  musicToggle.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
}

seal.addEventListener("click", async () => {
  musicControl.classList.add("visible");
  if (!musicStarted) {
    musicStarted = true;
    try { await music.play(); setMusicUI(true); }
    catch (e) { setMusicUI(false); }
  }
});

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try { await music.play(); setMusicUI(true); }
    catch (e) { setMusicUI(false); }
  } else {
    music.pause();
    setMusicUI(false);
  }
});

music.addEventListener("ended", () => setMusicUI(false));
