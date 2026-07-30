/* ============================================================
   SHIFANA & SABU — WEDDING INVITATION
   Interaction layer: envelope, countdown, scroll reveal,
   scratch card, RSVP, background music.
   ============================================================ */

/* ---------- Envelope open ---------- */
const seal = document.getElementById("seal");
const stage = document.getElementById("envelopeStage");

seal.addEventListener("click", () => {
  stage.classList.add("done");
  document.body.classList.remove("locked");
  setTimeout(() => {
    stage.remove();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 700);
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

/* ---------- Scratch heart ---------- */
const canvas = document.getElementById("scratch");
const wrap = document.getElementById("scratchWrap");
const ctx = canvas.getContext("2d");
let drawing = false;
let scratchOpened = sessionStorage.getItem("weddingScratchOpened") === "1";
let scratchDistance = 0;
let lastScratchPoint = null;

function openScratchHeart() {
  if (scratchOpened) return;
  scratchOpened = true;
  sessionStorage.setItem("weddingScratchOpened", "1");
  wrap.classList.add("scratch-open");
}

function setupScratch() {
  if (scratchOpened) {
    wrap.classList.add("scratch-open");
    return;
  }
  const r = wrap.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  const g = ctx.createRadialGradient(r.width*.48,r.height*.38,10,r.width*.5,r.height*.5,r.width*.65);
  g.addColorStop(0, "#8d2a3f");
  g.addColorStop(.55, "#681829");
  g.addColorStop(1, "#3e0b16");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,r.width,r.height);
  ctx.globalCompositeOperation = "destination-out";
}
setupScratch();

function scratch(e) {
  if (!drawing || scratchOpened) return;
  const r = canvas.getBoundingClientRect();
  const p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  const x = p.clientX-r.left, y=p.clientY-r.top;
  ctx.beginPath(); ctx.arc(x,y,30,0,Math.PI*2); ctx.fill();

  if (lastScratchPoint) scratchDistance += Math.hypot(x-lastScratchPoint.x,y-lastScratchPoint.y);
  lastScratchPoint={x,y};

  // A short swipe is enough; after opening it never redraws during this visit.
  if (scratchDistance > Math.min(95, r.width*.27)) {
    drawing=false;
    setTimeout(openScratchHeart, 90);
  }
}
["pointerdown","touchstart"].forEach(n=>canvas.addEventListener(n,e=>{
  drawing=true; lastScratchPoint=null; scratch(e);
},{passive:false}));
["pointermove","touchmove"].forEach(n=>canvas.addEventListener(n,e=>{
  if(drawing){e.preventDefault();scratch(e);}
},{passive:false}));
["pointerup","pointercancel","touchend"].forEach(n=>window.addEventListener(n,()=>{
  drawing=false;lastScratchPoint=null;
}));
window.addEventListener("resize",()=>{ if(!scratchOpened) setupScratch(); });

/* ---------- RSVP form ---------- */
const form = document.getElementById("form");
const thanks = document.getElementById("thanks");
if (form && thanks) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.style.opacity = ".7";
    thanks.textContent = "Thank you — we can't wait to celebrate with you.";
    setTimeout(() => { btn.disabled = false; btn.style.opacity = "1"; }, 1200);
  });
}

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


/* ---------- Seamless left-moving photo rotation ---------- */
(() => {
  const rail = document.querySelector(".photo-rail");
  if (!rail || rail.dataset.loopReady === "1") return;
  rail.dataset.loopReady = "1";

  const originals = Array.from(rail.children);
  if (originals.length < 2) return;

  // Duplicate the full strip so the leftward movement can wrap invisibly.
  originals.forEach(el => {
    const clone = el.cloneNode(true);
    clone.setAttribute("aria-hidden","true");
    rail.appendChild(clone);
  });

  let paused = false;
  let resumeTimer;
  let last = performance.now();
  const speed = 92; // px/sec, visibly moving but still elegant

  function pauseThenResume(){
    paused = true;
    rail.classList.add("gallery-auto-paused");
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      paused = false;
      rail.classList.remove("gallery-auto-paused");
      last = performance.now();
    }, 1600);
  }

  ["pointerdown","touchstart","wheel"].forEach(type =>
    rail.addEventListener(type,pauseThenResume,{passive:true})
  );

  function frame(now){
    const dt = Math.min((now-last)/1000,.05);
    last = now;
    if(!paused){
      rail.scrollLeft += speed * dt;
      const halfway = rail.scrollWidth / 2;
      if(rail.scrollLeft >= halfway) rail.scrollLeft -= halfway;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
