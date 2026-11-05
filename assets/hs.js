
(function(){
"use strict";
/* ================= NỘI DUNG ================= */
const {TASKS, CONCEPTS, TASK_IDS, L, grade, countSub, esc} = window.LESSON;
const TEACHER_PIN = "tin7";

/* ================= TRẠNG THÁI ================= */
const KEY = "tin9-bai2-v1";
function fresh(){ return {name:"Nhóm 1", ans:{}, sub:{}, mcq:{}, sort:{}, match:{}, order:{}, t:0, rev:{}, note:{}, teacher:false, groups:{}, active:"g1", ngroups:8}; }
let S = fresh();
try { const raw = JSON.parse(localStorage.getItem(KEY) || "null"); if (raw && typeof raw === "object") S = Object.assign(fresh(), raw); } catch(e) {}
["ans","sub","mcq","sort","match","order","rev","note","groups"].forEach(k => { if (!S[k] || typeof S[k] !== "object") S[k] = {}; });
if (!/^(g\d+|on:[A-Z0-9_.\-]+)$/.test(S.active)) S.active = "g1";
if (!(S.ngroups >= 1 && S.ngroups <= 20)) S.ngroups = 8;

/* Nhiều nhóm trên một máy: bài của nhóm đang chọn nằm ở S.ans/S.sub/…; các nhóm khác cất trong S.groups */
const GF = ["name","ans","sub","mcq","sort","match","order","t"];
const clone = o => JSON.parse(JSON.stringify(o));
const gNum = k => Number(k.slice(1));
function workingSet(){ const g = {}; GF.forEach(f => g[f] = clone(S[f] == null ? (f === "name" ? "" : f === "t" ? 0 : {}) : S[f])); return g; }
function stash(){ S.groups[S.active] = workingSet(); }
function groupData(k){ if (k === S.active) return workingSet(); const g = S.groups[k] || {}; return {name: g.name || (k[0] === "g" ? "Nhóm " + gNum(k) : ""),ans: g.ans || {}, sub: g.sub || {}, mcq: g.mcq || {}, sort: g.sort || {}, match: g.match || {}, order: g.order || {}, t: g.t || 0}; }
function switchGroup(k){
  if (k === S.active) return;
  stash();
  const g = groupData(k);
  S.active = k;
  GF.forEach(f => S[f] = clone(g[f]));
  saveLocal(); nm.value = S.name || "";
  renderAll();
  window.scrollTo({top: 0});
}
const groupsOn = () => mode === "local";
const noteKey = id => S.active + "|" + id;

/* mode: local (một máy, không mạng) | online (đã vào buổi học, bài gửi lên Google Sheets) */
let mode = "local";
let REV = {};            // phần chốt giáo viên mở cho buổi học
let NX = {};             // nhận xét giáo viên gửi cho máy này (theo từng câu); khoá "like.<câu>" là lượt khen
const THUMB = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
let myWriter = null;
const classDocs = [];
if (!S.clientId) S.clientId = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function saveLocal(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} }
let rafPending = false;
function changed(){ if (!rafPending) { rafPending = true; requestAnimationFrame(() => { rafPending = false; renderAll(); }); } S.t = Date.now(); saveLocal(); if (myWriter && mode === "online") myWriter.queue(); updateProgress(); if (dashOn()) { renderDash(); renderGroups(); } }
const dashOn = () => mode === "local" && !!S.teacher;
const isTeacher = () => mode === "local" && !!S.teacher;
const isRev = id => (mode === "local" ? !!S.rev[id] : !!REV[id]);
function setRev(id, v){
  if (mode === "local") { S.rev[id] = v; saveLocal(); }
  renderAll();
}

function el(tag, attrs, html){ const e = document.createElement(tag); if (attrs) for (const a in attrs) e.setAttribute(a, attrs[a]); if (html != null) e.innerHTML = html; return e; }

/* ================= CHẤM ĐIỂM (dùng chung cho HS và bảng GV) ================= */
/* ================= DỰNG CÂU HỎI ================= */
const renders = [];
function keyBox(id, html){
  const box = el("div", {class:"key"});
  box.appendChild(el("div", {class:"key-label"}, "Chốt kiến thức"));
  box.appendChild(el("div", null, html));
  const n = el("div", {class:"note"});
  const lid = "note-" + id;
  n.appendChild(el("label", {for:lid}, "Nhận xét của giáo viên (ghi trên máy đang trình chiếu)"));
  const ta = el("textarea", {id:lid, placeholder: window.LESSON.notePh || "Ghi nhận xét…"});
  ta.addEventListener("input", () => { S.note[noteKey(id)] = ta.value; saveLocal(); });
  n.appendChild(ta); box.appendChild(n);
  const sync = () => { if (document.activeElement !== ta) ta.value = S.note[noteKey(id)] || ""; };
  return {box, note:n, sync};
}

const BODY = {
  open(id){
    const ta = el("textarea", {id:"ans-" + id, placeholder:"Viết câu trả lời của em…"});
    ta.value = S.ans[id] || "";
    ta.addEventListener("input", () => { S.ans[id] = ta.value; changed(); });
    return {node: ta, has: () => !!(S.ans[id] || "").trim(), render(sub){ ta.readOnly = sub; }, sync(){ ta.value = S.ans[id] || ""; }};
  },
  mcq(id, t){
    const box = el("div", {class:"opts"});
    const btns = t.o.map((txt, i) => { const b = el("button", {class:"opt", type:"button"}, '<span class="l">' + L[i] + '.</span>' + esc(txt));
      b.addEventListener("click", () => { if (S.sub[id]) return; S.mcq[id] = i; changed(); renderAll(); }); box.appendChild(b); return b; });
    return {node: box, has: () => S.mcq[id] != null, render(sub, rev){ const v = S.mcq[id];
      btns.forEach((b, i) => { b.disabled = sub; b.className = "opt" + (v === i ? " sel" : "") + (rev && i === t.a ? " right" : "") + (rev && v === i && i !== t.a ? " wrong" : ""); }); }};
  },
  sort(id, t){
    if (!S.sort[id]) S.sort[id] = {};
    const box = el("div", {class:"sort"});
    const cats = t.cats.concat(["?"]);
    const rows = t.items.map(([name], i) => {
      const r = el("div", {class:"sort-row"});
      const lab = el("span", null, esc(name)); const hint = el("span", {class:"hint"}); lab.appendChild(hint);
      const seg = el("div", {class:"seg", role:"group", "aria-label":"Chọn nhóm cho " + name});
      const bs = cats.map((c, ci) => { const val = ci === t.cats.length ? -1 : ci;
        const b = el("button", {type:"button", "aria-pressed":"false", class: val === -1 ? "unsure" : ""}, esc(c));
        b.addEventListener("click", () => { if (S.sub[id]) return; (S.sort[id] = S.sort[id] || {})[i] = val; changed(); renderAll(); }); seg.appendChild(b); return {b, val}; });
      r.append(lab, seg); box.appendChild(r); return {r, bs, hint};
    });
    return {node: box, has: () => Object.keys(S.sort[id] || {}).length > 0, render(sub, rev){
      const m = S.sort[id] || {};
      rows.forEach(({r, bs, hint}, i) => { const v = m[i];
        bs.forEach(({b, val}) => { b.setAttribute("aria-pressed", v === val ? "true" : "false"); b.disabled = sub; });
        const ok = v === t.items[i][1];
        r.className = "sort-row" + (rev ? (ok ? " right" : " wrong") : "");
        hint.textContent = rev && !ok ? "Đáp án: " + t.cats[t.items[i][1]] : ""; }); }};
  },
  match(id, t){
    if (!S.match[id]) S.match[id] = {};
    const grid = el("div", {class: t.opts ? "match wide" : "match"});
    const items = t.items.map(([name], i) => { const sid = "m-" + id + "-" + i;
      const lab = el("label", {for:sid}, "<span>" + esc(name) + "</span>");
      const sel = el("select", {id:sid}); sel.appendChild(el("option", {value:""}, t.ph || "Cổng…"));
      const opts = t.opts || [1,2,3,4,5,6,7,8].map(String);
      opts.forEach((o, k) => sel.appendChild(el("option", {value:String(k + 1)}, esc(o))));
      sel.addEventListener("change", () => { (S.match[id] = S.match[id] || {})[i] = sel.value; changed(); renderAll(); });
      lab.appendChild(sel); grid.appendChild(lab); return {lab, sel}; });
    return {node: grid, has: () => Object.values(S.match[id] || {}).some(Boolean), render(sub, rev){
      items.forEach(({lab, sel}, i) => { const v = (S.match[id] || {})[i] || ""; sel.value = v; sel.disabled = sub;
        lab.className = rev ? (Number(v) === t.items[i][1] ? "right" : "wrong") : ""; }); }};
  },
  order(id, t){
    if (!Array.isArray(S.order[id]) || S.order[id].length !== t.start.length) S.order[id] = t.start.slice();
    const ol = el("ol", {class:"order"});
    function move(i, dir){ const a = S.order[id].slice(), j = i + dir; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; S.order[id] = a; changed(); renderAll(); }
    return {node: ol, has: () => !!S.sub[id] || (Array.isArray(S.order[id]) && S.order[id].join() !== t.start.join()), render(sub, rev){
      if (!Array.isArray(S.order[id]) || S.order[id].length !== t.start.length) S.order[id] = t.start.slice();
      const a = S.order[id]; ol.innerHTML = "";
      a.forEach((k, i) => { const ok = k === t.ans[i];
        const li = el("li", {class: rev ? (ok ? "right" : "wrong") : ""});
        li.appendChild(el("span", {class:"pos"}, (i + 1) + "."));
        li.appendChild(el("span", null, "<b>" + k + ")</b> " + esc(t.items[k])));
        const mv = el("div", {class:"mv"});
        const up = el("button", {type:"button", "aria-label":"Đưa lên"}, "↑"); up.disabled = sub || i === 0; up.addEventListener("click", () => move(i, -1));
        const dn = el("button", {type:"button", "aria-label":"Đưa xuống"}, "↓"); dn.disabled = sub || i === a.length - 1; dn.addEventListener("click", () => move(i, 1));
        mv.append(up, dn); li.appendChild(mv); ol.appendChild(li); }); }};
  }
};

const syncers = [];
document.querySelectorAll("[data-task]").forEach(slot => {
  const id = slot.dataset.task, t = TASKS[id];
  slot.className = "q";
  const pill = el("span", {class:"pill-state"});
  const qt = el("p", {class:"q-text"}, (slot.dataset.n ? '<span class="n">' + slot.dataset.n + '.</span>' : "") + esc(t.q));
  qt.insertBefore(pill, qt.firstChild);
  slot.appendChild(qt);
  const body = BODY[t.type](id, t);
  slot.appendChild(body.node);
  if (body.sync) syncers.push(body.sync);
  const row = el("div", {class:"row"});
  const bSub = el("button", {class:"btn primary", type:"button"});
  const bKey = el("button", {class:"btn keybtn", type:"button"});
  const st = el("span", {class:"status"});
  row.append(bSub, bKey, st); slot.appendChild(row);
  const kb = keyBox(id, (t.type === "mcq" ? "Đáp án đúng: <b>" + L[t.a] + "</b>. " : "") + t.k);
  const liked = el("div", {class:"liked"}, THUMB + "Thầy cô khen câu trả lời của em!");
  const fb = el("div", {class:"feedback"}, '<span class="fl">Nhận xét của thầy cô</span>');
  const fbText = el("span", {class:"ft"}); fb.appendChild(fbText);
  slot.insertBefore(fb, row.nextSibling);
  slot.insertBefore(liked, fb);
  slot.appendChild(kb.box);
  let err = "";
  function render(){
    const sub = !!S.sub[id], rev = isRev(id), T = isTeacher();
    body.render(sub, rev);
    if (body.sync && document.activeElement !== body.node) body.sync();
    bSub.textContent = sub ? "Sửa câu trả lời" : "Nộp câu trả lời";
    bSub.classList.toggle("primary", !sub);
    bKey.hidden = !T;
    bKey.textContent = rev ? "Ẩn phần chốt" : "GV nhận xét & chốt";
    const g = rev ? grade(id, S) : null;
    if (err) { st.textContent = err; st.className = "status bad"; }
    else if (g) { st.textContent = g.ok ? "Chính xác!" : (t.type === "mcq" || t.type === "order" ? "Chưa đúng, xem phần chốt." : "Đúng " + g.right + "/" + g.total + ". Xem các dòng màu đỏ."); st.className = "status " + (g.ok ? "ok" : "bad"); }
    else if (sub) { st.textContent = rev ? "Đã nộp" : (T ? "Đã nộp" : "Đã nộp. Chờ thầy cô nhận xét và chốt."); st.className = "status ok"; }
    else { st.textContent = ""; st.className = "status"; }
    kb.box.hidden = !rev;
    kb.note.hidden = !T;
    kb.sync();
    const nx = mode === "online" ? (NX[id] || "") : "";
    fbText.textContent = nx; fb.hidden = !nx;
    liked.hidden = !(mode === "online" && NX["like." + id]);
    /* màu trạng thái: chưa làm / đang làm / đã nộp / đúng / cần sửa */
    const gg = rev ? grade(id, S) : null;
    const state = !body.has() ? "empty" : !sub ? "draft" : gg ? (gg.ok ? "right" : "wrong") : "sub";
    slot.dataset.state = state;
    pill.textContent = {empty: "Chưa làm", draft: "Chưa nộp", sub: rev ? "Đã nộp" : "Đã nộp, chờ chốt", right: "Đúng", wrong: "Cần sửa"}[state];
  }
  bSub.addEventListener("click", () => {
    if (!S.sub[id] && !body.has()) { err = "Em hãy trả lời trước khi nộp."; render(); return; }
    err = ""; S.sub[id] = !S.sub[id]; changed(); renderAll();
  });
  bKey.addEventListener("click", () => setRev(id, !isRev(id)));
  renders.push(render);
});

document.querySelectorAll("[data-concept]").forEach(slot => {
  const id = slot.dataset.concept, d = CONCEPTS[id];
  slot.className = "concept-wrap";
  const b = el("button", {class:"btn keybtn", type:"button"});
  const wait = el("p", {class:"wait"}, d.t + " sẽ được thầy cô chốt sau khi cả lớp trình bày.");
  const box = el("div", {class: d.ghi ? "concept ghi" : "concept"}, "<h3>" + d.t + "</h3>" + d.b);
  // mục Ghi bài: thêm nút chiếu lên màn hình lớn cho học sinh chép
  const row = el("div", {class:"btn-row"}); row.appendChild(b);
  if (d.ghi && window.Chieu) {
    const pj = el("button", {class:"btn chieu-btn", type:"button"}, '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/></svg>Chiếu ghi bài');
    pj.addEventListener("click", () => window.Chieu.open(id, {onShow: k => { if (!isRev(k)) setRev(k, true); }}));
    row.appendChild(pj);
  }
  slot.append(row, wait, box);
  renders.push(() => { const rev = isRev(id), T = isTeacher();
    box.hidden = !rev; wait.hidden = rev || T; row.hidden = !T;
    b.textContent = rev ? "Ẩn " + d.t.toLowerCase() : "GV chốt " + d.t.toLowerCase(); });
  b.addEventListener("click", () => setRev(id, !isRev(id)));
});

/* ================= TIẾN ĐỘ, CHẾ ĐỘ ================= */
function updateProgress(){ document.getElementById("prog").textContent = "Đã nộp " + countSub(S) + "/" + TASK_IDS.length + " câu"; }

const $ = id => document.getElementById(id);
function setSync(t){ $("sync").textContent = t; }
function updateModeUI(){
  const T = isTeacher();
  const texts = {
    local: T ? "Chế độ giáo viên trên máy này: chọn nhóm để ghi câu trả lời khi nhóm báo cáo, xem bảng Theo dõi lớp, rồi chốt kiến thức." : "Bài làm được lưu trên máy này. Nhiều nhóm có thể dùng chung máy: chọn đúng nhóm trước khi làm.",
    online: "Bài làm của em được gửi cho thầy cô. Phần chốt hiện ra khi thầy cô chốt." + (window.API && API.demo ? " (Chế độ thử: chưa nối Google Sheets.)" : "")
  };
  $("join-box").hidden = mode !== "local" || T || API.demo;   // chưa nối Google Sheets: chỉ dùng chế độ một máy
  $("join-info").hidden = mode !== "online";
  $("join-code").textContent = S.session || "";
  $("mode-pill").textContent = T ? "Giáo viên" : "Học sinh";
  $("mode-pill").className = "pill" + (T ? " t" : "");
  $("mode-text").textContent = texts[mode];
  $("pin-box").hidden = mode !== "local" || T;
  $("t-exit").hidden = !(mode === "local" && T);
  $("reveal-all").hidden = !T; $("hide-all").hidden = !T;
  if ($("chieu-all")) $("chieu-all").hidden = !T || !window.Chieu || !window.Chieu.parts.length;
  $("theo-doi").hidden = !dashOn(); $("toc-dash").hidden = !dashOn();
  $("group-bar").hidden = !groupsOn();
  $("name-label").textContent = groupsOn() ? "Tên nhóm / học sinh:" : "Họ tên / Nhóm:";
  $("dash-open-h").textContent = groupsOn() ? "Mở bài" : "";
}
function renderGroups(){
  if (!groupsOn()) return;
  const box = $("gchips"); box.innerHTML = "";
  for (let i = 1; i <= S.ngroups; i++) {
    const k = "g" + i, g = groupData(k);
    const b = el("button", {class:"gchip", type:"button", "aria-pressed": k === S.active ? "true" : "false", title: g.name},
      '<span class="gn">' + esc(g.name || ("Nhóm " + i)) + '</span><span class="gc">' + countSub(g) + "/" + TASK_IDS.length + "</span>");
    b.addEventListener("click", () => switchGroup(k));
    box.appendChild(b);
  }
  if (S.ngroups < 20) {
    const add = el("button", {class:"gchip add", type:"button"}, "+ Thêm nhóm");
    add.addEventListener("click", () => { S.ngroups++; saveLocal(); switchGroup("g" + S.ngroups); });
    box.appendChild(add);
  }
}
let outline = null;
function renderAll(){ renders.forEach(r => r()); updateProgress(); updateModeUI(); renderGroups(); if (dashOn()) renderDash(); if (outline) outline.update(); }

/* tên */
const nm = $("hs-name");
nm.value = S.name || "";
nm.addEventListener("input", () => { S.name = nm.value; changed(); });

/* PIN giáo viên (chế độ một máy) */
$("pin-go").addEventListener("click", () => {
  if ($("pin").value.trim().toLowerCase() === TEACHER_PIN) { S.teacher = true; $("pin").value = ""; $("pin-msg").textContent = ""; saveLocal(); renderAll(); }
  else $("pin-msg").textContent = "Mã chưa đúng.";
});
$("pin").addEventListener("keydown", e => { if (e.key === "Enter") $("pin-go").click(); });
$("t-exit").addEventListener("click", () => { S.teacher = false; saveLocal(); renderAll(); });
const ALL_REV = TASK_IDS.concat(Object.keys(CONCEPTS));
function setAll(v){
  if (mode === "local") { ALL_REV.forEach(k => S.rev[k] = v); saveLocal(); }
  renderAll();
}
$("reveal-all").addEventListener("click", () => setAll(true));
if ($("chieu-all")) $("chieu-all").addEventListener("click", () => window.Chieu.open(null, {onShow: k => { if (!isRev(k)) setRev(k, true); }}));
$("hide-all").addEventListener("click", () => setAll(false));

/* làm lại */
$("reset").addEventListener("click", () => {
  $("reset-q").textContent = groupsOn() ? "Xoá câu trả lời của " + (S.name || "nhóm này") + "?" : "Xoá toàn bộ câu trả lời của em?";
  $("reset-all").hidden = !(groupsOn() && isTeacher());
  $("reset-confirm").hidden = false;
});
$("reset-no").addEventListener("click", () => { $("reset-confirm").hidden = true; });
$("reset-yes").addEventListener("click", async () => {
  ["ans","sub","mcq","sort","match","order"].forEach(f => S[f] = {}); S.t = 0;
  if (groupsOn()) { Object.keys(S.note).forEach(k => { if (k.indexOf(S.active + "|") === 0) delete S.note[k]; }); stash(); }
  saveLocal();
  if (myWriter && mode === "online") { try { await myWriter.now(); } catch(e) {} }
  location.reload();
});
$("reset-all").addEventListener("click", () => {
  const keep = {teacher: S.teacher, ngroups: S.ngroups};
  S = fresh(); S.teacher = keep.teacher; S.ngroups = keep.ngroups; saveLocal();
  location.reload();
});

/* ================= BẢNG THEO DÕI CỦA GV ================= */
const dsel = $("dash-select");
TASK_IDS.forEach(id => dsel.appendChild(el("option", {value:id}, esc(TASKS[id].label))));
dsel.addEventListener("change", renderDash);
$("dash-reveal").addEventListener("click", () => setRev(dsel.value, !isRev(dsel.value)));
function timeAgo(t){ if (!t) return "—"; const s = Math.round((Date.now() - t) / 1000); if (s < 60) return "vừa xong"; if (s < 3600) return Math.floor(s / 60) + " phút trước"; return new Date(t).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"}); }
$("dash-rows").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (b) switchGroup(b.getAttribute("data-g")); });
function renderDash(){
  const local = []; for (let i = 1; i <= S.ngroups; i++) local.push(Object.assign({gk: "g" + i}, groupData("g" + i)));
  let docs;
  if (mode === "local") docs = local;
  else {
    docs = classDocs.slice().sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"));
    const used = local.filter(g => g.t || countSub(g));
    docs = docs.concat(used.length || docs.length ? used : local);
  }
  const id = dsel.value, t = TASKS[id];
  const nSub = docs.filter(d => d.sub && d.sub[id]).length;
  $("dash-sum").innerHTML = "<span>Số bài làm: <b>" + docs.length + "</b></span><span>Đã nộp câu đang xem: <b>" + nSub + "/" + docs.length + "</b></span>";
  const tb = $("dash-rows"); tb.innerHTML = "";
  if (!docs.length) tb.appendChild(el("tr", null, '<td colspan="4" class="empty">Chưa có bài làm nào. Học sinh mở trang, nhập tên nhóm và trả lời để bài hiện ở đây.</td>'));
  docs.forEach(d => tb.appendChild(el("tr", null, "<td>" + esc(d.name || "(chưa nhập tên)") + (d.gk && d.gk === S.active ? ' <span class="chip sub">Đang mở</span>' : "") + '</td><td class="num">' + countSub(d) + "/" + TASK_IDS.length + '</td><td class="num">' + timeAgo(d.t) + "</td><td>" + (d.gk && d.gk !== S.active ? '<button class="btn" type="button" data-g="' + d.gk + '">Mở</button>' : "") + "</td>")));
  $("dash-reveal").textContent = isRev(id) ? "Ẩn phần chốt câu này" : "GV chốt câu này";
  const list = $("dash-answers"); list.innerHTML = "";
  if (!docs.length) { list.appendChild(el("p", {class:"empty"}, "Câu trả lời của học sinh sẽ hiện ở đây.")); return; }
  docs.forEach(d => {
    const sub = !!(d.sub && d.sub[id]);
    let body = "", chip = sub ? '<span class="chip sub">Đã nộp</span>' : '<span class="chip draft">Đang làm</span>';
    if (t.type === "open") body = esc((d.ans && d.ans[id]) || "");
    else { const g = grade(id, d); if (g) { body = esc(g.text); if (sub) chip += g.ok ? ' <span class="chip ok">Đúng</span>' : ' <span class="chip bad">Chưa đúng</span>'; } }
    if (!body) { body = '<span class="empty">Chưa trả lời</span>'; chip = '<span class="chip draft">Chưa làm</span>'; }
    const item = el("div", {class:"ans-item"});
    item.appendChild(el("div", {class:"who-l"}, esc(d.name || "(chưa nhập tên)") + " " + chip));
    item.appendChild(el("div", {class:"txt"}, body));
    list.appendChild(item);
  });
}

