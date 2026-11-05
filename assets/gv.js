/* Trang giáo viên: mở buổi học, xem bài các nhóm ngay dưới từng câu hỏi của bài học,
   gửi nhận xét cho từng nhóm, chốt kiến thức cho cả lớp. */
(function(){
"use strict";
const {TASKS, CONCEPTS, TASK_IDS, L, grade, countSub, esc, summary, NX_MAU, NX_CHUNG, autoComment} = window.LESSON;
const GRADED = id => TASKS[id].type !== "open";
const BAI = window.LESSON.id;
const $ = id => document.getElementById(id);
function el(tag, attrs, html){ const e = document.createElement(tag); if (attrs) for (const a in attrs) e.setAttribute(a, attrs[a]); if (html != null) e.innerHTML = html; return e; }
function ss(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch(e) { return null; } }
function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e) { return null; } }
const stamp = () => new Date().toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit", second:"2-digit"});
function setSync(t){ $("sync").textContent = t; }

const ALL_REV = TASK_IDS.concat(Object.keys(CONCEPTS));
/* Lượt khen lưu chung với nhận xét, khoá "like.<mã câu>" (không cần sửa Code.gs) */
const LIKE = id => "like." + id;
const isLikeKey = k => k.indexOf("like.") === 0;
const nComments = d => Object.keys(d.nx || {}).filter(k => !isLikeKey(k)).length;
const nLikes = d => Object.keys(d.nx || {}).filter(isLikeKey).length;
const THUMB = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
let PIN = ss("gv-pin") || "", BUOI = ls("gv-buoi") || "";
let REV = {}, DOCS = [], pollTimer = null, lessonReady = false;

/* ================= ĐĂNG NHẬP ================= */
$("conn-text").textContent = API.demo ? "Chế độ thử: chưa nối Google Sheets." : "Đã nối Google Sheets.";
$("buoi").value = BUOI;
function suggest(){ const d = new Date(); return "LOP-" + String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + "-" + Math.random().toString(36).slice(2, 5).toUpperCase(); }
$("gen").addEventListener("click", () => { $("buoi").value = suggest(); });

async function login(){
  const pin = $("pin").value || PIN, buoi = API.normSession($("buoi").value);
  const msg = $("login-msg");
  if (!pin) { msg.textContent = "Nhập mã giáo viên."; return; }
  if (!buoi) { msg.textContent = "Nhập hoặc tạo mã buổi học."; return; }
  msg.textContent = "Đang kiểm tra…";
  try { await API.checkPin(pin); } catch(e) { msg.textContent = e.message; return; }
  msg.textContent = "";
  PIN = pin; BUOI = buoi; ss("gv-pin", pin); ls("gv-buoi", buoi); $("pin").value = "";
  start();
}
$("login").addEventListener("click", login);
$("pin").addEventListener("keydown", e => { if (e.key === "Enter") login(); });
$("buoi").addEventListener("keydown", e => { if (e.key === "Enter") login(); });

function studentLink(){ const u = new URL("index.html", location.href); u.search = ""; u.hash = ""; u.searchParams.set("buoi", BUOI); return u.toString(); }

