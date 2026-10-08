/**
 * 📅 FILE: Staff_schedule.js
 * Quản lý lịch trình công việc Nhân viên (Dữ liệu Demo nâng cấp)
 */

// DỮ LIỆU DEMO LỊCH HẸN PHONG PHÚ (HÔM NAY, NGÀY MAI, THÁNG NÀY)
let demoBookings = [
  {
    bookingId: 1001,
    bookingCode: "BK-1001",
    customerName: "Nguyễn Văn An",
    customerPhone: "0905 123 456",
    petName: "Miu Miu",
    roomName: "P-01",
    serviceName: "Tắm Rửa + Sấy Lông + Vệ Sinh Tai",
    totalPrice: 250000,
    bookingTime: "08:30",
    dateType: "TODAY", // Hôm nay
    status: "WAITING",
    note: "Bé sợ tiếng máy sấy to, nhờ shop sấy nhẹ tay.",
  },
  {
    bookingId: 1002,
    bookingCode: "BK-1002",
    customerName: "Trần Thị Bích",
    customerPhone: "0914 888 999",
    petName: "Bim Bim",
    roomName: "P-02",
    serviceName: "Combo Cắt Tỉa Lông Toàn Diện",
    totalPrice: 450000,
    bookingTime: "09:45",
    dateType: "TODAY",
    status: "PROCESSING",
    note: "Cắt kiểu Cún Bông Bear, chừa phần lông đuôi tròn.",
  },
  {
    bookingId: 1003,
    bookingCode: "BK-1003",
    customerName: "Lê Hoàng Nam",
    customerPhone: "0988 555 222",
    petName: "Gấu Corgi",
    roomName: "P-04",
    serviceName: "Khám Sức Khỏe Tổng Quát",
    totalPrice: 380000,
    bookingTime: "11:00",
    dateType: "TODAY",
    status: "WAITING",
    note: "Bé tới lịch tiêm mũi 3 hàng năm.",
  },
  {
    bookingId: 1004,
    bookingCode: "BK-1004",
    customerName: "Phạm Minh Khoa",
    customerPhone: "0935 777 111",
    petName: "Mochi Mèo",
    roomName: "VIP-01",
    serviceName: "Lưu Trú Pet Hotel",
    totalPrice: 600000,
    bookingTime: "14:00",
    dateType: "TODAY",
    status: "COMPLETED",
    note: "Gửi bé 2 ngày, hạt thức ăn đã bỏ sẵn trong balo.",
  },
  {
    bookingId: 1005,
    bookingCode: "BK-1005",
    customerName: "Đặng Thu Thảo",
    customerPhone: "0901 222 333",
    petName: "Lucky Golden",
    roomName: "P-03",
    serviceName: "Tắm Thảo Dược Trị Nấm",
    totalPrice: 320000,
    bookingTime: "08:00",
    dateType: "TOMORROW", // Ca sáng ngày mai -> Xem để biết đi ngủ sớm!
    status: "WAITING",
    note: "Ca sớm ngày mai, chuẩn bị nước ấm.",
  },
  {
    bookingId: 1006,
    bookingCode: "BK-1006",
    customerName: "Vũ Quốc Anh",
    customerPhone: "0977 444 888",
    petName: "Bơ Chinchilla",
    roomName: "P-05",
    serviceName: "Spa Thư Giãn + Cạo Răng",
    totalPrice: 280000,
    bookingTime: "10:30",
    dateType: "TOMORROW",
    status: "WAITING",
    note: "Khách đặt hẹn trước sáng mai.",
  },
  {
    bookingId: 1007,
    bookingCode: "BK-1007",
    customerName: "Ngô Thanh Vân",
    customerPhone: "0966 111 222",
    petName: "Cún Milu",
    roomName: "P-02",
    serviceName: "Cắt Tỉa Lông + Nhuộm Tai",
    totalPrice: 500000,
    bookingTime: "15:00",
    dateType: "MONTH", // Trong tháng
    status: "COMPLETED",
    note: "Hoàn thành tuần trước.",
  },
];

let activeTimeFilter = "TODAY";
let activeStatusFilter = "ALL";
let selectedBookingId = null;

