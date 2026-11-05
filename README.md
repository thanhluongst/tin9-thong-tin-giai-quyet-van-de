# Tin học 9 – Bài 2. Thông tin trong giải quyết vấn đề

Trang học tương tác theo **nghiên cứu bài học**. Học sinh trả lời từng câu hỏi trong SGK (Kết nối tri thức với cuộc sống). Giáo viên theo dõi câu trả lời của các nhóm theo thời gian thực rồi chốt kiến thức cho cả lớp.

- **Trang học sinh:** `index.html`. Học sinh không cần tài khoản.
- **Trang giáo viên:** `giaovien.html`. Cần mã giáo viên, chỉ dùng khi đã nối Google Sheets.
- **Nơi lưu bài:**
  - mặc định: trình duyệt của máy đang dùng (Cách 1);
  - hoặc Google Sheet của giáo viên qua Google Apps Script, miễn phí (Cách 2).

**Trang trực tuyến (sau khi đưa lên GitHub Pages):** https://thanhluongst.github.io/tin9-thong-tin-giai-quyet-van-de/

Trang dùng chung Google Sheet và Apps Script với Bài 1 (`config.js` đã có sẵn link). Bài làm của mỗi bài nằm ở trang tính riêng (`tin7-bai1`, `tin7-bai2`, `tin9-bai1`, `tin9-bai2`,…), nên **không cần làm lại Bước 1**.

```
Học sinh (index.html) ──gửi bài──▶ Apps Script ──▶ Google Sheet, trang tính "<mã bài>" (ví dụ tin7-bai1)
Giáo viên (giaovien.html) ◀──xem bài── Apps Script
Giáo viên ──chốt──▶ Apps Script ──▶ trang học sinh tự hiện phần chốt (10–15 giây)
```

## Cấu trúc thư mục

| Tệp | Nội dung |
| --- | --- |
| `index.html` | Trang học sinh |
| `giaovien.html` | Trang giáo viên: mã QR, theo dõi lớp, chốt kiến thức, tải CSV |
| `config.js` | **Chỉ sửa tệp này:** dán link Apps Script |
| `assets/content.js` | Câu hỏi SGK, đáp án chốt, cách chấm, Bảng 2.1 |
| `assets/hs.js`, `assets/gv.js`, `assets/api.js`, `assets/style.css` | Mã giao diện |
| `apps-script/Code.gs` | Mã dán vào Google Apps Script |

## Cách 1. Dùng ngay, không cần Google Sheets (đang dùng)

Khi `API_URL` trong `config.js` để trống, trang chạy **chế độ một máy nhiều nhóm**. Không cần mạng sau khi trang đã tải, cũng không cần tài khoản.

1. Mở trang học trên **máy trình chiếu**, nhập mã giáo viên `tin7` và bấm **Vào chế độ GV**.
2. Khi một nhóm báo cáo, bấm tên nhóm ở đầu trang (Nhóm 1, Nhóm 2, …), ghi câu trả lời của nhóm rồi bấm **Nộp**. Bấm **+ Thêm nhóm** nếu lớp có hơn 8 nhóm (tối đa 20).
3. Mục **Theo dõi lớp** so sánh câu trả lời của các nhóm theo từng câu. Mỗi nhóm có ô nhận xét riêng của giáo viên.
4. Bấm **GV nhận xét & chốt** ở từng câu, hoặc **Chốt tất cả**.
5. Sang lớp khác: **Làm lại từ đầu → Xoá bài của tất cả nhóm**.

**Lưu ý:**
- Bài làm chỉ lưu trong trình duyệt của máy đó. Hãy dùng cùng một máy và cùng một trình duyệt suốt buổi.
- Không mở bằng cửa sổ ẩn danh.
- Không xoá dữ liệu trình duyệt trước khi xong buổi suy ngẫm.

Học sinh vẫn có thể mở trang trên máy riêng để làm bài, nhưng bài chỉ lưu trên máy của các em. Phần chốt chỉ hiện khi giáo viên nhập mã trên chính máy đó.

## Cách 2. Học sinh gửi bài về cho giáo viên (cần Google Sheets)

Làm theo Bước 1 bên dưới. Khi `config.js` đã có `API_URL`, trang học sinh hiện thêm ô **Mã buổi học**, và trang giáo viên dùng để mở buổi học, chiếu mã QR, theo dõi và chốt cho cả lớp.

