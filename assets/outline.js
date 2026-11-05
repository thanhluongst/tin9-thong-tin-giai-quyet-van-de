/* Thanh "Tiến trình bài học": đánh số các bước, hoạt động; hiện tiến độ;
   bấm một mục thì cột bên phải CHỈ hiện phần đó (có nút Trước / Tiếp và Hiện toàn bộ).
   Dùng chung cho trang học sinh và trang giáo viên. */
(function(){
"use strict";
function el(tag, attrs, html){ const e = document.createElement(tag); if (attrs) for (const a in attrs) e.setAttribute(a, attrs[a]); if (html != null) e.innerHTML = html; return e; }
function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e) { return null; } }

const LEGEND = [
  ["empty", "Chưa làm"], ["draft", "Đang làm, chưa nộp"], ["sub", "Đã nộp, chờ chốt"], ["right", "Đúng"], ["wrong", "Cần sửa"]
];
const NARROW = "(max-width: 1099px)";

function mount(opts){
  const {root, aside, progress, chot, title} = opts;
  const extras = opts.extras || [];                 // mục quản lí thêm (trang giáo viên): [{id, code, title}]
  const pagerHost = opts.pagerHost || root;
  const KEY = opts.storeKey || "focus-" + location.pathname;
  const STAGES = window.LESSON.STAGES, esc = window.LESSON.esc;

  /* 1. Gắn mã số và id cho từng hoạt động trong nội dung bài */
  STAGES.forEach(st => st.acts.forEach(a => {
    // hoạt động có câu hỏi: tìm theo câu đầu tiên; mục "Ghi bài": tìm theo khung chốt
    const slot = root.querySelector(a.tasks.length ? '[data-task="' + a.tasks[0] + '"]' : '[data-concept="' + a.concept + '"]');
    const act = slot && slot.closest(".act");
    if (!act) return;
    act.id = a.id; act.setAttribute("data-code", a.code);
    const tag = act.querySelector(".act-tag");
    if (tag && !tag.querySelector(".code")) tag.insertBefore(el("span", {class: "code"}, a.code), tag.firstChild);
  }));

  /* 2. Dựng thanh tiến trình */
  aside.innerHTML = "";
  const det = el("details", {class: "ol"});
  det.open = !window.matchMedia(NARROW).matches;
  const sum = el("summary", null, '<span>' + esc(title || "Tiến trình bài học") + '</span><span class="ol-total"></span>');
  det.appendChild(sum);
  const allBtn = el("button", {class: "btn ol-all", type: "button"}, "Hiện toàn bộ bài");
  det.appendChild(allBtn);
  const list = el("ol", {class: "ol-stages"});
  if (extras.length) {
    const li = el("li", {class: "ol-stage ol-extra"});
    li.appendChild(el("div", {class: "ol-step"}, "Quản lí lớp"));
    const ul = el("ol", {class: "ol-acts"});
    extras.forEach(x => ul.appendChild(el("li", {"data-unit": x.id}, '<a href="#' + x.id + '"><span class="sn">' + esc(x.code || "") + '</span><span class="t">' + esc(x.title) + "</span><span></span></a>")));
    li.appendChild(ul); list.appendChild(li);
  }
  const rows = [];
  STAGES.forEach(st => {
    const li = el("li", {class: "ol-stage", "data-stage": st.id, "data-unit": st.id});
    li.appendChild(el("div", {class: "ol-step"}, esc(st.step)));
    li.appendChild(el("a", {href: "#" + st.id, class: "ol-st"}, '<span class="sn">' + st.code + "</span> " + esc(st.title)));
    const acts = el("ol", {class: "ol-acts"});
    st.acts.forEach(a => {
      const ai = el("li", {"data-act": a.id, "data-unit": a.id, class: a.ghi ? "ghi" : ""});
      const link = el("a", {href: "#" + a.id}, '<span class="sn">' + a.code + '</span><span class="t">' + esc(a.title) + '</span><span class="cnt"></span>');
      const bar = el("span", {class: "bar", "aria-hidden": "true"}, "<i></i>");
      ai.append(link, bar); acts.appendChild(ai);
      rows.push({a, st, ai, cnt: link.querySelector(".cnt"), fill: bar.querySelector("i")});
    });
    li.appendChild(acts);
    list.appendChild(li);
  });
  det.appendChild(list);
  const leg = el("div", {class: "legend"}, '<div class="legend-t">Màu câu trả lời</div>' +
    LEGEND.map(([k, t]) => '<span class="lg"><i class="sw ' + k + '"></i>' + t + "</span>").join(""));
  det.appendChild(leg);
  aside.appendChild(det);

  /* 3. Cập nhật tiến độ */
  function update(){
    let done = 0, total = 0;
    rows.forEach(r => {
      const p = progress(r.a) || {done: 0, total: 0};
      done += p.done; total += p.total;
      const ratio = p.total ? p.done / p.total : 0;
      r.cnt.textContent = p.label || (p.done + "/" + p.total);
      r.fill.style.width = Math.round(ratio * 100) + "%";
      r.ai.classList.toggle("done", p.total > 0 && ratio >= 1);
      r.ai.classList.toggle("chot", !!(chot && chot(r.a)));
    });
    sum.querySelector(".ol-total").textContent = total ? Math.round(done / total * 100) + "%" : "";
  }

  /* 4. Chế độ chỉ hiện một phần */
  // Thứ tự các phần để đi Trước / Tiếp: mục quản lí, rồi từng hoạt động theo tiến trình
  const UNITS = extras.map(x => ({type: "extra", id: x.id, label: (x.code ? x.code + " " : "") + x.title}))
    .concat(STAGES.flatMap(st => st.acts.map(a => ({type: "act", id: a.id, stage: st.id, label: a.code + " " + a.title}))));
  const stageOf = id => STAGES.find(st => st.id === id);
  const sections = () => [...root.querySelectorAll(":scope > section.part, :scope section.part")].filter((s, i, arr) => arr.indexOf(s) === i);
  const extraEls = () => extras.map(x => document.getElementById(x.id)).filter(Boolean);

  const pager = el("nav", {class: "pager", "aria-label": "Chuyển phần"});
  const prevB = el("button", {class: "btn", type: "button"}), nextB = el("button", {class: "btn primary", type: "button"});
  const where = el("span", {class: "status"});
  pager.append(prevB, where, nextB);
  pagerHost.appendChild(pager);

  let F = null;
  try { F = JSON.parse(store(KEY) || "null"); } catch(e) { F = null; }

  function apply(scroll){
    const secs = sections(), exs = extraEls();
    const all = !F;
    secs.concat(exs).forEach(n => n.classList.remove("f-hide"));
    secs.forEach(s => s.querySelectorAll(":scope > .act").forEach(a => a.classList.remove("f-hide")));
    if (!all) {
      if (F.type === "extra") {
        secs.forEach(s => s.classList.add("f-hide"));
        exs.forEach(x => x.classList.toggle("f-hide", x.id !== F.id));
      } else {
        const stId = F.type === "stage" ? F.id : (UNITS.find(u => u.id === F.id) || {}).stage;
        exs.forEach(x => x.classList.add("f-hide"));
        secs.forEach(s => s.classList.toggle("f-hide", s.id !== stId));
        if (F.type === "act") {
          const sec = document.getElementById(stId);
          if (sec) sec.querySelectorAll(":scope > .act").forEach(a => a.classList.toggle("f-hide", a.id !== F.id));
        }
      }
    }
    // tô mục đang chọn
    list.querySelectorAll("[data-unit]").forEach(n => n.classList.toggle("sel", !!F && n.getAttribute("data-unit") === F.id));
    document.querySelectorAll("nav.toc a[href^='#']").forEach(l => {
      const id = l.getAttribute("href").slice(1);
      const st = F && (F.type === "stage" ? F.id : F.type === "act" ? (UNITS.find(u => u.id === F.id) || {}).stage : F.id);
      l.classList.toggle("sel", !!F && id === st);
    });
    allBtn.hidden = all;
    // nút Trước / Tiếp
    pager.hidden = all;
    if (!all) {
      let prev = null, next = null, label = "";
      if (F.type === "stage") {
        const i = STAGES.findIndex(s => s.id === F.id);
        prev = i > 0 ? {type: "stage", id: STAGES[i - 1].id, label: STAGES[i - 1].code + " " + STAGES[i - 1].title} : (extras.length ? UNITS[extras.length - 1] : null);
        next = i < STAGES.length - 1 ? {type: "stage", id: STAGES[i + 1].id, label: STAGES[i + 1].code + " " + STAGES[i + 1].title} : null;
        label = STAGES[i].code + " " + STAGES[i].title;
      } else {
        const i = UNITS.findIndex(u => u.id === F.id);
        prev = UNITS[i - 1] || null; next = UNITS[i + 1] || null; label = UNITS[i] ? UNITS[i].label : "";
      }
      prevB.hidden = !prev; nextB.hidden = !next;
      if (prev) { prevB.textContent = "← " + prev.label; prevB.onclick = () => show({type: prev.type, id: prev.id}); }
      if (next) { nextB.textContent = next.label + " →"; nextB.onclick = () => show({type: next.type, id: next.id}); }
      where.textContent = "Đang xem: " + label;
    }
    if (scroll) {
      const target = !F ? document.body : document.getElementById(F.id);
      const top = target ? target.getBoundingClientRect().top + window.scrollY - 72 : 0;
      window.scrollTo({top: F ? Math.max(0, top) : 0});
    }
  }
  function show(f, noScroll){
    F = f && (f.type === "all" ? null : f);
    store(KEY, JSON.stringify(F));
    apply(!noScroll);
  }
  allBtn.addEventListener("click", () => show(null));

  // Bấm vào thanh tiến trình hoặc thanh mục lục trên cùng
  function unitFromHash(id){
    if (stageOf(id)) return {type: "stage", id};
    const u = UNITS.find(x => x.id === id);
    return u ? {type: u.type, id} : null;
  }
  function onLink(e){
    const a = e.target.closest("a[href^='#']"); if (!a) return;
    const f = unitFromHash(a.getAttribute("href").slice(1)); if (!f) return;
    e.preventDefault();
    show(f);
    if (window.matchMedia(NARROW).matches) det.open = false;
  }
  aside.addEventListener("click", onLink);
  document.querySelectorAll("nav.toc").forEach(n => n.addEventListener("click", onLink));

  /* 5. Tô sáng hoạt động đang xem khi cuộn (lúc hiện toàn bộ) */
  const navLinks = [...document.querySelectorAll("nav.toc a[data-stage]")];
  function setCurrent(actId){
    const r = rows.find(x => x.a.id === actId); if (!r) return;
    rows.forEach(x => x.ai.classList.toggle("cur", x === r));
    list.querySelectorAll(".ol-stage").forEach(li => li.classList.toggle("cur", li.getAttribute("data-stage") === r.st.id));
    navLinks.forEach(l => l.classList.toggle("cur", l.getAttribute("data-stage") === r.st.id));
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis.length) setCurrent(vis[0].target.id);
    }, {rootMargin: "-25% 0px -60% 0px"});
    rows.forEach(r => { const n = document.getElementById(r.a.id); if (n) io.observe(n); });
  }

  /* Mở đúng hoạt động chứa một câu hỏi (dùng khi bấm ô trong bảng màu) */
  function focusTask(taskId){
    for (const st of STAGES) for (const a of st.acts) if (a.tasks.indexOf(taskId) >= 0) { show({type: "act", id: a.id}, true); return; }
  }

  if (F && !(F.type === "stage" ? stageOf(F.id) : UNITS.some(u => u.id === F.id))) F = null;
  apply(false);
  update();
  return {update, show, focusTask};
}

window.Outline = {mount};
})();
