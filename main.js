let hue = 24;
let sat = 100;
let light = 50;

const slPanel = document.getElementById("slPanel");
const slThumb = document.getElementById("slThumb");
const hueSlider = document.getElementById("hueSlider");
const hueHandle = document.getElementById("hueHandle");
const preview = document.getElementById("preview");
const previewLabel = document.getElementById("previewLabel");
const alphaRange = document.getElementById("alphaRange");
const alphaValue = document.getElementById("alphaValue");
const savedList = document.getElementById("savedList");
const saveColorBtn = document.getElementById("saveColorBtn");

/* HSL → RGB */
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs((h/60)%2 - 1));
  const m = l - c/2;
  let r1,g1,b1;

  if (h < 60) { r1=c; g1=x; b1=0; }
  else if (h < 120) { r1=x; g1=c; b1=0; }
  else if (h < 180) { r1=0; g1=c; b1=x; }
  else if (h < 240) { r1=0; g1=x; b1=c; }
  else if (h < 300) { r1=x; g1=0; b1=c; }
  else { r1=c; g1=0; b1=x; }

  return {
    r: Math.round((r1+m)*255),
    g: Math.round((g1+m)*255),
    b: Math.round((b1+m)*255)
  };
}

/* RGB → HEX */
function rgbToHex(r,g,b){
  const toHex = v => v.toString(16).padStart(2,"0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

/* UI更新 */
function updateUI(){
  const alpha = alphaRange.value / 100;
  const {r,g,b} = hslToRgb(hue,sat,light);
  const hex = rgbToHex(r,g,b);

  preview.style.backgroundColor = hex;
  previewLabel.textContent = hex;

  document.querySelector('[data-type="hex"] [data-code]').textContent = hex;
  document.querySelector('[data-type="rgb"] [data-code]').textContent = `rgb(${r}, ${g}, ${b})`;
  document.querySelector('[data-type="hsl"] [data-code]').textContent = `hsl(${hue}, ${sat}%, ${light}%)`;
  document.querySelector('[data-type="rgba"] [data-code]').textContent = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;

  alphaValue.textContent = alpha.toFixed(2);

  slPanel.style.background = `hsl(${hue},100%,50%)`;

  const rect = slPanel.getBoundingClientRect();
  slThumb.style.left = `${(sat/100)*rect.width}px`;
  slThumb.style.top  = `${((100-light)/100)*rect.height}px`;

  const rect2 = hueSlider.getBoundingClientRect();
  hueHandle.style.top = `${(hue/360)*rect2.height}px`;
}

/* SLパネル操作 */
function handleSLMove(x,y){
  const rect = slPanel.getBoundingClientRect();
  let px = Math.max(0, Math.min(rect.width, x - rect.left));
  let py = Math.max(0, Math.min(rect.height, y - rect.top));

  sat = Math.round((px/rect.width)*100);
  light = Math.round(100 - (py/rect.height)*100);

  updateUI();
}

slPanel.addEventListener("mousedown", e=>{
  slThumb.classList.add("active");
  preview.classList.add("active");

  const move = ev => handleSLMove(ev.clientX, ev.clientY);
  const up = ()=>{
    slThumb.classList.remove("active");
    preview.classList.remove("active");
    window.removeEventListener("mousemove",move);
    window.removeEventListener("mouseup",up);
  };

  move(e);
  window.addEventListener("mousemove",move);
  window.addEventListener("mouseup",up);
});

slPanel.addEventListener("touchstart", e=>{
  e.preventDefault();
  slThumb.classList.add("active");
  preview.classList.add("active");

  const move = ev=>{
    ev.preventDefault();
    const t = ev.touches[0];
    handleSLMove(t.clientX, t.clientY);
  };
  const end = ()=>{
    slThumb.classList.remove("active");
    preview.classList.remove("active");
    window.removeEventListener("touchmove",move);
    window.removeEventListener("touchend",end);
  };

  const t = e.touches[0];
  handleSLMove(t.clientX, t.clientY);

  window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("touchend",end);
});

/* Hueスライダー */
function handleHueMove(y){
  const rect = hueSlider.getBoundingClientRect();
  let py = Math.max(0, Math.min(rect.height, y - rect.top));
  hue = Math.round((py/rect.height)*360);
  updateUI();
}

hueSlider.addEventListener("mousedown", e=>{
  hueHandle.classList.add("active");
  preview.classList.add("active");

  const move = ev => handleHueMove(ev.clientY);
  const up = ()=>{
    hueHandle.classList.remove("active");
    preview.classList.remove("active");
    window.removeEventListener("mousemove",move);
    window.removeEventListener("mouseup",up);
  };

  move(e);
  window.addEventListener("mousemove",move);
  window.addEventListener("mouseup",up);
});

hueSlider.addEventListener("touchstart", e=>{
  e.preventDefault();
  hueHandle.classList.add("active");
  preview.classList.add("active");

  const move = ev=>{
    ev.preventDefault();
    const t = ev.touches[0];
    handleHueMove(t.clientY);
  };
  const end = ()=>{
    hueHandle.classList.remove("active");
    preview.classList.remove("active");
    window.removeEventListener("touchmove",move);
    window.removeEventListener("touchend",end);
  };

  const t = e.touches[0];
  handleHueMove(t.clientY);

  window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("touchend",end);
});

/* Alpha */
alphaRange.addEventListener("input", updateUI);

/* 保存機能 */
function getSaved(){
  try { return JSON.parse(localStorage.getItem("savedColors")||"[]"); }
  catch { return []; }
}

function setSaved(arr){
  localStorage.setItem("savedColors", JSON.stringify(arr));
}

function saveColor(){
  const a = alphaRange.value/100;
  const {r,g,b} = hslToRgb(hue,sat,light);
  const hex = rgbToHex(r,g,b);

  const color = {hex,r,g,b,h:hue,s:sat,l:light,a};

  const saved = getSaved();
  if(!saved.find(c=>c.hex===hex && c.a===a)){
    saved.push(color);
    setSaved(saved);
    renderSaved();
  }
}

function renderSaved(){
  const saved = getSaved();
  savedList.innerHTML = "";

  saved.forEach(c=>{
    const div = document.createElement("div");
    div.className = "saved-item";
    div.style.backgroundColor = c.hex;

    div.addEventListener("click", ()=>{
      hue = c.h;
      sat = c.s;
      light = c.l;
      alphaRange.value = c.a*100;
      updateUI();
    });

    savedList.appendChild(div);
  });
}

saveColorBtn.addEventListener("click", saveColor);

/* 初期化 */
updateUI();
renderSaved();