## Bước 1. Tạo Google Sheet và Apps Script (khoảng 10 phút)

1. Vào [sheets.new](https://sheets.new) để tạo bảng tính mới, đặt tên, ví dụ "Tin 7 – Bài làm".
2. Chọn **Tiện ích mở rộng → Apps Script**.
3. Xoá mã có sẵn, dán toàn bộ nội dung `apps-script/Code.gs`, bấm **Lưu**.
4. Bấm biểu tượng **bánh răng (Cài đặt dự án)** → kéo xuống **Thuộc tính tập lệnh** → **Thêm thuộc tính tập lệnh**:
   - Thuộc tính: `MA_GIAO_VIEN`
   - Giá trị: mã bí mật của thầy/cô, ví dụ `Tin7@2026`. **Không** dùng mật khẩu Gmail.
5. Quay lại trình soạn thảo, chọn hàm `khoiTao`, bấm **Chạy**. Lần đầu Google sẽ hỏi quyền truy cập bảng tính: chọn tài khoản của thầy/cô → **Nâng cao** → **Đi tới dự án** → **Cho phép**. Bảng tính sẽ có hai trang `Chot` và `NhanXet`. Trang bài làm của mỗi bài (đặt tên theo mã bài, ví dụ `tin7-bai1`) tự tạo khi có bài nộp đầu tiên.
6. Bấm **Triển khai → Tùy chọn triển khai mới**:
   - Bánh răng cạnh "Chọn loại" → **Ứng dụng web**
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   - Bấm **Triển khai**, sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).
7. Mở `config.js` và dán URL vào:
   ```js
   window.APP_CONFIG = {
     API_URL: "https://script.google.com/macros/s/AKfy.../exec"
   };
   ```

> Nhận xét của giáo viên được lưu ở trang tính **NhanXet** (tự tạo khi gửi nhận xét đầu tiên).
>
> Khi sửa `Code.gs` sau này, phải vào **Triển khai → Quản lý các lần triển khai → Chỉnh sửa → Phiên bản: Phiên bản mới** thì thay đổi mới có hiệu lực. URL giữ nguyên.

### Nâng cấp Apps Script (mỗi bài một trang tính)

Từ tháng 11/2026, `Code.gs` ghi bài làm của mỗi bài vào **một trang tính riêng, đặt tên theo mã bài** (`tin7-bai1`, `tin7-bai2`, …) thay cho một trang `BaiLam` chung. Nhờ vậy, khi dùng cho cả trường, Google Sheet vẫn gọn và trang giáo viên tải nhanh. Nếu thầy/cô đã cài bản cũ:

1. Mở Apps Script của Google Sheet, xoá mã cũ, dán toàn bộ `apps-script/Code.gs` mới, bấm **Lưu**.
2. **Triển khai → Quản lý các lần triển khai →** biểu tượng bút chì → **Phiên bản: Phiên bản mới → Triển khai**. URL `/exec` giữ nguyên, không phải sửa `config.js`.
3. Chọn hàm `chuyenDuLieuCu`, bấm **Chạy** (chỉ một lần). Hàm chuyển bài cũ sang trang tính của từng bài và đổi tên trang cũ thành `BaiLam (đã chuyển)`. Kiểm tra xong thì thầy/cô tự xoá trang đó. Chạy lại cũng không bị trùng dòng.

Trước khi chạy bước 3, trang giáo viên vẫn đọc được bài cũ.

**Mỗi năm học nên dùng một tệp Google Sheet mới.** Tạo tệp, dán `Code.gs`, triển khai, rồi dán URL mới vào `config.js` của các bài. Tệp năm cũ giữ lại để suy ngẫm.

## Bước 2. Đưa lên GitHub Pages

1. Tạo kho (repository) mới trên GitHub, ví dụ `tin9-thong-tin-giai-quyet-van-de`, để chế độ **Public** (GitHub Pages miễn phí cần kho công khai).
2. Đẩy mã lên. Nếu máy đã cài Git:
   ```bash
   git add .
   git commit -m "Trang học Tin 9 – Bài 2"
   git branch -M main
   git remote add origin https://github.com/<tên-tài-khoản>/tin7-phan-mem-may-tinh.git
   git push -u origin main
   ```
   Hoặc trên trang GitHub, chọn **Add file → Upload files** và kéo cả thư mục vào.
