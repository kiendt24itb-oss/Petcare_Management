document.addEventListener("DOMContentLoaded", () => {
  // 1. MÔ PHỎNG DỮ LIỆU KHÁCH HÀNG
  const customerData = {
    user: {
      greeting: "Chào mừng trở lại! 👋",
      fullname: "Dương Trung Kiên",
    },
    metrics: {
      petsCount: 2,
      upcomingAppointments: 1,
      usedServices: 5,
    },
    notifications: [
      {
        id: 1,
        type: "calendar",
        iconClass: "fa-regular fa-calendar-check",
        iconBg: "#f3eefb",
        iconColor: "#8b5cf6",
        title: "Lịch hẹn Grooming vào 16/07/2025",
        subtitle: "Phòng Grooming 2 - 09:00 AM",
        timeAgo: "2 giờ trước",
        isUnread: true,
      },
      {
        id: 2,
        type: "announcement",
        iconClass: "fa-solid fa-bullhorn",
        iconBg: "#e6f4ea",
        iconColor: "#2ece77",
        title: "PetCare Premium ra mắt dịch vụ mới",
        subtitle: "Khám phá ngay các dịch vụ mới cho thú cưng",
        timeAgo: "3 ngày trước",
        isUnread: true,
      },
    ],
    pets: [
      {
        id: "P01",
        name: "Bông",
        breed: "Poodle",
        gender: "♀",
        age: "2 tuổi",
        avatar:
          "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "P02",
        name: "Miu",
        breed: "Mèo Anh",
        gender: "♀",
        age: "1 tuổi",
        avatar:
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80",
      },
    ],
  };

  // 2. RENDER DỮ LIỆU LÊN GIAO DIỆN

  // Header & User info
  document.getElementById("greeting-text").textContent =
    customerData.user.greeting;
  document.getElementById("user-fullname").textContent =
    customerData.user.fullname;

  // Metrics
  document.getElementById("pets-count").textContent =
    customerData.metrics.petsCount;
  document.getElementById("upcoming-appointments-count").textContent =
    customerData.metrics.upcomingAppointments;
  document.getElementById("used-services-count").textContent =
    customerData.metrics.usedServices;

  // Render Danh sách Thông báo
  const notifContainer = document.getElementById("notifications-container");
  if (customerData.notifications.length === 0) {
    notifContainer.innerHTML = `<p style="font-size: 13px; color: #888;">Không có thông báo nào.</p>`;
  } else {
    notifContainer.innerHTML = customerData.notifications
      .map(
        (item) => `
        <div class="notif-item">
          <div class="notif-item-icon" style="background-color: ${item.iconBg}; color: ${item.iconColor};">
            <i class="${item.iconClass}"></i>
          </div>
          <div class="notif-content">
            <div class="notif-title">${item.title}</div>
            <div class="notif-sub">${item.subtitle}</div>
          </div>
          <div class="notif-time-badge">
            <span>${item.timeAgo}</span>
            ${item.isUnread ? '<span class="dot-unread"></span>' : ""}
          </div>
        </div>
      `,
      )
      .join("");
  }

  // Render Danh sách Thú cưng
  const petsContainer = document.getElementById("pets-container");
  if (customerData.pets.length === 0) {
    petsContainer.innerHTML = `<p style="font-size: 13px; color: #888;">Bạn chưa thêm bé cưng nào.</p>`;
  } else {
    petsContainer.innerHTML = customerData.pets
      .map(
        (pet) => `
        <div class="pet-item-card">
          <img src="${pet.avatar}" alt="${pet.name}" class="pet-avatar" />
          <h4 class="pet-name">${pet.name}</h4>
          <span class="pet-breed">${pet.breed}</span>
          <span class="pet-meta">${pet.gender} ${pet.age}</span>
          <button class="btn-pet-detail" data-id="${pet.id}">Xem chi tiết</button>
        </div>
      `,
      )
      .join("");
  }

  // 3. SỰ KIỆN NÚT ĐẶT LỊCH NGAY
  const bookingBtn = document.querySelector(".btn-booking");
  if (bookingBtn) {
    bookingBtn.addEventListener("click", () => {
      console.log("Điều hướng tới trang đặt lịch dịch vụ...");
    });
  }
});
