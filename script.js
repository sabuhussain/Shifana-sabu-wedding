const seal=document.getElementById("seal"),env=document.getElementById("envelope"),stage=document.getElementById("envelopeStage");
seal.addEventListener("click",()=>{env.classList.add("open");setTimeout(()=>{stage.classList.add("done");document.body.classList.remove("locked")},1900);setTimeout(()=>stage.remove(),3000)});

const wedding=new Date("2026-12-27T11:00:00+05:30");
function tick(){let x=Math.max(0,wedding-new Date()),a=[Math.floor(x/86400000),Math.floor(x/3600000)%24,Math.floor(x/60000)%60,Math.floor(x/1000)%60];["d","h","m","s"].forEach((id,i)=>document.getElementById(id).textContent=String(a[i]).padStart(i?2:3,"0"))}tick();setInterval(tick,1000);
const reveals=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("show")}),{threshold:.12});
 reveals.forEach(e=>io.observe(e));
}else{reveals.forEach(e=>e.classList.add("show"));}

const c=document.getElementById("scratch"),wrap=document.getElementById("scratchWrap"),ctx=c.getContext("2d");let drawing=false,cleared=false;
function setup(){let r=wrap.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);c.width=r.width*dpr;c.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation="source-over";let g=ctx.createLinearGradient(0,0,r.width,r.height);g.addColorStop(0,"#879c89");g.addColorStop(.5,"#d8c58e");g.addColorStop(1,"#738875");ctx.fillStyle=g;ctx.fillRect(0,0,r.width,r.height);ctx.fillStyle="#fffdf8";ctx.textAlign="center";ctx.font="18px Cormorant Garamond";ctx.fillText("Scratch to reveal",r.width/2,r.height/2);ctx.globalCompositeOperation="destination-out"}setup();
function scratch(e){if(!drawing)return;let r=c.getBoundingClientRect(),p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e,x=p.clientX-r.left,y=p.clientY-r.top;ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill()}
["pointerdown","touchstart"].forEach(n=>c.addEventListener(n,e=>{drawing=true;scratch(e)},{passive:false}));["pointermove","touchmove"].forEach(n=>c.addEventListener(n,e=>{if(drawing){e.preventDefault();scratch(e)}},{passive:false}));["pointerup","pointercancel","touchend"].forEach(n=>window.addEventListener(n,()=>drawing=false));
window.addEventListener("resize",()=>{if(!cleared)setup()});
document.getElementById("form").onsubmit=e=>{e.preventDefault();document.getElementById("thanks").textContent="Thank you — RSVP captured in this demo."};
// Background wedding music: begins after the guest taps the wax seal.
const music=document.getElementById("weddingMusic"),musicToggle=document.getElementById("musicToggle"),
musicControl=document.getElementById("musicControl"),musicStatus=document.getElementById("musicStatus"),musicIcon=document.getElementById("musicIcon");
let musicStarted=false;
function setMusicUI(playing){musicControl.classList.toggle("playing",playing);musicStatus.textContent=playing?"Playing":"Paused";musicIcon.textContent=playing?"♫":"♪";musicToggle.setAttribute("aria-label",playing?"Pause background music":"Play background music")}
seal.addEventListener("click",async()=>{musicControl.classList.add("visible");if(!musicStarted){musicStarted=true;try{await music.play();setMusicUI(true)}catch(e){setMusicUI(false)}}});
musicToggle.addEventListener("click",async()=>{if(music.paused){try{await music.play();setMusicUI(true)}catch(e){setMusicUI(false)}}else{music.pause();setMusicUI(false)}});
music.addEventListener("ended",()=>setMusicUI(false));
