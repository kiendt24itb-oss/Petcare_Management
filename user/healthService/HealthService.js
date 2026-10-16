/**
 * 🩺 HealthService.js - Quản lý Dịch vụ Health & Modal Đặt lịch Khám
 */

const SERVER_HOST = "http://127.0.0.1:8000";
const BASE_URL = `${SERVER_HOST}/api/v1`;

let globalHealthServices = [];
let myPetsList = [];

document.addEventListener("DOMContentLoaded", async function () {
  const token = getAuthToken();

  const dateInput = document.getElementById("bookingDate");
  if (dateInput) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    dateInput.min = todayStr;
    dateInput.value = todayStr;
  }

  await Promise.all([fetchHealthServices(token), fetchCustomerInfo(token)]);

  renderHealthServices();
  setupModalEvents();
});

function getAuthToken() {
  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get("token");
  if (!token) token = localStorage.getItem("petcare_token");
  if (!token) token = sessionStorage.getItem("petcare_token");

  try {
    if (!token && window.parent && window.parent.localStorage) {
      token = window.parent.localStorage.getItem("petcare_token");
    }
  } catch (e) {
    console.warn("Cross-origin storage error:", e);
  }

  if (token === "null" || token === "undefined" || !token) return null;
  return token.trim();
}

async function fetchHealthServices(token) {
  try {
    const res = await fetch(`${BASE_URL}/services`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      const all = result.data || [];
      globalHealthServices = all.filter((s) => {
        const isActive = (s.status || "").toUpperCase() === "ACTIVE";
        const catName = (s.categoryName || "").toUpperCase();
        const code = (s.serviceCode || "").toUpperCase();
        return (
          isActive &&
          (catName.includes("HEALTH") ||
            catName.includes("Y TẾ") ||
            catName.includes("KHÁM") ||
            code.includes("HEALTH"))
        );
      });
    }
  } catch (err) {
    console.error("Lỗi Health Services:", err);
  }
}

async function fetchCustomerInfo(token) {
  if (!token) return;
  try {
    const res = await fetch(`${BASE_URL}/customers/booking-info`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.fullName) {
        document.getElementById("modalUserAvatar").innerText = data.fullName
          .trim()
          .charAt(0)
          .toUpperCase();
        document.getElementById("modalUserName").innerText = data.fullName;
      }
      if (data.customerCode) {
        document.getElementById("modalUserCode").innerText =
          "Mã KH: " + data.customerCode;
      }
      myPetsList = data.pets || [];
      populatePetSelectDropdown();
    }
  } catch (err) {
    console.error("Lỗi thông tin khách hàng:", err);
  }
}

function renderHealthServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  if (globalHealthServices.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:#94a3b8;">Chưa có dịch vụ Pet Health nào sẵn sàng.</p>`;
    return;
  }

  grid.innerHTML = globalHealthServices
    .map((item) => {
      const priceText = `${Number(item.price).toLocaleString("vi-VN")}đ`;
      const img =
        item.imageUrl ||
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80";

      return `
        <div class="service-card" data-id="${item.serviceId}">
            <div class="service-img-wrapper">
                <img src="${img}" alt="${item.serviceName}" class="service-img">
            </div>
            <div class="service-body">
                <h4 class="service-name">${item.serviceName}</h4>
                <p class="service-desc">${item.description || "Dịch vụ y tế chăm sóc sức khỏe chuyên nghiệp."}</p>
                <div class="service-price">${priceText}</div>
                <button class="btn-book-health" data-id="${item.serviceId}" data-name="${item.serviceName}" data-price="${priceText}">
                    <i class="fa-regular fa-calendar-check"></i> Đặt lịch ngay
                </button>
            </div>
        </div>
      `;
    })
    .join("");
}

function populatePetSelectDropdown() {
  const select = document.getElementById("healthPetSelect");
  if (!select) return;

  if (myPetsList.length === 0) {
    select.innerHTML = `<option value="">-- Chưa có thú cưng nào --</option>`;
    return;
  }

  let html = `<option value="">-- Chọn bé khám --</option>`;
  myPetsList.forEach((p) => {
    html += `<option value="${p.petId}">${p.petName} (${p.species || "Thú cưng"})</option>`;
  });
  select.innerHTML = html;
}

function setupModalEvents() {
  document.addEventListener("click", (e) => {
    const bookBtn = e.target.closest(".btn-book-health");
    if (bookBtn) {
      openBookingModal(
        bookBtn.dataset.id,
        bookBtn.dataset.name,
        bookBtn.dataset.price,
      );
    }

    if (e.target.closest(".btn-booking-general")) {
      const first = globalHealthServices[0];
      if (first) {
        openBookingModal(
          first.serviceId,
          first.serviceName,
          `${Number(first.price).toLocaleString("vi-VN")}đ`,
        );
      } else {
        showLocalToast("Hiện chưa có dịch vụ Health khả dụng!", "error");
      }
    }
  });

  document
    .getElementById("closeHealthModalBtn")
    ?.addEventListener("click", closeBookingModal);
  document
    .getElementById("btnHealthReset")
    ?.addEventListener("click", closeBookingModal);

  const modal = document.getElementById("healthBookingModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBookingModal();
    });
  }

  document
    .getElementById("formHealthBooking")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      const serviceId = document.getElementById("selectedServiceId").value;
      const petId = document.getElementById("healthPetSelect")?.value;
      const date = document.getElementById("bookingDate").value;
      const time = document.getElementById("bookingTime").value;

      if (!petId) {
        showLocalToast("Vui lòng chọn bé thú cưng đăng ký khám!", "error");
        return;
      }

      showLocalToast(
        `🎉 Đã ghi nhận lịch hẹn khám thành công! (Gói: ${serviceId}, Ngày: ${date} lúc ${time})`,
        "success",
      );
      closeBookingModal();
    });
}

function openBookingModal(serviceId, serviceName, servicePrice) {
  document.getElementById("selectedServiceId").value = serviceId;

  document.getElementById("selectedServiceDisplay").innerHTML = `
    <span class="service-display-name"><i class="fa-solid fa-notes-medical"></i> ${serviceName}</span>
    <span class="service-display-price">${servicePrice}</span>
  `;

  document.getElementById("healthBookingModal")?.classList.add("active");
}

function closeBookingModal() {
  document.getElementById("healthBookingModal")?.classList.remove("active");
}

function showLocalToast(message, type = "success") {
  let container = document.getElementById("pet-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "pet-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.cssText = `padding: 12px 18px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: ${
    type === "success" ? "#2ecc71" : "#e74c3c"
  }`;

  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3200);
}
