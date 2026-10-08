document.addEventListener("DOMContentLoaded", () => {
  // 1. MÔ PHỎNG DỮ LIỆU DEMO BẰNG OBJECT JS
  const dashboardData = {
    user: {
      greeting: "Chào buổi sáng! 👋",
      name: "Dương Trung Kiên",
    },
    metrics: {
      todayShifts: 1,
      workedHours: "04:30",
      totalHours: "08:00",
      completedShiftsMonth: 16,
    },
    currentShift: {
      status: "Đang diễn ra",
      title: "Spa - Grooming",
      time: "08:30 AM - 05:30 PM",
      duration: "8 giờ",
      location: "Phòng Grooming 2",
      workedTime: "04:30",
      totalTime: "08:00",
      progressPercentage: 56.25, // 4.5 / 8 * 100
    },
    taskSummary: [
      { statusName: "Đã hoàn thành", count: 8, total: 13, color: "#38a169" },
      { statusName: "Đang thực hiện", count: 3, total: 13, color: "#dd6b20" },
      { statusName: "Chưa thực hiện", count: 2, total: 13, color: "#cbd5e0" },
    ],
    upcomingShifts: [
      {
        title: "Spa - Grooming",
        date: "17/07/2025 (Thứ Năm)",
        time: "08:30 - 17:30",
        status: "Đã xác nhận",
        statusClass: "status-confirmed",
      },
      {
        title: "Hotel - Chăm sóc",
        date: "18/07/2025 (Thứ Sáu)",
        time: "09:00 - 18:00",
        status: "Đã xác nhận",
        statusClass: "status-confirmed",
      },
      {
        title: "Spa - Grooming",
        date: "19/07/2025 (Thứ Bảy)",
        time: "08:30 - 17:30",
        status: "Chờ xác nhận",
        statusClass: "status-pending",
      },
    ],
    notifications: [
      {
        title: "Đào tạo Grooming nâng cao",
        desc: "Tham gia buổi đào tạo kỹ năng Grooming nâng cao.",
        date: "Thứ 6, 18/07/2025",
      },
      {
        title: "Nghỉ lễ 2/9",
        desc: "Thông báo lịch nghỉ lễ Quốc khánh 2/9.",
        date: "Thứ Hai, 21/07/2025",
      },
      {
        title: "Quy định mới về điểm danh",
        desc: "Cập nhật quy định mới về thời gian điểm danh.",
        date: "Thứ Ba, 15/07/2025",
      },
    ],
  };

  // 2. RENDER DỮ LIỆU LÊN GIAO DIỆN

  // Header & Metrics
  document.getElementById("greeting-title").textContent =
    dashboardData.user.greeting;
  document.getElementById("user-name").textContent = dashboardData.user.name;
  document.getElementById("today-shifts").textContent =
    dashboardData.metrics.todayShifts;
  document.getElementById("worked-hours").textContent =
    dashboardData.metrics.workedHours;
  document.getElementById("total-hours").textContent =
    `/ ${dashboardData.metrics.totalHours.split(":")[0]} giờ`;
  document.getElementById("completed-shifts-month").textContent =
    dashboardData.metrics.completedShiftsMonth;

  // Ca làm việc hiện tại
  const shift = dashboardData.currentShift;
  document.getElementById("shift-status-badge").textContent = shift.status;
  document.getElementById("current-shift-name").textContent = shift.title;
  document.getElementById("current-shift-time").textContent = shift.time;
  document.getElementById("current-shift-duration").textContent =
    shift.duration;
  document.getElementById("current-shift-location").textContent =
    shift.location;
  document.getElementById("shift-progress-bar").style.width =
    `${shift.progressPercentage}%`;
  document.getElementById("progress-text-val").textContent =
    `${shift.workedTime} / ${shift.totalTime}`;

  // Tiến độ công việc hôm nay
  const taskContainer = document.getElementById("task-list-container");
  taskContainer.innerHTML = dashboardData.taskSummary
    .map((task) => {
      const percentage = (task.count / task.total) * 100;
      return `
        <div class="task-item">
          <div class="task-info">
            <span>${task.statusName}</span>
            <strong>${task.count}</strong>
          </div>
          <div class="task-progress-bg">
            <div class="task-progress-fill" style="width: ${percentage}%; background-color: ${task.color};"></div>
          </div>
        </div>
      `;
    })
    .join("");

  // Lịch ca sắp tới
  const upcomingContainer = document.getElementById(
    "upcoming-shifts-container",
  );
  upcomingContainer.innerHTML = dashboardData.upcomingShifts
    .map(
      (item) => `
      <div class="upcoming-item">
        <div>
          <div class="upcoming-title">${item.title}</div>
          <div class="upcoming-sub">${item.date}</div>
        </div>
        <div class="upcoming-time">${item.time}</div>
        <span class="status-badge ${item.statusClass}">${item.status}</span>
      </div>
    `,
    )
    .join("");

  // Thông báo nội bộ
  const notifContainer = document.getElementById("notif-container");
  notifContainer.innerHTML = dashboardData.notifications
    .map(
      (notif) => `
      <div class="notif-item">
        <div class="notif-icon">
          <i class="fa-regular fa-calendar-check"></i>
        </div>
        <div class="notif-content">
          <h4>${notif.title}</h4>
          <p>${notif.desc}</p>
          <span class="notif-date">${notif.date}</span>
        </div>
      </div>
    `,
    )
    .join("");
});
