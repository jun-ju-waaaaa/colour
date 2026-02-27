function getSavedColors() {
  try {
    return JSON.parse(localStorage.getItem("savedColors") || "[]");
  } catch {
    return [];
  }
}

function setSavedColors(colors) {
  localStorage.setItem("savedColors", JSON.stringify(colors));
}

function saveCurrentColor() {
  const alpha = parseFloat(alphaRange.value) / 100;
  const { r, g, b } = hslToRgb(hue, sat, light);
  const hex = rgbToHex(r, g, b);

  const color = {
    hex,
    r,
    g,
    b,
    h: hue,
    s: sat,
    l: light,
    a: alpha
  };

  const saved = getSavedColors();

  if (!saved.find(c => c.hex === color.hex && c.a === color.a)) {
    saved.push(color);
    setSavedColors(saved);
    renderSavedColors();
  }
}

function renderSavedColors() {
  const saved = getSavedColors();
  savedList.innerHTML = "";

  saved.forEach((c) => {
    const div = document.createElement("div");
    div.className = "saved-item";
    div.style.backgroundColor = c.hex;

    div.addEventListener("click", () => {
      hue = c.h;
      sat = c.s;
      light = c.l;
      alphaRange.value = c.a * 100;
      updateUI();
    });

    savedList.appendChild(div);
  });
}

saveColorBtn.addEventListener("click", saveCurrentColor);
renderSavedColors();