async function start(){
  $("dang-nhap").hidden = true; $("app").hidden = false; $("gv-nav").hidden = false;
  $("code").textContent = BUOI;
  const link = studentLink();
  $("link").textContent = link;
  const qr = $("qr"); qr.innerHTML = ""; qr.hidden = false;
  if (typeof window.qrcode === "function") {
    try { const q = window.qrcode(0, "M"); q.addData(link); q.make(); qr.appendChild(el("img", {src: q.createDataURL(6, 2), alt: "Mã QR mở trang học sinh"})); }
    catch(e) { qr.hidden = true; }
  } else qr.hidden = true;
  DOCS = []; $("filter").value = "";
  await loadLesson();
  $("outline").hidden = false;
  if (!outline && lessonReady) outline = window.Outline.mount({
    root: $("lesson"), aside: $("outline"), title: "Tiến trình lớp học", pagerHost: $("app"), storeKey: "focus-gv-" + window.LESSON.id,
    extras: [{id: "chia-se", code: "QR", title: "Mã QR, link cho học sinh"}, {id: "tien-do", code: "▦", title: "Tiến độ các nhóm"}],
    progress: a => { if (!a.tasks.length) return {done: 0, total: 0, label: ""};
      const n = DOCS.length, total = n * a.tasks.length;
      const done = DOCS.reduce((s, d) => s + a.tasks.filter(t => d.sub && d.sub[t]).length, 0);
      return {done, total, label: n ? done + "/" + total : "–"}; },
    chot: a => a.tasks.length ? a.tasks.every(t => REV[t]) : !!REV[a.concept]
  });
  try { REV = await API.getReveal(BAI, BUOI); } catch(e) { setSync("Chưa tải được phần chốt: " + e.message); }
  renderAll();
  poll();
}
function stop(){ clearTimeout(pollTimer); $("outline").hidden = true; $("app").hidden = true; $("gv-nav").hidden = true; $("dang-nhap").hidden = false; }
$("switch").addEventListener("click", () => { stop(); $("buoi").value = ""; $("buoi").focus(); });
$("logout").addEventListener("click", () => { stop(); PIN = ""; ss("gv-pin", null); });
$("copy").addEventListener("click", async () => {
  const t = $("link").textContent;
  try { await navigator.clipboard.writeText(t); $("copy").textContent = "Đã sao chép"; }
  catch(e) { const r = document.createRange(); r.selectNodeContents($("link")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $("copy").textContent = "Đã chọn link, nhấn Ctrl+C"; }
  setTimeout(() => { $("copy").textContent = "Sao chép link"; }, 2500);
});

/* ================= NỘI DUNG BÀI HỌC (lấy từ trang học sinh) ================= */
const PANELS = {}, CPANELS = {};
async function loadLesson(){
  if (lessonReady) return;
  const box = $("lesson");
  try {
    const html = await fetch("index.html?v=" + Date.now()).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
    const doc = new DOMParser().parseFromString(html, "text/html");
    const wrap = doc.querySelector("main .wrap");
    const dash = wrap.querySelector("#theo-doi"); if (dash) dash.remove();
    box.innerHTML = "";
    [...wrap.children].forEach(n => box.appendChild(document.importNode(n, true)));
  } catch(e) { box.innerHTML = '<p class="status bad">Không tải được nội dung bài học (' + esc(e.message) + ').</p>'; return; }
  box.querySelectorAll("[data-task]").forEach(buildTaskPanel);
  box.querySelectorAll("[data-concept]").forEach(buildConceptPanel);
  lessonReady = true;
}

function buildTaskPanel(slot){
  const id = slot.dataset.task, t = TASKS[id];
  slot.className = "q tq";
  slot.appendChild(el("p", {class:"q-text"}, (slot.dataset.n ? '<span class="n">' + slot.dataset.n + '.</span>' : "") + esc(t.q)));
  if (t.type === "mcq") slot.appendChild(el("p", {class:"status"}, t.o.map((o, i) => "<b>" + L[i] + ".</b> " + esc(o)).join(" &nbsp; ")));
  if (t.type === "order") slot.appendChild(el("p", {class:"status"}, Object.keys(t.items).map(k => "<b>" + k + ")</b> " + esc(t.items[k])).join("<br>")));
  if (t.type === "match") slot.appendChild(el("p", {class:"status"}, t.items.map(x => esc(x[0])).join(" · ") + (t.opts ? "<br>Lựa chọn: " + t.opts.map(esc).join(" · ") : "")));
  if (t.type === "sort") slot.appendChild(el("p", {class:"status"}, "Cần xếp: " + t.items.map(x => esc(x[0])).join(", ")));
  const det = el("details", {class:"key-det"});
  det.appendChild(el("summary", null, "Đáp án / phần chốt"));
  det.appendChild(el("div", {class:"key-inline"}, (t.type === "mcq" ? "Đáp án đúng: <b>" + L[t.a] + "</b>. " : "") + t.k));
  slot.appendChild(det);
  const row = el("div", {class:"row"});
  const chot = el("button", {class:"btn keybtn", type:"button"});
  const bulk = el("button", {class:"btn", type:"button", hidden:""});
  const stats = el("span", {class:"status"});
  row.append(chot, bulk, stats); slot.appendChild(row);
  bulk.addEventListener("click", () => bulkSend(id));
  const list = el("div", {class:"ans-list"});
  const empty = el("p", {class:"empty"}, "Chưa có nhóm nào trả lời câu này.");
  slot.append(list, empty);
  chot.addEventListener("click", () => toggleRev(id));
  PANELS[id] = {chot, bulk, stats, list, empty, items: new Map(), bulkBusy: false};
}

function buildConceptPanel(slot){
  const id = slot.dataset.concept, d = CONCEPTS[id];
  slot.className = "concept-wrap";
  const b = el("button", {class:"btn keybtn", type:"button"});
  const box = el("div", {class: d.ghi ? "concept ghi" : "concept"}, "<h3>" + d.t + "</h3>" + d.b);
  const row = el("div", {class:"btn-row"}); row.appendChild(b);
  if (d.ghi && window.Chieu) {
    const pj = el("button", {class:"btn chieu-btn", type:"button"}, '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/></svg>Chiếu ghi bài');
    pj.addEventListener("click", () => window.Chieu.open(id, {onShow: chotGhi}));
    row.appendChild(pj);
  }
  slot.append(row, box);
  b.addEventListener("click", () => toggleRev(id));
  CPANELS[id] = {b, box, t: d.t};
}

/* ================= BÀI CỦA CÁC NHÓM DƯỚI TỪNG CÂU ================= */
function answerOf(id, d){
  const t = TASKS[id], sub = !!(d.sub && d.sub[id]);
  let body = "", chip = sub ? '<span class="chip sub">Đã nộp</span>' : '<span class="chip draft">Đang làm</span>', ok = null;
  if (t.type === "open") body = esc((d.ans && d.ans[id]) || "");
  else { const g = grade(id, d); if (g) { body = esc(g.text); if (sub) { ok = g.ok; chip += g.ok ? ' <span class="chip ok">Đúng</span>' : ' <span class="chip bad">Chưa đúng</span>'; } } }
  const state = !body ? "empty" : !sub ? "draft" : ok === true ? "right" : ok === false ? "wrong" : "sub";
  if (state === "draft") chip = '<span class="chip warn">Đang làm, chưa nộp</span>';
  if (state === "sub") chip = '<span class="chip info">Đã nộp</span>';
  return {body, chip, sub, ok, state};
}

function makeItem(id, d){
  const item = el("div", {class:"ans-item"});
  const head = el("div", {class:"who-l"}), txt = el("div", {class:"txt"});
  const fb = el("div", {class:"fb-edit"});
  const taId = "nx-" + id + "-" + d.clientId;
  const lab = el("label", {for: taId, class:"status"}, "Nhận xét gửi cho nhóm");
  const ta = el("textarea", {id: taId, rows:"2", placeholder: window.LESSON.commentPh || "Nhận xét gửi cho nhóm…"});
  const chips = el("div", {class:"nx-chips"});
  chips.addEventListener("click", e => {
    const c = e.target.closest("[data-nx]"); if (!c) return;
    const add = c.getAttribute("data-nx"), cur = ta.value.trim();
    ta.value = !cur || cur === it.lastChip ? add : cur + " " + add;
    it.lastChip = ta.value; it.dirty = true; st.textContent = "Chưa gửi, bấm Gửi nhận xét"; st.className = "status";
    ta.focus();
  });
  const row = el("div", {class:"row"});
  const send = el("button", {class:"btn", type:"button"}, "Gửi nhận xét");
  const like = el("button", {class:"btn like-btn", type:"button", "aria-pressed":"false"});
  const st = el("span", {class:"status"});
  row.append(like, send, st); fb.append(lab, chips, ta, row);
  item.append(head, txt, fb);
  const it = {item, head, txt, ta, send, like, st, chips, chipSig: "", lastChip: "", cid: d.clientId, dirty: false, saving: false};
  like.addEventListener("click", () => toggleLike(id, it));
  ta.addEventListener("input", () => { it.dirty = true; st.textContent = "Chưa gửi"; st.className = "status"; });
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send.click(); });
  send.addEventListener("click", () => sendComment(id, it));
  return it;
}

