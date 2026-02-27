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

/* ------------------------------
   HSL → RGB
------------------------------ */
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1, g1, b1;

  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return { r, g, b };
}

/* ------------------------------
   RGB → HEX
------------------------------ */
function rgbToHex(r, g, b) {
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

/* ------------------------------
   UI更新
------------------------------ */
function updateSLPanel() {
  slPanel.style.background = `hsl(${hue}, 100%, 50%)`;
}

function updateThumbPosition() {
  const rect = slPanel.getBoundingClientRect();
  const x = (sat / 100) * rect.width;
  const y = ((100 - light) / 100) * rect.height;
  slThumb.style.left = `${x}px`;
  slThumb.style.top = `${y}px`;
}

function updateHueHandle() {
  const rect = hueSlider.getBoundingClientRect();
  const percent = hue / 360;
  hueHandle.style.top = `${percent * rect.height}px`;
}

function updateUI() {
  const alpha = parseInt(alphaRange.value, 10) / 100;
  const { r, g, b } = hslToRgb(hue, sat, light);
  const hex = rgbToHex(r, g, b);

  preview.style.backgroundColor = hex;
  previewLabel.textContent = hex;

  document.querySelector('[data-type="hex"] [data-code]').textContent = hex;
  document.querySelector('[data-type="rgb"] [data-code]').textContent =
    `rgb(${r}, ${g}, ${b})`;
  document.querySelector('[data-type="hsl"] [data-code]').textContent =
    `hsl(${hue}, ${sat}%, ${light}%)`;
  document.querySelector('[data-type="rgba"] [data-code]').textContent =
    `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;

  alphaValue.textContent = alpha.toFixed(2);

  updateSLPanel();
  updateThumbPosition();
  updateHueHandle();
}

/* ------------------------------
   共通：SLパネル操作
------------------------------ */
function handleSLMove(clientX, clientY) {
  const rect = slPanel.getBoundingClientRect();
  let x = clientX - rect.left;
  let y = clientY - rect.top;

  x = Math.max(0, Math.min(rect.width, x));
  y = Math.max(0, Math.min(rect.height, y));

  sat = Math.round((x / rect.width) * 100);
  light = Math.round(100 - (y / rect.height) * 100);

  updateUI();
}

/* PC */
slPanel.addEventListener("mousedown", (e) => {
  const move = (ev) => handleSLMove(ev.clientX, ev.clientY);
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  move(e);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
});

/* スマホ */
slPanel.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const move = (ev) => {
    const t = ev.touches[0];
    handleSLMove(t.clientX, t.clientY);
  };
  const end = () => {
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", end);
  };
  move(e.touches[0]);
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", end);
});

/* ------------------------------
   共通：Hueスライダー操作
------------------------------ */
function handleHueMove(clientY) {
  const rect = hueSlider.getBoundingClientRect();
  let y = clientY - rect.top;
  y = Math.max(0, Math.min(rect.height, y));
  hue = Math.round((y / rect.height) * 360);
  updateUI();
}

/* PC */
hueSlider.addEventListener("mousedown", (e) => {
  const move = (ev) => handleHueMove(ev.clientY);
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  move(e);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
});

/* スマホ */
hueSlider.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const move = (ev) => {
    const t = ev.touches[0];
    handleHueMove(t.clientY);
  };
  const end = () => {
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", end);
  };
  move(e.touches[0]);
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", end);
});

/* ------------------------------
   Alphaスライダー
------------------------------ */
alphaRange.addEventListener("input", updateUI);

/* ------------------------------
   コピー機能
------------------------------ */
document.querySelectorAll(".code-card").forEach((card) => {
  const btn = card.querySelector(".copy-btn");
  const textEl = card.querySelector("[data-code]");
  const badge = card.querySelector(".copy-badge");

  btn.addEventListener("click", async () => {
    const value = textEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(value);
      badge.classList.add("visible");
      setTimeout(() => badge.classList.remove("visible"), 900);
    } catch (e) {
      console.warn("Copy failed", e);
    }
  });
});

/* 初期描画 */
updateUI();
