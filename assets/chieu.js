/* Chiếu ghi bài: màn hình lớn cho máy chiếu, mỗi phần một trang, chữ to, kẻ dòng như trang vở.
   Phím: ← → (hoặc PageUp/PageDown của bút trình chiếu) chuyển phần, + − đổi cỡ chữ, F toàn màn hình, Esc đóng.
   Dùng chung cho trang học sinh (chế độ GV) và trang giáo viên. */
(function(){
"use strict";
const L = window.LESSON;
function el(tag, attrs, html){ const e = document.createElement(tag); if (attrs) for (const a in attrs) e.setAttribute(a, attrs[a]); if (html != null) e.innerHTML = html; return e; }
function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e) { return null; } }

/* Danh sách trang: mỗi mục "Ghi bài" của từng bước, thêm một trang tổng kết cả bài */
const PARTS = [];
L.STAGES.forEach(st => st.acts.forEach(a => { if (a.ghi && L.CONCEPTS[a.concept]) PARTS.push({id: a.concept, label: st.code + ". " + st.title, ids: [a.concept]}); }));
if (PARTS.length > 1) PARTS.push({id: "*", label: "Tổng kết cả bài", ids: PARTS.map(p => p.id)});

const FS_KEY = "chieu-fs", FS_MIN = 18, FS_MAX = 64;
let box = null, idx = 0, fs = Number(store(FS_KEY)) || 32, onShow = null, lastFocus = null;

function build(){
  box = el("div", {class: "chieu", role: "dialog", "aria-modal": "true", "aria-label": "Chiếu ghi bài", hidden: ""});
  box.innerHTML =
    '<div class="chieu-top"><span class="chieu-bai"></span><span class="chieu-part"></span><span class="chieu-n"></span></div>' +
    '<div class="chieu-body"><div class="concept ghi chieu-page"></div></div>' +
    '<div class="chieu-bar">' +
      '<button class="btn" type="button" data-k="prev">← Trước</button>' +
      '<span class="chieu-dots"></span>' +
      '<button class="btn primary" type="button" data-k="next">Tiếp →</button>' +
      '<span class="chieu-sp"></span>' +
      '<button class="btn" type="button" data-k="minus" aria-label="Chữ nhỏ hơn">A−</button>' +
      '<button class="btn" type="button" data-k="plus" aria-label="Chữ to hơn">A+</button>' +
      '<button class="btn" type="button" data-k="full">Toàn màn hình</button>' +
      '<button class="btn" type="button" data-k="close">Đóng ✕</button>' +
    "</div>";
  box.querySelector(".chieu-bai").textContent = L.title;
  const dots = box.querySelector(".chieu-dots");
  PARTS.forEach((p, i) => { const d = el("button", {type: "button", class: "chieu-dot", title: p.label, "aria-label": p.label}, p.id === "*" ? "★" : String(i + 1)); d.addEventListener("click", () => go(i)); dots.appendChild(d); });
  box.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return;
    const k = b.dataset.k;
    if (k === "prev") go(idx - 1); else if (k === "next") go(idx + 1);
    else if (k === "minus") size(-4); else if (k === "plus") size(4);
    else if (k === "full") full(); else if (k === "close") close(); });
  document.addEventListener("keydown", e => {
    if (!box || box.hidden) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(idx + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(idx - 1); }
    else if (e.key === "Escape" && !document.fullscreenElement) close();
    else if (e.key === "+" || e.key === "=") size(4);
    else if (e.key === "-") size(-4);
    else if (e.key === "f" || e.key === "F") full();
  });
  document.body.appendChild(box);
}
function size(d){ fs = Math.max(FS_MIN, Math.min(FS_MAX, fs + d)); store(FS_KEY, String(fs)); box.style.setProperty("--fs", fs + "px"); }
function full(){
  try { if (document.fullscreenElement) document.exitFullscreen(); else box.requestFullscreen(); } catch(e) {}
}
function go(i){
  if (i < 0 || i >= PARTS.length) return;
  idx = i;
  const p = PARTS[i];
  box.querySelector(".chieu-part").textContent = "Ghi bài · " + p.label;
  box.querySelector(".chieu-n").textContent = (i + 1) + " / " + PARTS.length;
  const page = box.querySelector(".chieu-page");
  page.innerHTML = p.ids.map(id => L.CONCEPTS[id].b).join("");
  box.querySelector(".chieu-body").scrollTop = 0;
  box.querySelectorAll(".chieu-dot").forEach((d, j) => d.setAttribute("aria-current", j === i ? "true" : "false"));
  box.querySelector('[data-k="prev"]').disabled = i === 0;
  box.querySelector('[data-k="next"]').disabled = i === PARTS.length - 1;
  if (onShow) p.ids.forEach(id => { try { onShow(id); } catch(e) {} });
}
function open(startId, opts){
  if (!PARTS.length) return;
  if (!box) build();
  onShow = (opts && opts.onShow) || null;
  lastFocus = document.activeElement;
  box.style.setProperty("--fs", fs + "px");
  box.hidden = false;
  document.documentElement.classList.add("chieu-on");
  const i = PARTS.findIndex(p => p.id === startId);
  go(i < 0 ? 0 : i);
  box.querySelector('[data-k="next"]').focus();
}
function close(){
  if (!box) return;
  if (document.fullscreenElement) { try { document.exitFullscreen(); } catch(e) {} }
  box.hidden = true;
  document.documentElement.classList.remove("chieu-on");
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
window.Chieu = {open, close, parts: PARTS};
})();