async function sendComment(id, it){
  const d = DOCS.find(x => x.clientId === it.cid); if (!d || it.saving) return;
  it.saving = true; it.send.disabled = true; it.st.textContent = "Đang gửi…"; it.st.className = "status";
  try {
    const nx = await API.setComment(BAI, BUOI, PIN, it.cid, d.name, id, it.ta.value);
    d.nx = (nx && typeof nx === "object") ? nx : Object.assign({}, d.nx, {[id]: it.ta.value.trim()});
    it.dirty = false;
    renderTable(); renderPanel(id);
    it.st.textContent = it.ta.value.trim() ? "Đã gửi lúc " + stamp() : "Đã xoá nhận xét"; it.st.className = "status ok";
  } catch(e) { it.st.textContent = e.message; it.st.className = "status bad"; }
  it.saving = false; it.send.disabled = false;
}

/* Gợi ý nhận xét theo kết quả bài của nhóm */
function suggestions(id, d, a){
  const m = NX_MAU[id] || {ok: [], fix: []}, out = [];
  if (a.ok === true) m.ok.forEach(t => out.push(["ok", t]));
  else if (a.ok === false) { const au = autoComment(id, d); if (au) out.push(["auto", au]); m.fix.forEach(t => out.push(["fix", t])); }
  else { m.ok.forEach(t => out.push(["ok", t])); m.fix.forEach(t => out.push(["fix", t])); }
  NX_CHUNG.forEach(t => out.push(["gen", t]));
  return out;
}
function renderChips(it, list){
  const sig = list.map(x => x[1]).join("|");
  if (sig === it.chipSig) return;
  it.chipSig = sig; it.chips.innerHTML = '<span class="status">Gợi ý (bấm để chèn):</span>';
  list.forEach(([k, t]) => it.chips.appendChild(el("button", {class: "nx-chip " + k, type: "button", "data-nx": t, title: t}, esc(t))));
}