/* ================= BUỔI HỌC TRỰC TUYẾN (Google Sheets) ================= */
function stamp(){ return new Date().toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"}); }
function makeWriter(){
  let timer = null, busy = false, again = false, retry = null;
  async function flush(){
    if (mode !== "online") return;
    if (busy) { again = true; return; }
    busy = true; setSync("Đang gửi bài…");
    try {
      await API.submit({bai: window.LESSON.id, buoi: S.session, clientId: S.clientId, group: S.name || "", sub: countSub(S),
        data: {ans: S.ans, sub: S.sub, mcq: S.mcq, sort: S.sort, match: S.match, order: S.order}, cols: window.LESSON.summary(S)});
      clearTimeout(retry); setSync("Đã gửi lúc " + stamp());
    } catch(e) {
      setSync("Chưa gửi được (" + e.message + "). Bài vẫn lưu trên máy, trang sẽ tự gửi lại.");
      clearTimeout(retry); retry = setTimeout(flush, 15000);
    }
    busy = false; if (again) { again = false; flush(); }
  }
  return { queue(){ clearTimeout(timer); timer = setTimeout(flush, 1500); }, now(){ clearTimeout(timer); return flush(); } };
}

let pollTimer = null;
async function pollReveal(){
  if (mode !== "online") return;
  try {
    const st = await API.getStatus(window.LESSON.id, S.session, S.clientId);
    const fresh = JSON.stringify(st.rev) !== JSON.stringify(REV) || JSON.stringify(st.nx) !== JSON.stringify(NX);
    if (fresh) {
      const changedKeys = Object.keys(st.nx).filter(k => st.nx[k] !== NX[k]);
      const newLike = changedKeys.some(k => k.indexOf("like.") === 0), newNx = changedKeys.some(k => k.indexOf("like.") !== 0);
      REV = st.rev; NX = st.nx; renderAll();
      if (newNx || newLike) setSync("Thầy cô vừa " + (newNx && newLike ? "gửi nhận xét và khen" : newLike ? "khen câu trả lời của em" : "gửi nhận xét mới") + " lúc " + stamp() + ".");
    }
  } catch(e) { setSync("Chưa nhận được phần chốt (" + e.message + ")."); }
  clearTimeout(pollTimer);
  pollTimer = setTimeout(pollReveal, 10000 + Math.random() * 5000);
}

function goOnline(){
  mode = "online"; S.teacher = false;
  myWriter = makeWriter();
  saveLocal(); renderAll();
  myWriter.now(); pollReveal();
}
function joinSession(){
  const code = API.normSession($("buoi").value);
  const msg = $("join-msg");
  if (!code) { msg.textContent = "Em hãy nhập mã buổi học thầy cô cho."; return; }
  if (!(S.name || "").trim() || /^Nhóm \d+$/.test(S.name) && !$("hs-name").dataset.touched) {
    msg.textContent = "Em hãy nhập tên nhóm hoặc tên của em trước."; $("hs-name").focus(); return; }
  msg.textContent = "";
  const name = S.name;
  stash();
  S.localActive = S.active;
  S.session = code;
  const k = "on:" + code;
  const g = groupData(k);
  S.active = k;
  GF.forEach(f => S[f] = clone(g[f]));
  S.name = name; nm.value = name;
  REV = {}; NX = {};
  goOnline();
}
function leaveSession(){
  stash();
  clearTimeout(pollTimer);
  myWriter = null; mode = "local"; REV = {}; NX = {};
  const k = S.localActive && S.localActive[0] === "g" ? S.localActive : "g1";
  const g = groupData(k);
  S.active = k; S.session = "";
  GF.forEach(f => S[f] = clone(g[f]));
  nm.value = S.name || "";
  setSync("");
  saveLocal(); renderAll();
}
nm.addEventListener("input", () => { nm.dataset.touched = "1"; });
$("join-go").addEventListener("click", joinSession);
$("buoi").addEventListener("keydown", e => { if (e.key === "Enter") joinSession(); });
$("leave").addEventListener("click", leaveSession);

/* Link có ?buoi=MÃ thì điền sẵn mã buổi học */
const qBuoi = API.normSession(new URLSearchParams(location.search).get("buoi") || "");
if (qBuoi) $("buoi").value = qBuoi;

if (API.demo) {
  const lead = document.querySelector("header .lead");
  if (lead) lead.innerHTML = "Chọn đúng <b>nhóm</b> của em, quan sát hình, trả lời từng câu hỏi trong sách giáo khoa rồi bấm <b>Nộp câu trả lời</b>. Sau khi các nhóm trình bày, thầy cô nhận xét và <b>chốt kiến thức</b>.";
}
outline = window.Outline.mount({
  root: document.querySelector("main"), aside: $("outline"), pagerHost: document.querySelector("main .wrap"), storeKey: "focus-hs-" + window.LESSON.id,
  progress: a => a.tasks.length ? {done: a.tasks.filter(t => S.sub[t]).length, total: a.tasks.length} : {done: 0, total: 0, label: ""},
  chot: a => a.tasks.length ? a.tasks.every(t => isRev(t)) : isRev(a.concept)
});
renderAll();
if (S.session && String(S.active).indexOf("on:") === 0) {
  if (API.demo) leaveSession();
  else { $("buoi").value = S.session; goOnline(); }
}
else if (qBuoi && !API.demo) setSync("Nhập tên nhóm rồi bấm Vào buổi học.");
})();
