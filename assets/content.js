/* Nội dung bài học: câu hỏi SGK, đáp án chốt và cách chấm. Dùng chung cho trang học sinh và trang giáo viên. */
(function(){
"use strict";
const TASKS = {
  kd1:{type:"open", label:"Mở đầu", q:"Thông tin trên Internet rất nhiều và dễ tìm. Theo em, vì sao An cần tìm thông tin có chất lượng để chọn trường THPT phù hợp?",
    k:"Thông tin trên Internet <b>rất nhiều nhưng không phải thông tin nào cũng hữu ích, đáng tin cậy</b>. Chỉ có thông tin <b>có chất lượng</b> mới giúp An so sánh đúng các trường và chọn được trường phù hợp với sở thích, khả năng của mình; nếu dùng thông tin sai, cũ hoặc thiếu, An có thể chọn nhầm trường."},
  hd1:{type:"open", label:"HĐ1 – Chọn trường", q:"Em hãy cho biết việc Minh chia sẻ thông tin với An và An đã tin tưởng, sử dụng thông tin để chọn trường mà chưa tìm hiểu kĩ sẽ có thể xảy ra vấn đề gì.",
    k:"<ul><li>Thông tin trên trang web có thể <b>đã cũ</b> (Hình 2.1 ghi “Năm học 2001–2002”), <b>chưa chính xác, chưa đầy đủ</b> hoặc chỉ là lời quảng cáo.</li><li>An chưa kiểm chứng nên quyết định có thể <b>không đúng</b>: trường thực tế khác lời giới thiệu, không phù hợp với An.</li><li>An chỉ đăng kí <b>một nguyện vọng</b> nên <b>giảm cơ hội lựa chọn</b>, nếu không đỗ sẽ gặp khó khăn.</li></ul>"},
  nguon:{type:"sort", label:"Đọc hiểu – Nguồn tin",
    q:"Đọc mục 1 (SGK trang 10). Để chọn trường THPT, mỗi nguồn thông tin dưới đây là nguồn đáng tin cậy hay cần kiểm chứng thêm?",
    cats:["Đáng tin cậy","Cần kiểm chứng"],
    items:[["Trang web của Sở Giáo dục và Đào tạo",0],["Ý kiến của giáo viên chủ nhiệm",0],["Người thân có kinh nghiệm",0],["Một trang web giới thiệu trường mà bạn gửi cho, chưa rõ cập nhật khi nào",1],["Bài quảng cáo về trường trên mạng xã hội",1],["Bình luận ẩn danh trên một diễn đàn",1]],
    k:"SGK nêu các nguồn đáng tin cậy: <b>trang web của Sở Giáo dục và Đào tạo, ý kiến của giáo viên chủ nhiệm hay của người thân có kinh nghiệm</b>. Thông tin từ trang web lạ, quảng cáo, bình luận ẩn danh cần được <b>kiểm chứng</b> trước khi dùng để ra quyết định."},
  kol:{type:"mcq", label:"Câu hỏi tr.10 – KOL", q:"KOL (Key Opinion Leader) là người dẫn dắt dư luận chủ chốt hay người có ảnh hưởng. Khi em thấy một KOL quảng cáo sản phẩm trên mạng, em sẽ ứng xử thế nào?",
    o:["Chia sẻ thông tin với người thân vì KOL là một nguồn tin đáng tin cậy.","Sử dụng sản phẩm vì KOL là một đảm bảo cho sản phẩm đã qua kiểm định.","Cân nhắc, đánh giá chất lượng thông tin trước khi sử dụng sản phẩm.","Không sử dụng và cảnh báo người thân về nguồn tin kém chất lượng."], a:2,
    k:"Lời quảng cáo của KOL <b>chưa chắc đã đúng</b> (KOL có thể được trả tiền để quảng cáo), nhưng cũng <b>chưa chắc đã sai</b>. Vì vậy em cần <b>cân nhắc, đánh giá chất lượng thông tin</b> trước khi sử dụng sản phẩm."},
  hd2a:{type:"open", label:"HĐ2 – Câu 1", q:"Hãy tìm kiếm và lựa chọn thông tin mà theo em là hữu ích giúp em chọn trường THPT.",
    k:"Ví dụ thông tin hữu ích: <b>điểm chuẩn</b> các năm gần đây, <b>chỉ tiêu tuyển sinh</b>, <b>thời gian và cách đăng kí</b> nguyện vọng, môn thi, khoảng cách từ nhà đến trường, học phí, chất lượng dạy học, các câu lạc bộ, hoạt động ngoại khoá,… lấy từ trang web của Sở GD&ĐT, của trường, ý kiến thầy cô."},
  hd2b:{type:"open", label:"HĐ2 – Câu 2", q:"Tại sao thông tin đó là hữu ích đối với việc giải quyết vấn đề chọn trường của em?",
    k:"Vì thông tin đó <b>mới</b> (năm học này), <b>chính xác</b> (từ nguồn tin cậy), <b>đầy đủ</b> (nhiều khía cạnh) và <b>liên quan trực tiếp</b> đến việc chọn trường: giúp em so sánh điểm chuẩn với khả năng của mình, biết hạn đăng kí, chọn trường phù hợp sở thích và điều kiện gia đình."},
  tc:{type:"match", label:"Đọc hiểu – Bốn tiêu chí", ph:"Chọn…",
    q:"Đọc mục 2 (SGK trang 10–11). Mỗi thông tin kém chất lượng dưới đây vi phạm tiêu chí nào?",
    opts:["a) Tính mới","b) Tính chính xác","c) Tính đầy đủ","d) Tính sử dụng được"],
    items:[["1) Trang web giới thiệu trường ghi thông tin của năm học 2001–2002",1],["2) Bài viết ghi sai điểm tuyển sinh, sai địa chỉ của trường",2],["3) Thông tin về trường thiếu chi tiết học phí, môi trường học tập, đội ngũ giáo viên",3],["4) Thông tin về du học nước ngoài khi em đang cần chọn một trường THPT công lập",4]],
    k:"1 – a (thông tin đã lỗi thời); 2 – b (nội dung sai); 3 – c (thiếu nhiều khía cạnh); 4 – d (không liên quan, không phù hợp với vấn đề cần giải quyết)."},
  p11a:{type:"mcq", label:"Câu hỏi tr.11 – a", q:"Khi tìm thông tin về các trường THPT, bạn An đã không để ý đến thời gian đăng kí nguyện vọng dự thi và xét tuyển vào lớp 10 các trường THPT công lập. Sơ suất này vi phạm tiêu chí nào về chất lượng thông tin?",
    o:["Tính mới.","Tính chính xác.","Tính đầy đủ.","Tính sử dụng được."], a:2,
    k:"Vi phạm <b>tính đầy đủ</b>: thông tin An thu thập còn thiếu một khía cạnh quan trọng là <b>thời gian đăng kí</b> nguyện vọng, nên An không có cái nhìn toàn diện về việc chọn trường."},
  p11b:{type:"open", label:"Câu hỏi tr.11 – b", q:"Điều đó có thể dẫn đến khó khăn gì cho bạn An?",
    k:"An có thể <b>bỏ lỡ hạn đăng kí</b>, không kịp nộp hồ sơ dự thi, xét tuyển vào trường THPT công lập mình mong muốn; mất cơ hội vào trường công lập, phải chuyển sang học trường khác (dân lập, tư thục) với học phí cao hơn hoặc không phù hợp."},
  lt1:{type:"sort", label:"Luyện tập – Đạt tiêu chí?",
    q:"Đọc tình huống Luyện tập (SGK trang 11). Thông tin số điện thoại mà mỗi bạn nhận được có đạt tiêu chí dưới đây không?",
    cats:["Đạt","Không đạt"],
    items:[["Số của An (trang web nông trại): tính mới",1],["Số của An: tính chính xác",1],["Số của An: tính sử dụng được",1],["Số của Minh (website nhà cung cấp dịch vụ viễn thông): tính mới",0],["Số của Minh: tính chính xác",0],["Số của Minh: tính sử dụng được",0]],
    k:"Số điện thoại An lấy từ trang web của nông trại <b>chưa được cập nhật</b> nên không còn mới, không chính xác và không dùng để liên lạc được. Số Minh tìm trên website nhà cung cấp dịch vụ viễn thông là thông tin <b>mới, chính xác, dùng được</b> (Minh đã liên hệ thành công)."},
  lt2:{type:"open", label:"Luyện tập – Nhận xét", q:"Em hãy nhận xét về chất lượng của thông tin (theo bốn tiêu chí ở Hình 2.2) mà mỗi bạn thu nhận được.",
    k:"<ul><li><b>Thông tin của An:</b> không có <b>tính mới</b> (số cũ, chưa cập nhật), không <b>chính xác</b> (số đã thay đổi), không <b>sử dụng được</b> (gọi không liên lạc được). Về <b>tính đầy đủ</b>: chỉ có số cũ, thiếu số mới.</li><li><b>Thông tin của Minh:</b> có <b>tính mới</b>, <b>chính xác</b>, <b>sử dụng được</b> (liên hệ thành công); đủ để giải quyết vấn đề liên lạc với nông trại.</li><li>Bài học: nên tìm và <b>đối chiếu thông tin từ nhiều nguồn</b>, ưu tiên nguồn được cập nhật, tin cậy.</li></ul>"},
  vd1:{type:"open", label:"Vận dụng – Tìm thông tin", q:"Em hãy tìm trên Internet thông tin về chiếc máy tính điện tử kĩ thuật số đầu tiên trên thế giới. Ghi lại thông tin em tìm được và nguồn (trang web) của thông tin đó.",
    k:"Nhiều nguồn cho biết đó là máy <b>ENIAC</b> (Electronic Numerical Integrator and Computer), hoàn thành năm <b>1945</b>, công bố năm <b>1946</b> tại Đại học Pennsylvania (Mỹ); nặng khoảng 27 tấn, dùng khoảng 17 468 bóng đèn điện tử chân không. Một số nguồn khác nêu máy <b>ABC</b> (Atanasoff–Berry Computer, 1937–1942) hoặc Colossus (Anh, 1943–1944) là máy tính điện tử đầu tiên."},
  vd2:{type:"open", label:"Vận dụng – Đánh giá", q:"Đánh giá chất lượng thông tin em tìm được theo bốn tiêu chí: tính mới, tính chính xác, tính đầy đủ, tính sử dụng được.",
    k:"Gợi ý: <ul><li><b>Chính xác:</b> đối chiếu nhiều nguồn; nguồn uy tín (bách khoa toàn thư, bảo tàng, trang của trường đại học, báo chính thống) đáng tin hơn blog cá nhân. Các nguồn có thể khác nhau tuỳ cách hiểu “máy tính điện tử đầu tiên”.</li><li><b>Đầy đủ:</b> có tên máy, năm, nơi chế tạo, người chế tạo, đặc điểm chính chưa?</li><li><b>Mới:</b> sự kiện lịch sử không thay đổi, nhưng nên dùng bài viết được cập nhật.</li><li><b>Sử dụng được:</b> thông tin có trả lời đúng câu hỏi đặt ra không?</li></ul>"}
};
const CONCEPTS = {
  c1:{t:"Ghi nhớ", b:"<ul><li>Thông tin là cơ sở để đưa ra các quyết định. Cần phải quan tâm đến <b>chất lượng thông tin</b> khi tìm kiếm, tiếp nhận, trao đổi và sử dụng thông tin để có thể đưa ra các quyết định đúng đắn.</li></ul>"},
  c2:{t:"Ghi nhớ", b:"<ul><li>Chất lượng thông tin là yếu tố quan trọng, quyết định hiệu quả của việc giải quyết vấn đề.</li><li>Chất lượng thông tin được đánh giá thông qua <b>tính mới, tính chính xác, tính đầy đủ, tính sử dụng được</b>.</li></ul>"},

  /* ---- GHI BÀI: nội dung ngắn gọn để học sinh chép vào vở, chốt ở cuối mỗi phần ---- */
  g1:{ghi:true, t:"Ghi bài", b:'<p class="gh">Mở đầu</p><ul>'
    + "<li>Thông tin trên Internet rất nhiều, dễ tìm nhưng không phải thông tin nào cũng có chất lượng.</li>"
    + "<li>Cần tìm thông tin <b>có chất lượng</b> để giải quyết vấn đề (ví dụ: chọn trường THPT).</li></ul>"},
  g2:{ghi:true, t:"Ghi bài", b:'<p class="gh">1. Vai trò của chất lượng thông tin trong giải quyết vấn đề</p><ul>'
    + "<li>Thông tin là <b>cơ sở để đưa ra quyết định</b>.</li>"
    + "<li>Dùng thông tin chưa kiểm chứng (cũ, sai, thiếu) → quyết định có thể sai.</li>"
    + "<li>Nên dùng thông tin từ <b>nguồn đáng tin cậy</b>: trang web của Sở GD&ĐT, giáo viên chủ nhiệm, người thân có kinh nghiệm,…</li>"
    + "<li>Không phải số lượng mà <b>chất lượng</b> thông tin mới làm thông tin trở nên hữu ích.</li></ul>"},
  g3:{ghi:true, t:"Ghi bài", b:'<p class="gh">2. Chất lượng thông tin</p>'
    + "<p>Chất lượng thông tin là mức độ đáp ứng của thông tin đối với yêu cầu cụ thể để giải quyết vấn đề. Bốn tiêu chí đánh giá:</p><ul>"
    + "<li><b>Tính mới</b> (cập nhật): thông tin không bị lỗi thời.</li>"
    + "<li><b>Tính chính xác</b>: nội dung đúng, cụ thể, xác minh được.</li>"
    + "<li><b>Tính đầy đủ</b>: bao quát nhiều khía cạnh, cho cái nhìn tổng thể.</li>"
    + "<li><b>Tính sử dụng được</b> (liên quan, phù hợp): liên quan đến vấn đề cần giải quyết.</li></ul>"
    + "<p>➜ Ví dụ: An không biết thời gian đăng kí nguyện vọng → thông tin <b>thiếu tính đầy đủ</b> → có thể lỡ hạn đăng kí.</p>"},
  g4:{ghi:true, t:"Ghi bài", b:'<p class="gh">Luyện tập</p><ul>'
    + "<li>Số điện thoại của An (trang web nông trại chưa cập nhật): không mới, không chính xác, không sử dụng được.</li>"
    + "<li>Số điện thoại của Minh (website nhà cung cấp dịch vụ viễn thông): mới, chính xác, sử dụng được.</li>"
    + "<li>➜ Nên đối chiếu thông tin từ nhiều nguồn tin cậy.</li></ul>"},
  g5:{ghi:true, t:"Ghi bài", b:'<p class="gh">Vận dụng</p><ul>'
    + "<li>Máy tính điện tử kĩ thuật số đầu tiên: nhiều nguồn nêu là <b>ENIAC</b> (Mỹ, 1945–1946); một số nguồn nêu máy ABC hoặc Colossus.</li>"
    + "<li>Đánh giá thông tin theo 4 tiêu chí; ưu tiên nguồn uy tín, so sánh nhiều nguồn.</li></ul>"}
};
const TASK_IDS = Object.keys(TASKS);
const L = ["A","B","C","D"];
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
/* Nhãn ngắn của lựa chọn ghép nối thứ p (bắt đầu từ 1): "a", "b",… hoặc số cổng */
function optShort(t, p){ if (!p) return "?"; const o = t.opts && t.opts[p - 1]; return o ? o.split(")")[0] : String(p); }
function grade(id, d){
  const t = TASKS[id];
  if (t.type === "mcq") { const v = d.mcq && d.mcq[id]; if (v == null) return null; return {ok: v === t.a, right: v === t.a ? 1 : 0, total: 1, text: "Chọn " + L[v]}; }
  if (t.type === "sort") { const m = (d.sort && d.sort[id]) || {}; let r = 0, n = 0, wrong = [];
    t.items.forEach(([name, c], i) => { const v = m[i]; if (v != null && v !== -1) n++; if (v === c) r++; else wrong.push(name + (v == null || v === -1 ? " → ?" : " → " + t.cats[v])); });
    if (!n) return null; return {ok: r === t.items.length, right: r, total: t.items.length, text: "Đúng " + r + "/" + t.items.length + (wrong.length ? ". Chưa đúng: " + wrong.join("; ") : "")}; }
  if (t.type === "match") { const m = (d.match && d.match[id]) || {}; let r = 0, n = 0, parts = [];
    t.items.forEach(([name, p], i) => { const v = m[i]; if (v) n++; if (Number(v) === p) r++; parts.push(name.split(")")[0] + "–" + optShort(t, Number(v))); });
    if (!n) return null; return {ok: r === t.items.length, right: r, total: t.items.length, text: "Đúng " + r + "/" + t.items.length + " (" + parts.join(", ") + ")"}; }
  if (t.type === "order") { const a = d.order && d.order[id]; if (!Array.isArray(a)) return null; let r = 0; a.forEach((k, i) => { if (k === t.ans[i]) r++; });
    return {ok: r === a.length, right: r, total: a.length, text: a.join(" → ")}; }
  return null;
}

function countSub(d){ return TASK_IDS.filter(id => d && d.sub && d.sub[id]).length; }
/* Các cột dễ đọc gửi lên Google Sheet: mỗi câu một cột */
function summary(d){
  return TASK_IDS.map(id => {
    const t = TASKS[id], sub = !!(d.sub && d.sub[id]);
    let v = "";
    if (t.type === "open") v = (d.ans && d.ans[id]) || "";
    else { const g = grade(id, d); if (g) v = g.text + (sub ? (g.ok ? " ✓" : " ✗") : ""); }
    if (v && !sub) v = "(nháp) " + v;
    return ["T9B2." + id + " · " + t.label, v];
  });
}
/* Nhận xét mẫu cho giáo viên: ok = khi trả lời đúng/tốt, fix = khi cần sửa.
   Bám theo dự kiến khó khăn của học sinh trong kế hoạch bài dạy. */
const NX_MAU = {
  kd1: {ok:["Đúng! Thông tin nhiều nhưng phải có chất lượng mới giúp ra quyết định đúng."],
        fix:["Thông tin trên mạng có phải lúc nào cũng đúng không? Nếu dùng thông tin sai thì sao?"]},
  hd1: {ok:["Rất tốt! Em chỉ ra được thông tin có thể cũ, sai và An giảm cơ hội lựa chọn.","Em nhận ra chi tiết “Năm học 2001–2002”, rất tinh ý!"],
        fix:["Em quan sát kĩ Hình 2.1: thông tin đó của năm học nào?","Em nêu thêm: An chỉ đăng kí một nguyện vọng thì có rủi ro gì?"]},
  nguon:{ok:["Nhóm phân biệt đúng nguồn tin cậy và nguồn cần kiểm chứng."],
        fix:["Em đọc lại SGK trang 10: những nguồn nào được nêu là đáng tin cậy?"]},
  kol: {ok:["Chính xác! Cần cân nhắc, đánh giá chất lượng thông tin trước khi dùng sản phẩm."],
        fix:["KOL có thể được trả tiền để quảng cáo. Nhưng như vậy có chắc sản phẩm kém không? Em nên làm gì trước?"]},
  hd2a:{ok:["Em chọn được thông tin rất hữu ích cho việc chọn trường."],
        fix:["Em nêu thêm thông tin cụ thể: điểm chuẩn, chỉ tiêu, thời gian đăng kí,…"]},
  hd2b:{ok:["Lập luận tốt: thông tin mới, chính xác, liên quan trực tiếp đến vấn đề."],
        fix:["Thông tin đó giúp em làm gì khi chọn trường? Em giải thích thêm nhé."]},
  tc:  {ok:["Nhóm ghép đúng cả bốn tiêu chí. Rất tốt!"],
        fix:["Em tự hỏi: thông tin đó cũ, sai, thiếu hay không liên quan?"]},
  p11a:{ok:["Chính xác! Thiếu thông tin về thời gian đăng kí là vi phạm tính đầy đủ."],
        fix:["Thông tin An có bị sai hay bị cũ không? Hay là còn thiếu một khía cạnh?"]},
  p11b:{ok:["Đúng! An có thể lỡ hạn đăng kí và mất cơ hội vào trường công lập."],
        fix:["Nếu không biết hạn đăng kí, An có thể bị lỡ việc gì?"]},
  lt1: {ok:["Nhóm đánh giá đúng thông tin của cả hai bạn."],
        fix:["Số của An gọi được không? Số của Minh thì sao? Em xếp lại nhé."]},
  lt2: {ok:["Nhận xét rõ ràng, đủ các tiêu chí. Rất tốt!"],
        fix:["Em nhận xét theo đủ bốn tiêu chí ở Hình 2.2 cho cả An và Minh nhé."]},
  vd1: {ok:["Em tìm được thông tin và ghi rõ nguồn. Rất tốt!"],
        fix:["Em ghi rõ thông tin lấy từ trang web nào nhé.","Em bổ sung năm, nơi chế tạo của chiếc máy đó."]},
  vd2: {ok:["Em đánh giá thông tin theo đủ bốn tiêu chí, có so sánh nhiều nguồn."],
        fix:["Em đánh giá lần lượt theo bốn tiêu chí: mới, chính xác, đầy đủ, sử dụng được."]}
};
const NX_CHUNG = ["Cảm ơn nhóm đã trình bày rõ ràng!","Em giải thích thêm lí do nhé.","Ý đúng nhưng còn thiếu, em bổ sung thêm."];

const SORT_HINT = {
  nguon: "Em đọc lại SGK trang 10: nguồn nào được nêu là đáng tin cậy?",
  lt1: "Em xét lại: số điện thoại đó có gọi được không, có được cập nhật không?"
};
const MATCH_HINT = {
  tc: "Gợi ý: thông tin đó bị cũ, bị sai, bị thiếu hay không liên quan đến vấn đề?"
};
/* Nhận xét tự sinh, nêu đúng chỗ sai (dùng cho xếp nhóm, ghép nối, sắp thứ tự) */
function autoComment(id, d){
  const t = TASKS[id];
  if (t.type === "sort") {
    const m = (d.sort && d.sort[id]) || {};
    const wrong = t.items.map(([name, c], i) => ({name, c, v: m[i]})).filter(x => x.v !== x.c && x.v != null && x.v !== -1);
    const unsure = t.items.filter((x, i) => m[i] == null || m[i] === -1).map(x => x[0]);
    if (!wrong.length && !unsure.length) return "";
    let s = "";
    if (wrong.length) s += "Nhóm xếp chưa đúng: " + wrong.map(x => x.name + " (nhóm chọn " + t.cats[x.v] + ")").join("; ") + ". ";
    if (unsure.length) s += "Chưa xếp: " + unsure.join(", ") + ". ";
    return s + (SORT_HINT[id] || "");
  }
  if (t.type === "match") {
    const m = (d.match && d.match[id]) || {};
    const wrong = t.items.map(([name, p], i) => ({name, p, v: m[i]})).filter(x => Number(x.v) !== x.p);
    if (!wrong.length) return "";
    return "Nhóm cần xem lại: " + wrong.map(x => x.name + (x.v ? " (nhóm chọn " + optShort(t, Number(x.v)) + ")" : " (chưa chọn)")).join("; ") + ". " + (MATCH_HINT[id] || "");
  }
  if (t.type === "order") {
    const a = d.order && d.order[id];
    if (!Array.isArray(a) || a.join() === t.ans.join()) return "";
    return "Nhóm sắp xếp: " + a.join(" → ") + ". Em xem lại thứ tự nhé.";
  }
  return "";
}
/* Tiến trình bài học theo 4 bước của kế hoạch bài dạy (CV 5512) */
const STAGES = [
  {id:"mo-dau", code:"1", step:"Bước 1", title:"Khởi động", acts:[
    {title:"Chọn trường nào?", tasks:["kd1"]},
    {title:"Ghi bài", tasks:[], concept:"g1", ghi:true}]},
  {id:"phan-1", code:"2.1", step:"Bước 2 · Hình thành kiến thức mới", title:"Vai trò của chất lượng thông tin", acts:[
    {title:"Hoạt động 1: Chọn trường", tasks:["hd1"]},
    {title:"Đọc hiểu: Nguồn tin đáng tin cậy", tasks:["nguon"], concept:"c1"},
    {title:"Câu hỏi SGK trang 10", tasks:["kol"]},
    {title:"Ghi bài: Vai trò của chất lượng thông tin", tasks:[], concept:"g2", ghi:true}]},
  {id:"phan-2", code:"2.2", step:"Bước 2 · Hình thành kiến thức mới", title:"Chất lượng thông tin", acts:[
    {title:"Hoạt động 2: Thông tin hữu ích", tasks:["hd2a","hd2b"]},
    {title:"Đọc hiểu: Bốn tiêu chí", tasks:["tc"], concept:"c2"},
    {title:"Câu hỏi SGK trang 11", tasks:["p11a","p11b"]},
    {title:"Ghi bài: Chất lượng thông tin", tasks:[], concept:"g3", ghi:true}]},
  {id:"luyen-tap", code:"3", step:"Bước 3", title:"Luyện tập", acts:[
    {title:"Số điện thoại nông trại", tasks:["lt1","lt2"]},
    {title:"Ghi bài", tasks:[], concept:"g4", ghi:true}]},
  {id:"van-dung", code:"4", step:"Bước 4", title:"Vận dụng", acts:[
    {title:"Máy tính điện tử đầu tiên", tasks:["vd1","vd2"]},
    {title:"Ghi bài", tasks:[], concept:"g5", ghi:true}]}
];
/* Mục "Ghi bài" (ghi:true) ở cuối mỗi bước không làm đổi số thứ tự các hoạt động */
STAGES.forEach(st => { const real = st.acts.filter(a => !a.ghi);
  st.acts.forEach(a => {
    if (a.ghi) { a.code = "✎"; a.id = "ghi-" + st.id; return; }
    const i = real.indexOf(a);
    a.code = real.length > 1 ? st.code + "." + (i + 1) : st.code; a.id = "hd-" + a.code.replace(/\./g, "-"); }); });
window.LESSON = {STAGES, id: "tin9-bai2", title: "Bài 2. Thông tin trong giải quyết vấn đề", TASKS, CONCEPTS, TASK_IDS, L, grade, countSub, summary, esc, NX_MAU, NX_CHUNG, autoComment,
  notePh: "Ví dụ: Nhóm 2 cho rằng KOL luôn là nguồn tin đáng tin cậy vì…",
  commentPh: "Ví dụ: Nhóm nêu đúng tính mới, tính chính xác; cần bổ sung tính đầy đủ."};
})();