/* Gửi nhận xét gợi ý cho mọi nhóm đã nộp mà chưa được nhận xét (câu chấm tự động) */
async function bulkSend(id){
  const p = PANELS[id]; if (!p || p.bulkBusy) return;
  const todo = DOCS.filter(d => d.sub && d.sub[id] && !(d.nx && d.nx[id]));
  if (!todo.length) return;
  p.bulkBusy = true; p.bulk.disabled = true;
  let done = 0, fail = "";
  for (const d of todo) {
    const g = grade(id, d), m = NX_MAU[id] || {ok: [""], fix: [""]};
    const text = g && g.ok ? m.ok[0] : (autoComment(id, d) || m.fix[0]);
    p.bulk.textContent = "Đang gửi " + (done + 1) + "/" + todo.length + "…";
    try { const nx = await API.setComment(BAI, BUOI, PIN, d.clientId, d.name, id, text); d.nx = nx || Object.assign({}, d.nx, {[id]: text}); done++; }
    catch(e) { fail = e.message; break; }
  }
  p.bulkBusy = false; p.bulk.disabled = false;
  renderTable(); renderPanel(id);
  p.stats.textContent += fail ? " · Lỗi: " + fail : " · Đã gửi nhận xét cho " + done + " nhóm";
}

async function toggleLike(id, it){
  const d = DOCS.find(x => x.clientId === it.cid); if (!d || it.saving) return;
  const liked = !!(d.nx && d.nx[LIKE(id)]);
  it.saving = true; it.like.disabled = true;
  try {
    const nx = await API.setComment(BAI, BUOI, PIN, it.cid, d.name, LIKE(id), liked ? "" : "Thích");
    if (nx && typeof nx === "object") d.nx = nx;
    else { d.nx = Object.assign({}, d.nx); if (liked) delete d.nx[LIKE(id)]; else d.nx[LIKE(id)] = "Thích"; }
    renderTable(); renderPanel(id);
    it.st.textContent = liked ? "Đã bỏ khen" : "Đã khen lúc " + stamp(); it.st.className = "status ok";
  } catch(e) { it.st.textContent = e.message; it.st.className = "status bad"; }
  it.saving = false; it.like.disabled = false;
}