3. Vào **Settings → Pages**. Ở mục Source chọn **Deploy from a branch**, chọn nhánh **main**, thư mục **/(root)**, rồi bấm **Save**.
4. Sau 1–2 phút trang có địa chỉ dạng:
   - Học sinh: `https://<tên-tài-khoản>.github.io/tin7-phan-mem-may-tinh/`
   - Giáo viên: `https://<tên-tài-khoản>.github.io/tin7-phan-mem-may-tinh/giaovien.html`

## Tiến trình bài học và màu sắc

Bài học chia theo 4 bước của kế hoạch bài dạy. Mỗi hoạt động có mã số, hiện trên đầu hoạt động và trong thanh **Tiến trình bài học**:

| Bước | Mã | Hoạt động |
| --- | --- | --- |
| 1. Khởi động | 1 | Máy tính cần gì để hoạt động? |
| 2. Hình thành kiến thức mới | 2.1.1 – 2.1.3 | Hệ điều hành: Hoạt động 1 (Điều hành), Đọc hiểu chức năng, Câu hỏi trang 11 |
| | 2.2.1 – 2.2.4 | Phần mềm ứng dụng: Hoạt động 2 (Loại tệp và phần mở rộng), Đọc hiểu, Câu hỏi trang 12, Thảo luận phân biệt HĐH và PMƯD (Bảng 2.1) |
| 3. Luyện tập | 3 | Bài tập SGK trang 12 |
| 4. Vận dụng | 4 | Cài đặt Scratch |

**Thanh Tiến trình bài học:**
- Trên máy tính, thanh nằm bên trái màn hình. Trên điện thoại, thanh nằm ở đầu trang, bấm vào để mở.
- Thanh cho biết hoạt động đang xem, số câu đã nộp của từng hoạt động và hoạt động nào đã được chốt.
- Ở trang giáo viên, con số là số lượt nộp của cả lớp.

**Chỉ hiện phần đang học:**
- Bấm một mục trong thanh Tiến trình (hoặc trên thanh mục lục đầu trang) thì cột bên phải **chỉ hiện phần đó**:
  - bấm tên bước, ví dụ "2.1 Hệ điều hành", thì hiện cả bước;
  - bấm một hoạt động, ví dụ "2.1.2", thì chỉ hiện hoạt động đó.
- Cuối phần đang xem có nút **← Trước / Tiếp →** để chuyển phần.
- Nút **Hiện toàn bộ bài** đưa trang về hiển thị toàn bộ.
- Trang giáo viên có thêm mục *Mã QR* và *Tiến độ các nhóm* trong thanh Tiến trình. Bấm một ô trong bảng màu thì trang tự mở đúng hoạt động chứa câu đó.
- Trang nhớ phần đang xem khi tải lại.

**Màu câu trả lời** (dùng chung cho học sinh và giáo viên):

| Màu | Nghĩa |
| --- | --- |
| Xám | Chưa làm |
| Vàng | Đang làm, chưa nộp |
| Xanh dương | Đã nộp, chờ chốt (câu tự luận) |
| Xanh lá | Đúng (sau khi giáo viên chốt các câu chấm tự động) |
| Đỏ | Cần sửa |

Trang giáo viên có thêm **bảng màu tiến độ**: mỗi hàng là một nhóm, mỗi ô là một câu, các ô xếp theo tiến trình. Kí hiệu trong ô:
- ✓ đúng;
- ✗ sai;
- ● đã nộp;
- … đang làm;
- ★ đã khen.

Bấm vào một ô để mở bài của nhóm đó ở câu tương ứng.

## Quy trình trên lớp

