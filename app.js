// Lưu dữ liệu vào LocalStorage: nhập hàng và bán hàng
let dsNhap = JSON.parse(localStorage.getItem("dsNhap")) || [];
let dsBan = JSON.parse(localStorage.getItem("dsBan")) || [];

// Lưu dữ liệu xuống LocalStorage
function luuDuLieu() {
  localStorage.setItem("dsNhap", JSON.stringify(dsNhap));
  localStorage.setItem("dsBan", JSON.stringify(dsBan));
}

// Cập nhật bảng hiển thị đơn nhập
function capNhatBangNhap() {
  const tbody = document.querySelector("#tableNhap tbody");
  tbody.innerHTML = "";
  dsNhap.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.ngay}</td>
      <td>${item.maSP}</td>
      <td>${item.tenSP}</td>
      <td>${item.soLuong}</td>
      <td>${Number(item.giaNhap).toLocaleString()} VNĐ</td>
    `;
    tbody.appendChild(row);
  });
}

// Cập nhật bảng hiển thị đơn bán/tặng
function capNhatBangBan() {
  const tbody = document.querySelector("#tableBan tbody");
  tbody.innerHTML = "";
  dsBan.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.ngay}</td>
      <td>${item.maSP}</td>
      <td>${item.tenSP}</td>
      <td>${item.soLuong}</td>
      <td>${item.giaBan ? Number(item.giaBan).toLocaleString() + " VNĐ" : "Tặng"}</td>
      <td>${item.khachHang || "-"}</td>
    `;
    tbody.appendChild(row);
  });
}

// Hàm cập nhật cả hai bảng
function capNhatBang() {
  capNhatBangNhap();
  capNhatBangBan();
}

// Xử lý form nhập hàng
document.getElementById("formNhap").addEventListener("submit", function(e) {
  e.preventDefault();
  const ngay = document.getElementById("nhapNgay").value;
  const maSP = document.getElementById("nhapMaSP").value.trim();
  const tenSP = document.getElementById("nhapTenSP").value.trim();
  const soLuong = parseInt(document.getElementById("nhapSoLuong").value);
  const giaNhap = parseFloat(document.getElementById("nhapGia").value);
  
  dsNhap.push({ ngay, maSP, tenSP, soLuong, giaNhap });
  luuDuLieu();
  capNhatBang();
  this.reset();
});

// Xử lý form bán/tặng hàng
document.getElementById("formBan").addEventListener("submit", function(e) {
  e.preventDefault();
  const ngay = document.getElementById("banNgay").value;
  const maSP = document.getElementById("banMaSP").value.trim();
  const tenSP = document.getElementById("banTenSP").value.trim();
  const soLuong = parseInt(document.getElementById("banSoLuong").value);
  // Giá bán có thể rỗng nếu là tặng hàng (0 hoặc undefined)
  const giaBanInput = document.getElementById("banGia").value;
  const giaBan = giaBanInput ? parseFloat(giaBanInput) : 0;
  const khachHang = document.getElementById("banKhachHang").value.trim();
  
  dsBan.push({ ngay, maSP, tenSP, soLuong, giaBan, khachHang });
  luuDuLieu();
  capNhatBang();
  this.reset();
});

// Hàm báo cáo thống kê theo tháng
function baoCaoThang(thang) {
  // Lọc dữ liệu nhập và bán theo tháng
  const dsNhapThang = dsNhap.filter(item => item.ngay.startsWith(thang));
  const dsBanThang = dsBan.filter(item => item.ngay.startsWith(thang));
  
  // Tổng số tiền nhập hàng
  let tongTienNhap = dsNhapThang.reduce((sum, item) => sum + item.soLuong * item.giaNhap, 0);
  
  // Tổng doanh thu bán (các đơn có giá bán > 0)
  let tongDoanhThu = dsBanThang.reduce((sum, item) => sum + (item.giaBan * item.soLuong), 0);
  
  // Lợi nhuận tạm tính: doanh thu - chi phí hàng bán
  // Giả sử chi phí của các sản phẩm bán ra được tính theo tỷ lệ giá nhập trung bình
  // (Trường hợp thực tế có thể phức tạp hơn)
  let tongSoLuongBan = dsBanThang.reduce((sum, item) => sum + item.soLuong, 0);
  let tongSoLuongNhap = dsNhapThang.reduce((sum, item) => sum + item.soLuong, 0);
  let tyLeNhap = tongSoLuongNhap ? (tongTienNhap / tongSoLuongNhap) : 0;
  let loiNhuan = tongDoanhThu - (tongSoLuongBan * tyLeNhap);
  
  // Tính tồn kho: Tổng số lượng nhập - bán
  let tonKho = dsNhapThang.reduce((sum, item) => sum + item.soLuong, 0) - dsBanThang.reduce((sum, item) => sum + item.soLuong, 0);
  
  return {
    soDonNhap: dsNhapThang.length,
    soDonBan: dsBanThang.length,
    tongTienNhap,
    tongDoanhThu,
    loiNhuan,
    tonKho
  };
}

// Xử lý form báo cáo
document.getElementById("formBaoCao").addEventListener("submit", function(e) {
  e.preventDefault();
  const thang = document.getElementById("baoCaoThang").value; // định dạng YYYY-MM
  const ketQua = baoCaoThang(thang);
  const divKetQua = document.getElementById("ketQuaBaoCao");
  divKetQua.innerHTML = `
    <h3>Báo cáo tháng ${thang}</h3>
    <p>Số đơn nhập: ${ketQua.soDonNhap}</p>
    <p>Tổng tiền nhập: ${Number(ketQua.tongTienNhap).toLocaleString()} VNĐ</p>
    <p>Số đơn bán/tặng: ${ketQua.soDonBan}</p>
    <p>Tổng doanh thu bán: ${Number(ketQua.tongDoanhThu).toLocaleString()} VNĐ</p>
    <p>Lợi nhuận tạm tính: ${Number(ketQua.loiNhuan).toLocaleString()} VNĐ</p>
    <p>Số lượng tồn kho: ${ketQua.tonKho}</p>
  `;
});

// Khi tải trang, cập nhật bảng
capNhatBang();
