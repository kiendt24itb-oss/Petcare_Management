// Danh sách đơn hàng vận hành
let bookings = [
  {
    id: "BK-8091",
    owner: "Nguyễn Văn An",
    pet: "Kiki (Poodle)",
    service: "Tắm & Cắt tỉa",
    room: "Spa - Bàn 02",
    time: "09:30 - 10:30",
    staff: "BS. Hoàng Nam",
    status: "Đang thực hiện",
  },
  {
    id: "BK-8092",
    owner: "Trần Thị Mai",
    pet: "Bơ (Mèo Cần Thơ)",
    service: "Khám tổng quát",
    room: "Health - Phòng 01",
    time: "10:00 - 10:30",
    staff: "BS. Thu Trang",
    status: "Đang chờ",
  },
  {
    id: "BK-8093",
    owner: "Lê Minh Cường",
    pet: "Max (Husky)",
    service: "Lưu trú Hotel (2 ngày)",
    room: "Hotel - VIP 201",
    time: "08:00 - Cả ngày",
    staff: "NV. Khánh Linh",
    status: "Đang thực hiện",
  },
  {
    id: "BK-8094",
    owner: "Phạm Hồng Ngọc",
    pet: "Miu (Mèo Anh)",
    service: "Tiêm Vắc-xin 7 bệnh",
    room: "Health - Phòng 02",
    time: "08:30 - 09:00",
    staff: "BS. Thu Trang",
    status: "Hoàn thành",
  },
  {
    id: "BK-8095",
    owner: "Đặng Hoàng Anh",
    pet: "Mochi (Corgi)",
    service: "Vệ sinh tai & Cắt móng",
    room: "Spa - Bàn 01",
    time: "11:00 - 11:30",
    staff: "NV. Minh Châu",
    status: "Đang chờ",
  },
];

// Nhật ký lịch sử biến động đã lên màu rực rỡ nổi bật từ khóa chính
let logs = [
  {
    time: "09:10:05",
    type: "booking",
    text: "Đơn <span class='hl-code'>BK-8094</span> vừa cập nhật trạng thái <span class='hl-status'>Hoàn thành</span> dịch vụ <span class='hl-action'>Tiêm Vắc-xin</span>.",
  },
  {
    time: "08:45:12",
    type: "staff",
    text: "Bác sĩ <span class='hl-staff'>BS. Thu Trang</span> đã tiếp nhận ca khám tại <span class='hl-action'>Health Phòng 01</span>.",
  },
  {
    time: "08:15:30",
    type: "customer",
    text: "Chủ nuôi <span class='hl-customer'>Nguyễn Văn An</span> đã <span class='hl-action'>Check-in</span> thành công cho bé <span class='hl-pet'>Kiki (Poodle)</span>.",
  },
  {
    time: "07:00:00",
    type: "system",
    text: "Chào ca làm việc mới! Chúc team PetCare một ngày vận hành trôi chảy 🚀.",
  },
];

let selectedStatus = "all";

// ĐỒNG HỒ TỰ ĐỘNG REALTIME
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const clockEl = document.getElementById("liveClock");
  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  const options = {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const dateEl = document.getElementById("liveDate");
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("vi-VN", options);
  }
}
setInterval(updateClock, 1000);

// TRẠNG THÁI BADGE
function getStatusBadge(status) {
  switch (status) {
    case "Đang chờ":
      return `<span class="badge-status waiting"><i class="fa-solid fa-clock"></i> Đang chờ</span>`;
    case "Đang thực hiện":
      return `<span class="badge-status processing"><i class="fa-solid fa-arrows-spin fa-spin"></i> Đang làm</span>`;
    case "Hoàn thành":
      return `<span class="badge-status completed"><i class="fa-solid fa-check"></i> Hoàn thành</span>`;
    default:
      return `<span class="badge-status cancelled"><i class="fa-solid fa-ban"></i> Đã hủy</span>`;
  }
}

// RENDER BẢNG VẬN HÀNH
function renderTable() {
  const tbody = document.getElementById("opsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = bookings.filter((b) => {
    return selectedStatus === "all" || b.status === selectedStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Không có ca vận hành nào</td></tr>`;
    return;
  }

  filtered.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="code-tag">${b.id}</span></td>
      <td>
        <div class="owner-name">${b.owner}</div>
        <div class="pet-tag"><i class="fa-solid fa-paw"></i> ${b.pet}</div>
      </td>
      <td>
        <div class="service-name">${b.service}</div>
        <div class="room-tag"><i class="fa-solid fa-location-dot"></i> ${b.room}</div>
      </td>
      <td><span class="time-text"><i class="fa-regular fa-clock"></i> ${b.time}</span></td>
      <td><span class="doctor-name"><i class="fa-solid fa-user-doctor"></i> ${b.staff}</span></td>
      <td>${getStatusBadge(b.status)}</td>
      <td>
        <div class="action-btns">
          <!-- CHỈ NÚT XEM/SỬA DUY NHẤT VỚI ICON CHIẾC BÚT VIẾT GIẤY -->
          <button class="btn-icon btn-edit" title="Xem chi tiết & Cập nhật" onclick="openDetailModal('${b.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// RENDER TIMELINE LỊCH SỬ BIẾN ĐỘNG
function renderTimeline() {
  const container = document.getElementById("timelineList");
  if (!container) return;
  container.innerHTML = "";

  logs.forEach((log) => {
    let iconHTML = `<i class="fa-solid fa-info"></i>`;
    if (log.type === "system")
      iconHTML = `<i class="fa-solid fa-bullhorn"></i>`;
    if (log.type === "customer")
      iconHTML = `<i class="fa-solid fa-user-check"></i>`;
    if (log.type === "staff")
      iconHTML = `<i class="fa-solid fa-user-doctor"></i>`;
    if (log.type === "booking")
      iconHTML = `<i class="fa-solid fa-receipt"></i>`;

    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `
      <div class="timeline-icon ${log.type}">${iconHTML}</div>
      <div class="timeline-content">
        <div class="timeline-time"><i class="fa-regular fa-clock"></i> ${log.time}</div>
        <div class="timeline-text">${log.text}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

// HÀM MỞ MODAL XEM CHI TIẾT & CẬP NHẬT TRẠNG THÁI (Chờ thiết kế modal sau)
function openDetailModal(bookingId) {
  const booking = bookings.find((b) => b.id === bookingId);
  if (booking) {
    console.log("Mở modal chi tiết cho đơn:", booking);
    alert(
      `[Modal Chi Tiết]\n\nĐang xem đơn: ${booking.id}\nChủ nuôi: ${booking.owner}\nThú cưng: ${booking.pet}\nDịch vụ: ${booking.service}\nTrạng thái hiện tại: ${booking.status}\n\n(Chức năng đổi trạng thái & xem chi tiết sẽ được mở trong Modal sắp tới)`,
    );
  }
}

// EVENT LISTENERS & INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  renderTable();
  renderTimeline();

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      selectedStatus = e.target.value;
      renderTable();
    });
  }
});
