// 1. KHO DỮ LIỆU MẪU LỊCH HẸN
const pendingAppointments = [
  {
    id: "DH9001",
    customer: "Chị Hoa",
    phone: "0901***789",
    pet: "Bé Kiki (Poodle)",
    time: "10:30 - Hôm nay",
    service: "Tắm Spa & Cắt tỉa",
    grpType: "spa",
  },
  {
    id: "DH9002",
    customer: "Anh Cường",
    phone: "0982***123",
    pet: "Mèo Miu (Anh lông ngắn)",
    time: "11:00 - Hôm nay",
    service: "Tẩy giun & Khám bệnh",
    grpType: "health",
  },
  {
    id: "DH9003",
    customer: "Cô Hương",
    phone: "0913***555",
    pet: "Bé Lu (Corgi)",
    time: "14:00 - Hôm nay",
    service: "Pet Hotel (2 ngày)",
    grpType: "hotel",
  },
  {
    id: "DH9004",
    customer: "Anh Minh",
    phone: "0974***999",
    pet: "Bé Búp (Phốc sóc)",
    time: "15:30 - Hôm nay",
    service: "Nhuộm lông Spa",
    grpType: "spa",
  },
  {
    id: "DH9005",
    customer: "Chị Thảo",
    phone: "0935***888",
    pet: "Bé Milu (Golden)",
    time: "09:00 - Ngày mai",
    service: "Tắm Vệ sinh toàn thân",
    grpType: "spa",
  },
];

// Hàm trả về Tag Dịch vụ đồng bộ màu RoomManagement
function getServiceBadge(grpType, serviceName) {
  if (grpType === "hotel")
    return `<span class="tag-grp hotel"><i class="fa-solid fa-hotel"></i> ${serviceName}</span>`;
  if (grpType === "spa")
    return `<span class="tag-grp spa"><i class="fa-solid fa-spa"></i> ${serviceName}</span>`;
  return `<span class="tag-grp health"><i class="fa-solid fa-heart-pulse"></i> ${serviceName}</span>`;
}

// 2. KHỞI TẠO BIỂU ĐỒ DOANH THU ĐỒNG BỘ TÔNG CAM (#ff7a45)
function initRevenueChart() {
  const ctx = document.getElementById("revenueChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
      ],
      datasets: [
        {
          label: "Doanh thu (Triệu VNĐ)",
          data: [85, 92, 110, 105, 118, 128.5],
          borderColor: "#ff7a45", // Màu cam thương hiệu
          backgroundColor: "rgba(255, 122, 69, 0.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#ea580c",
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: "#f8fafc" },
          ticks: {
            callback: (val) => val + " triệu",
            font: { size: 11 },
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}

// 3. RENDER DANH SÁCH BẢNG LỊCH HẸN
function renderPendingList() {
  const tbody = document.getElementById("pending-list");
  tbody.innerHTML = "";

  if (pendingAppointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">Không có yêu cầu chờ duyệt nào</td></tr>`;
    return;
  }

  pendingAppointments.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <!-- Mã đơn -->
      <td style="font-weight: 700; color: #ea580c;">${item.id}</td>

      <!-- Tên Khách hàng -->
      <td>
        <div style="font-weight: 600; color: #1e293b;">${item.customer}</div>
        <div style="font-size: 10px; color: #94a3b8;">${item.phone}</div>
      </td>

      <!-- Tên Thú cưng -->
      <td>
        <div style="font-weight: 600; color: #475569;">
          <i class="fa-solid fa-paw mr-1" style="font-size: 10px; color: #ff7a45;"></i>${item.pet}
        </div>
      </td>

      <!-- Thời gian -->
      <td style="color: #64748b; font-size: 11px;">
        <i class="fa-regular fa-clock mr-1" style="font-size: 10px;"></i>${item.time}
      </td>

      <!-- Dịch vụ đăng ký -->
      <td>
        ${getServiceBadge(item.grpType, item.service)}
      </td>

      <!-- 3 NÚT HÀNH ĐỘNG ĐỒNG BỘ STYLE BUTTON ROOMMANAGEMENT -->
      <td>
        <div style="display: flex; gap: 4px; justify-content: center;">
          <button 
            onclick="handleAction('XEM', '${item.id}')"
            class="btn-icon btn-view"
            title="Xem chi tiết">
            <i class="fa-regular fa-eye"></i>
          </button>

          <button 
            onclick="handleAction('DUYET', '${item.id}', ${index})"
            class="btn-icon btn-approve"
            title="Duyệt lịch hẹn">
            <i class="fa-solid fa-check"></i>
          </button>

          <button 
            onclick="handleAction('TU_CHOI', '${item.id}', ${index})"
            class="btn-icon btn-reject"
            title="Từ chối lịch hẹn">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// 4. SỰ KIỆN NÚT THAO TÁC
function handleAction(type, code, index) {
  if (type === "XEM") {
    alert(`[XEM CHI TIẾT] Đã mở thông tin đơn hẹn mã: ${code}`);
  } else if (type === "DUYET") {
    if (confirm(`Xác nhận DUYỆT lịch hẹn ${code}?`)) {
      pendingAppointments.splice(index, 1);
      updatePendingUI();
    }
  } else if (type === "TU_CHOI") {
    if (confirm(`Bạn có chắc muốn TỪ CHỐI lịch hẹn ${code}?`)) {
      pendingAppointments.splice(index, 1);
      updatePendingUI();
    }
  }
}

function updatePendingUI() {
  document.getElementById("pending-count").innerText =
    `${pendingAppointments.length} Yêu cầu mới`;
  renderPendingList();
}

// KHỞI CHẠY TRANG
document.addEventListener("DOMContentLoaded", () => {
  initRevenueChart();
  renderPendingList();
});