function renderPanel(id){
  const p = PANELS[id]; if (!p) return;
  const t = TASKS[id], filter = $("filter").value;
  let nSub = 0, nOk = 0, shown = 0;
  p.chot.textContent = REV[id] ? "Ẩn phần chốt câu này" : "Chốt câu này cho cả lớp";
  p.chot.className = "btn " + (REV[id] ? "" : "keybtn");
  const seen = new Set();
  DOCS.forEach(d => {
    const a = answerOf(id, d), nx = (d.nx && d.nx[id]) || "";
    if (a.sub) { nSub++; if (a.ok) nOk++; }
    seen.add(d.clientId);
    let it = p.items.get(d.clientId);
    if (!a.body && !nx) { if (it) it.item.hidden = true; return; }
    if (!it) { it = makeItem(id, d); p.items.set(d.clientId, it); p.list.appendChild(it.item); }
    const liked = !!(d.nx && d.nx[LIKE(id)]);
    it.head.innerHTML = esc(d.name) + " " + a.chip + (nx ? ' <span class="chip nx">Đã nhận xét</span>' : "") + (liked ? ' <span class="chip like">' + THUMB + "Đã khen</span>" : "");
    it.like.innerHTML = THUMB + (liked ? "Đã khen" : "Khen");
    it.like.setAttribute("aria-pressed", liked ? "true" : "false");
    it.like.classList.toggle("suggest", !liked && a.ok === true);
    it.item.dataset.state = a.state; it.item.classList.toggle("liked", liked);
    renderChips(it, suggestions(id, d, a));
    it.txt.innerHTML = a.body || '<span class="empty">Chưa trả lời</span>';
    if (!it.dirty && document.activeElement !== it.ta) it.ta.value = nx;
    const vis = !filter || filter === d.clientId;
    it.item.hidden = !vis; if (vis) shown++;
  });
  p.items.forEach((it, cid) => { if (!seen.has(cid)) it.item.hidden = true; });
  p.empty.hidden = shown > 0;
  p.stats.textContent = "Đã nộp " + nSub + "/" + DOCS.length + (t.type !== "open" && nSub ? " · Đúng " + nOk + "/" + nSub : "");
  if (!p.bulkBusy) {
    const pending = GRADED(id) ? DOCS.filter(d => d.sub && d.sub[id] && !(d.nx && d.nx[id])).length : 0;
    p.bulk.hidden = !pending;
    p.bulk.textContent = "Gửi nhận xét gợi ý cho " + pending + " nhóm chưa nhận xét";
  }
}

function renderConcepts(){
  Object.keys(CPANELS).forEach(id => { const c = CPANELS[id];
    c.b.textContent = REV[id] ? "Ẩn " + c.t.toLowerCase() : "Chốt " + c.t.toLowerCase() + " cho cả lớp";
    c.b.className = "btn " + (REV[id] ? "" : "keybtn"); });
}