1. **Giáo viên** mở `giaovien.html`, nhập mã giáo viên và tạo **mã buổi học** riêng cho từng lớp, từng tiết (ví dụ `7A2-T1`), rồi bấm **Mở buổi học**.
2. Chiếu **mã QR** lên màn hình. **Học sinh** quét mã: trang tự điền sẵn mã buổi học. Các em nhập **tên nhóm** và bấm **Vào buổi học**.
3. Học sinh làm bài, bấm **Nộp câu trả lời**. Bài tự gửi lên Google Sheet. Khi mất mạng, bài vẫn lưu trên máy và tự gửi lại.
4. Trang giáo viên hiển thị **toàn bộ nội dung bài học** (hình, câu hỏi SGK). Ngay dưới mỗi câu có:
   - bài của từng nhóm, kèm nhãn Đã nộp / Đúng / Chưa đúng;
   - nút xem **Đáp án / phần chốt**;
   - ô **Nhận xét gửi cho nhóm**: gõ nhận xét rồi bấm **Gửi nhận xét** (hoặc Ctrl + Enter). Nhóm đó thấy nhận xét ngay dưới câu trả lời của mình sau 10–15 giây.
   - **Gợi ý nhận xét** soạn sẵn cho từng câu, đổi theo kết quả của nhóm:
     - xanh: nhóm làm đúng;
     - cam: nhóm cần sửa;
     - đỏ: nhận xét tự sinh nêu đúng chỗ nhóm làm sai (xếp nhóm, ghép nối);
     - xám: lời nhận xét chung.

     Bấm gợi ý để chèn vào ô, sửa nếu cần rồi bấm **Gửi nhận xét**. Nhận xét mẫu nằm trong `assets/content.js` (mục `NX_MAU`), thầy/cô sửa được.
   - Với câu chấm tự động (trắc nghiệm, xếp nhóm, ghép nối): nút **Gửi nhận xét gợi ý cho N nhóm chưa nhận xét** gửi một lần cho cả lớp. Nhóm làm đúng nhận lời khen, nhóm làm sai nhận nhận xét chỉ rõ chỗ sai.
   - nút **Khen** (biểu tượng ngón tay cái): bấm để khen câu trả lời tốt, bấm lần nữa để bỏ. Nút có viền xanh khi câu trắc nghiệm/xếp nhóm của nhóm đó đúng. Học sinh thấy dòng "Thầy cô khen câu trả lời của em!" dưới câu đó.

   Ô **Xem bài của** trên thanh mục lục dùng để lọc, chỉ hiện bài của một nhóm. Bảng **Tiến độ các nhóm** cho biết mỗi nhóm đã nộp bao nhiêu câu và đã được nhận xét bao nhiêu câu.
5. Sau khi các nhóm trình bày, giáo viên bấm **Chốt câu này cho cả lớp**. Trang học sinh tự hiện phần chốt sau 10–15 giây.
6. **Suy ngẫm sau giờ dạy:**
   - mở Google Sheet, chọn trang tính mang mã bài (ví dụ `tin7-bai1`), lọc theo cột **Buổi**: mỗi nhóm một dòng, mỗi câu một cột (bài nháp ghi "(nháp)", câu trắc nghiệm có ✓/✗);
   - hoặc bấm **Tải bảng tổng hợp (CSV)** trên trang giáo viên.

**Phòng học không có mạng:** học sinh không bấm "Vào buổi học". Trang chạy chế độ **một máy nhiều nhóm**. Giáo viên nhập mã `tin7` trên máy trình chiếu, chọn từng nhóm để ghi câu trả lời khi nhóm báo cáo, rồi chốt ngay trên máy đó.

## Quản lý học sinh và giáo viên

- **Học sinh** không có tài khoản. Các em được nhận diện bằng *mã buổi học + tên nhóm + mã máy* (tự sinh, lưu trong trình duyệt). Chỉ nên nhập tên nhóm hoặc tên ngắn, không nhập thông tin cá nhân.
- **Giáo viên** dùng chung một mã giáo viên lưu trong Thuộc tính tập lệnh. Muốn thêm giáo viên dự giờ thì đưa họ mã, hoặc chia sẻ Google Sheet ở quyền xem. Đổi mã chỉ cần sửa thuộc tính `MA_GIAO_VIEN`, không phải sửa GitHub.
- **Xoá dữ liệu cũ:** xoá các dòng trong trang tính của bài đó, hoặc sang năm học mới thì dùng tệp Google Sheet mới.
- **Lưu ý:**
  - Link GitHub Pages công khai, ai có link và mã buổi học đều gửi bài được. Mỗi tiết hãy dùng một mã buổi học mới.
  - Mã `tin7` của chế độ một máy nằm trong mã nguồn công khai, chỉ để học sinh không bấm nhầm.

## Thêm bài học khác

Sao chép thư mục, sửa `assets/content.js` (câu hỏi, đáp án, `id` của bài) và phần nội dung trong `index.html`. Dùng chung Google Sheet và Apps Script: mỗi bài tự có trang tính riêng theo `id`. Xem quy trình đầy đủ ở kho [tin-thcs](https://github.com/thanhluongst/tin-thcs).