document.addEventListener("DOMContentLoaded", function () {
  renderBookingGrid();

  // 1. Lắng nghe Lọc Thời Gian (Hôm nay / Ngày mai / Tháng này)
  const timeBtns = document.querySelectorAll(".btn-filter-time");
  timeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      timeBtns.forEach((b) => b.classList.remove("active"));
      const target = e.currentTarget;
      target.classList.add("active");
      activeTimeFilter = target.getAttribute("data-time");
      renderBookingGrid();
    });
  });

  // 2. Lắng nghe Lọc Trạng Thái
  const statusBtns = document.querySelectorAll(".btn-filter");
  statusBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      statusBtns.forEach((b) => b.classList.remove("active"));
      const target = e.currentTarget;
      target.classList.add("active");
      activeStatusFilter = target.getAttribute("data-filter");
      renderBookingGrid();
    });
  });

  // 3. Đóng Modal
  document.getElementById("close-modal").addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("task-modal")) closeModal();
  });

  // 4. Toggle Form Yêu Cầu Đổi Phòng Sự Cố
  const btnToggleRoom = document.getElementById("btn-toggle-room-change");
  const roomForm = document.getElementById("room-change-form");
  if (btnToggleRoom) {
    btnToggleRoom.addEventListener("click", () => {
      const isHidden = roomForm.style.display === "none";
      roomForm.style.display = isHidden ? "flex" : "none";
    });
  }

  // 5. Gửi Yêu Cầu Đổi Phòng Sự Cố
  document
    .getElementById("btn-submit-room-change")
    .addEventListener("click", function () {
      const newRoom = document.getElementById("select-new-room").value;
      const reason = document.getElementById("input-room-reason").value.trim();

      if (!reason) {
        showLocalToast(
          "Vui lòng nhập lý do sự cố để Lễ tân / Admin duyệt!",
          "error",
        );
        return;
      }

      showLocalToast(
        `📩 Đã gửi yêu cầu chuyển sang ${newRoom} cho Lễ tân duyệt!`,
        "success",
      );
      roomForm.style.display = "none";
      document.getElementById("input-room-reason").value = "";
    });

  // 6. Nút [BẮT ĐẦU LÀM]
  document
    .getElementById("btn-start-task")
    .addEventListener("click", function () {
      updateStatus(selectedBookingId, "PROCESSING", "Đã bắt đầu ca làm việc!");
    });

  // 7. Nút [HOÀN THÀNH CA]
  document
    .getElementById("btn-complete-task")
    .addEventListener("click", function () {
      updateStatus(
        selectedBookingId,
        "COMPLETED",
        "🎉 Đã hoàn thành xuất sắc ca làm!",
      );
    });

  // 8. Nút [HỦY LỊCH]
  document
    .getElementById("btn-cancel-task")
    .addEventListener("click", function () {
      const reason = prompt("Nhập lý do hủy ca này:");
      if (reason === null) return;
      if (!reason.trim()) {
        showLocalToast("Vui lòng nhập lý do hủy!", "error");
        return;
      }
      updateStatus(selectedBookingId, "CANCELLED", "Đã báo hủy ca!");
    });
});

/**
 * 🔄 Đổ dữ liệu Card lên lưới (Kết hợp Lọc kép)
 */