function timeAgo(t){ if (!t) return "—"; const s = Math.round((Date.now() - t) / 1000); if (s < 60) return "vừa xong"; if (s < 3600) return Math.floor(s / 60) + " phút trước"; return new Date(t).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"}); }
function renderTable(){
  renderMatrix();
  const tb = $("dash-rows"); tb.innerHTML = "";
  const nSubAll = DOCS.reduce((s, d) => s + countSub(d), 0);
  $("dash-sum").innerHTML = "<span>Số nhóm/học sinh: <b>" + DOCS.length + "</b></span><span>Tổng số câu đã nộp: <b>" + nSubAll + "</b></span>";
  if (!DOCS.length) { tb.appendChild(el("tr", null, '<td colspan="6" class="empty">Chưa có nhóm nào vào buổi học. Học sinh quét mã QR, nhập tên nhóm và bấm Vào buổi học.</td>')); return; }
  DOCS.forEach(d => tb.appendChild(el("tr", null, "<td>" + esc(d.name) + '</td><td class="num">' + countSub(d) + "/" + TASK_IDS.length +
    '</td><td class="num">' + nComments(d) + '</td><td class="num">' + nLikes(d) + '</td><td class="num">' + timeAgo(d.t) +
    '</td><td><button class="btn" type="button" data-view="' + esc(d.clientId) + '">Xem bài</button></td>')));
}
/* Bảng màu: hàng = nhóm, cột = câu theo tiến trình */
const MX_COLS = window.LESSON.STAGES.flatMap(st => st.acts.flatMap(a => a.tasks.map((t, i) => ({t, a, st, i}))));
const MX_SYM = {empty: "", draft: "…", sub: "●", right: "✓", wrong: "✗"};
const MX_TXT = {empty: "chưa làm", draft: "đang làm, chưa nộp", sub: "đã nộp", right: "đúng", wrong: "cần sửa"};
function renderMatrix(){
  const box = $("mx");
  if (!DOCS.length) { box.innerHTML = ""; return; }
  const acts = window.LESSON.STAGES.flatMap(st => st.acts);
  let h = '<table class="mx"><thead><tr><th></th>' + acts.map(a => '<th class="stg" colspan="' + a.tasks.length + '" title="' + esc(a.title) + '">' + a.code + "</th>").join("") + "</tr>";
  h += "<tr><th></th>" + MX_COLS.map(c => "<th>" + (c.i + 1) + "</th>").join("") + "</tr></thead><tbody>";
  DOCS.forEach(d => {
    h += '<tr><th class="grp" title="' + esc(d.name) + '">' + esc(d.name) + "</th>";
    MX_COLS.forEach(c => {
      const a = answerOf(c.t, d), liked = d.nx && d.nx["like." + c.t];
      h += '<td class="' + a.state + '" data-cid="' + esc(d.clientId) + '" data-t="' + c.t + '" title="' + esc(d.name + " · " + c.a.code + " câu " + (c.i + 1) + ": " + MX_TXT[a.state] + (liked ? " · đã khen" : "")) + '">' + (liked ? "★" : MX_SYM[a.state]) + "</td>";
    });
    h += "</tr>";
  });
  box.innerHTML = h + "</tbody></table>";
}
$("mx").addEventListener("click", e => {
  const td = e.target.closest("td[data-t]"); if (!td) return;
  $("filter").value = td.getAttribute("data-cid"); renderAll();
  if (outline) outline.focusTask(td.getAttribute("data-t"));
  const q = document.querySelector('#lesson [data-task="' + td.getAttribute("data-t") + '"]');
  if (q) q.scrollIntoView({behavior: "smooth", block: "start"});
});

$("dash-rows").addEventListener("click", e => {
  const b = e.target.closest("[data-view]"); if (!b) return;
  $("filter").value = b.getAttribute("data-view"); renderAll();
  if (outline) outline.show({type: "stage", id: "mo-dau"});
});

function renderFilter(){
  const f = $("filter"), cur = f.value;
  f.innerHTML = '<option value="">Tất cả nhóm</option>';
  DOCS.forEach(d => f.appendChild(el("option", {value: d.clientId}, esc(d.name))));
  f.value = DOCS.some(d => d.clientId === cur) ? cur : "";
}
$("filter").addEventListener("change", renderAll);

let outline = null;
function renderAll(){
  renderTable(); renderFilter();
  TASK_IDS.forEach(renderPanel); renderConcepts();
  if (outline) outline.update();
}

/* ================= CẬP NHẬT ĐỊNH KÌ ================= */
async function poll(){
  clearTimeout(pollTimer);
  try {
    const docs = await API.getClass(BAI, BUOI, PIN);
    const local = new Map(DOCS.map(d => [d.clientId, d]));
    DOCS = docs.map(x => {
      const d = Object.assign({name: x.group || "(chưa nhập tên)", t: x.t, clientId: String(x.clientId), nx: x.nx || {}}, x.data || {});
      const old = local.get(d.clientId); if (old && old.nx && !x.nx) d.nx = old.nx;
      return d;
    }).sort((a, b) => String(a.name).localeCompare(String(b.name), "vi", {numeric: true}));
    setSync("Cập nhật lúc " + stamp());
    renderAll();
  } catch(e) {
    setSync("Chưa tải được bài làm: " + e.message);
    if (/mã giáo viên/i.test(e.message)) { stop(); $("login-msg").textContent = e.message; return; }
  }
  pollTimer = setTimeout(poll, 8000);
}
$("refresh").addEventListener("click", poll);

/* ================= CHỐT KIẾN THỨC ================= */
let saving = false, again = false;
async function pushRev(){
  if (saving) { again = true; return; }
  saving = true; setSync("Đang lưu phần chốt…");
  try { await API.setReveal(BAI, BUOI, PIN, REV); setSync("Đã lưu phần chốt lúc " + stamp()); }
  catch(e) { setSync("Chưa lưu được phần chốt: " + e.message + ". Bấm lại để thử."); }
  saving = false; if (again) { again = false; pushRev(); }
}
function toggleRev(id){ REV = Object.assign({}, REV, {[id]: !REV[id]}); TASK_IDS.forEach(renderPanel); renderConcepts(); if (outline) outline.update(); pushRev(); }
function setAll(v){ const n = {}; ALL_REV.forEach(k => n[k] = v); REV = n; TASK_IDS.forEach(renderPanel); renderConcepts(); if (outline) outline.update(); pushRev(); }
$("rev-all").addEventListener("click", () => setAll(true));
/* Chiếu ghi bài: phần nào được chiếu thì chốt luôn cho cả lớp */
function chotGhi(k){ if (!REV[k]) toggleRev(k); }
if ($("chieu-all")) $("chieu-all").addEventListener("click", () => window.Chieu.open(null, {onShow: chotGhi}));
$("rev-none").addEventListener("click", () => setAll(false));

/* ================= CSV ================= */
$("csv").addEventListener("click", () => {
  const head = ["Nhóm / Học sinh", "Đã nộp", "Cập nhật"].concat(summary({}).map(c => c[0])).concat(["Nhận xét của giáo viên", "Câu được khen"]);
  const rows = DOCS.map(d => [d.name, countSub(d) + "/" + TASK_IDS.length, d.t ? new Date(d.t).toLocaleString("vi-VN") : ""]
    .concat(summary(d).map(c => c[1]))
    .concat([Object.keys(d.nx || {}).filter(k => !isLikeKey(k)).map(k => (TASKS[k] ? TASKS[k].label : k) + ": " + d.nx[k]).join("\n"),
             Object.keys(d.nx || {}).filter(isLikeKey).map(k => { const t = TASKS[k.slice(5)]; return t ? t.label : k; }).join("; ")]));
  const q = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const csv = "﻿" + [head].concat(rows).map(r => r.map(q).join(",")).join("\r\n");
  const a = el("a", {href: URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"})), download: "bai-lam-" + BUOI + ".csv"});
  document.body.appendChild(a); a.click(); a.remove();
});

/* ================= CHƯA NỐI GOOGLE SHEETS ================= */
if (API.demo) {
  $("conn-text").textContent = "Chưa nối Google Sheets: dùng chế độ một máy nhiều nhóm.";
  const lead = document.querySelector("header .lead");
  if (lead) lead.textContent = "Hướng dẫn dạy bài này trên một máy trình chiếu, ghi câu trả lời theo từng nhóm và chốt kiến thức.";
  const sec = $("dang-nhap");
  sec.innerHTML = "";
  sec.appendChild(el("div", {class:"part-head"}, "<h2>Dạy trên một máy (không cần mạng, không cần tài khoản)</h2>"));
  const box = el("div", {class:"act"});
  box.innerHTML =
    "<ol style=\"margin:0;padding-left:20px;display:grid;gap:6px\">" +
    "<li>Trên máy trình chiếu, mở <a href=\"index.html\">trang học</a>.</li>" +
    "<li>Nhập mã giáo viên <b>tin7</b> rồi bấm <b>Vào chế độ GV</b>.</li>" +
    "<li>Khi một nhóm báo cáo, bấm tên nhóm ở đầu trang rồi ghi câu trả lời của nhóm và bấm <b>Nộp</b>.</li>" +
    "<li>Mục <b>Theo dõi lớp</b> trên trang học so sánh câu trả lời của các nhóm theo từng câu.</li>" +
    "<li>Bấm <b>GV nhận xét &amp; chốt</b> ở từng câu, hoặc <b>Chốt tất cả</b>.</li></ol>" +
    "<p class=\"status\" style=\"margin-top:10px\">Muốn học sinh làm trên máy riêng và gửi bài về cho thầy cô, cần nối Google Sheets (xem README).</p>";
  sec.appendChild(box);
} else if (PIN && BUOI) start();
})();