function renderBookingGrid() {
  const grid = document.getElementById("booking-grid-list");
  if (!grid) return;

  let filteredData = demoBookings.filter((item) => {
    // Lọc theo thời gian
    let matchTime = true;
    if (activeTimeFilter === "TODAY") matchTime = item.dateType === "TODAY";
    else if (activeTimeFilter === "TOMORROW")
      matchTime = item.dateType === "TOMORROW";

    // Lọc theo trạng thái
    let matchStatus = true;
    if (activeStatusFilter !== "ALL")
      matchStatus = item.status === activeStatusFilter;

    return matchTime && matchStatus;
  });

  if (filteredData.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: #a0aec0; padding: 48px 0;">
        <i class="fa-regular fa-calendar-xmark" style="font-size: 38px; margin-bottom: 10px; opacity: 0.5;"></i>
        <p style="font-size: 13.5px;">Không có ca làm việc nào phù hợp với bộ lọc.</p>
      </div>`;
    return;
  }

  let html = "";
  filteredData.forEach((item) => {
    html += `
      <div class="booking-card ${item.status}" onclick="openTaskDetails(${item.bookingId})">
        <div class="card-top">
          <span class="booking-id">#${item.bookingCode}</span>
          <span class="badge ${item.status}">${translateStatus(item.status)}</span>
        </div>
        <div>
          <div class="card-pet">
            <i class="fa-solid fa-paw" style="color:var(--primary-orange)"></i> ${item.petName}
            <span class="card-room-tag">🏠 ${item.roomName}</span>
          </div>
          <div class="card-service">${item.serviceName}</div>
        </div>
        <div class="card-bottom">
          <span><i class="fa-regular fa-user"></i> Khách: <b>${item.customerName}</b></span>
          <span><i class="fa-regular fa-clock"></i> <b>${item.bookingTime}</b></span>
        </div>
      </div>
    `;
  });
  grid.innerHTML = html;
}

/**
 * 👁️ Mở Modal Chi tiết
 */
function openTaskDetails(id) {
  selectedBookingId = id;
  const task = demoBookings.find((item) => item.bookingId === id);
  if (!task) return;

  // Reset ẩn form đổi phòng
  document.getElementById("room-change-form").style.display = "none";

  document.getElementById("md-booking-id").innerText = `#${task.bookingCode}`;
  document.getElementById("md-customer-name").innerText = task.customerName;
  document.getElementById("md-customer-phone").innerText = task.customerPhone;
  document.getElementById("md-pet-info").innerText =
    `${task.petName} (Phòng ${task.roomName})`;
  document.getElementById("md-service-name").innerText = task.serviceName;
  document.getElementById("md-service-price").innerText = formatVND(
    task.totalPrice,
  );
  document.getElementById("md-booking-time").innerText =
    `${task.bookingTime} (${task.dateType === "TODAY" ? "Hôm nay" : "Ngày mai"})`;
  document.getElementById("md-customer-note").innerText = task.note
    ? `"${task.note}"`
    : "Khách không để lại ghi chú.";

  const mdBadge = document.getElementById("md-status-badge");
  mdBadge.innerText = translateStatus(task.status);
  mdBadge.className = `badge ${task.status}`;

  const btnCancel = document.getElementById("btn-cancel-task");
  const btnStart = document.getElementById("btn-start-task");
  const btnComplete = document.getElementById("btn-complete-task");

  if (task.status === "WAITING") {
    btnCancel.disabled = false;
    btnStart.disabled = false;
    btnComplete.disabled = true;
  } else if (task.status === "PROCESSING") {
    btnCancel.disabled = true;
    btnStart.disabled = true;
    btnComplete.disabled = false;
  } else {
    btnCancel.disabled = true;
    btnStart.disabled = true;
    btnComplete.disabled = true;
  }

  document.getElementById("task-modal").classList.add("open");
}

function closeModal() {
  document.getElementById("task-modal").classList.remove("open");
}

function updateStatus(id, newStatus, msg) {
  const task = demoBookings.find((item) => item.bookingId === id);
  if (task) {
    task.status = newStatus;
    showLocalToast(msg, newStatus === "CANCELLED" ? "error" : "success");
    closeModal();
    renderBookingGrid();
  }
}

function translateStatus(status) {
  switch (status) {
    case "WAITING":
      return "Chờ làm ⏱️";
    case "PROCESSING":
      return "Đang làm 🛁";
    case "COMPLETED":
      return "Đã xong ✅";
    case "CANCELLED":
      return "Đã hủy ❌";
    default:
      return status;
  }
}

function formatVND(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function showLocalToast(message, type = "success") {
  if (!document.getElementById("pet-toast-animation-style")) {
    const style = document.createElement("style");
    style.id = "pet-toast-animation-style";
    style.innerHTML = `
      @keyframes slideInRight {
        from { transform: translateX(110%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(110%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  let container = document.getElementById("pet-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "pet-toast-container";
    document.body.appendChild(container);
  }

  container.style.cssText =
    "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;";

  const toast = document.createElement("div");
  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  const icon = type === "success" ? "✓" : "✕";

  toast.style.cssText = `
    pointer-events: auto;
    min-width: 250px;
    padding: 12px 18px;
    background: #ffffff;
    color: #2c3e50;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.12);
    border-left: 5px solid ${bgColor};
    animation: slideInRight 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `;

  toast.innerHTML = `
    <span style="width: 22px; height: 22px; background: ${bgColor}; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0;">${icon}</span>
    <span style="flex: 1; line-height: 1.4;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s forwards ease-in";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
