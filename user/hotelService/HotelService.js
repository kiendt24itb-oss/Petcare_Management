/**
 * 🏨 HotelService.js - Quản lý Dịch vụ Hotel & Modal Đặt phòng
 */

const SERVER_HOST = "http://127.0.0.1:8000";
const BASE_URL = `${SERVER_HOST}/api/v1`;

let globalHotelServices = [];
let globalRoomTypes = [];
let globalRooms = [];
let myPetsList = [];

// Fallback UI
const fallbackRoomData = [
  {
    id: 1,
    name: "Phòng Standard",
    maxCapacityNum: 2,
    capacity: "Tối đa 2 bé",
    price: "200.000đ",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Phòng Deluxe",
    maxCapacityNum: 3,
    capacity: "Tối đa 3 bé",
    price: "300.000đ",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Phòng VIP",
    maxCapacityNum: 4,
    capacity: "Tối đa 4 bé",
    price: "450.000đ",
    image:
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Suite Gia Đình",
    maxCapacityNum: 6,
    capacity: "Tối đa 6 bé",
    price: "600.000đ",
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Phòng View Vườn",
    maxCapacityNum: 3,
    capacity: "Tối đa 3 bé",
    price: "350.000đ",
    image:
      "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Phòng Premium",
    maxCapacityNum: 5,
    capacity: "Tối đa 5 bé",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
  },
];

document.addEventListener("DOMContentLoaded", async function () {
  const token = getAuthToken();

  // Khởi tạo ngày hiện tại
  const dateInput = document.getElementById("bookingDate");
  if (dateInput) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    dateInput.min = todayStr;
    dateInput.value = todayStr;
  }

  // Tải API
  await Promise.all([
    fetchRoomTypes(token),
    fetchRooms(token),
    fetchHotelServices(token),
    fetchCustomerInfo(token),
  ]);

  renderHotelServices();
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

async function fetchRoomTypes(token) {
  try {
    const res = await fetch(`${BASE_URL}/room-types`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success))
      globalRoomTypes = result.data || [];
  } catch (err) {
    console.error("Lỗi Room Types:", err);
  }
}

async function fetchRooms(token) {
  try {
    const res = await fetch(`${BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success))
      globalRooms = result.data || [];
  } catch (err) {
    console.error("Lỗi Rooms:", err);
  }
}

async function fetchHotelServices(token) {
  try {
    const res = await fetch(`${BASE_URL}/services`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      const all = result.data || [];
      globalHotelServices = all.filter((s) => {
        const isActive = (s.status || "").toUpperCase() === "ACTIVE";
        const catName = (s.categoryName || "").toUpperCase();
        const code = (s.serviceCode || "").toUpperCase();
        return (
          isActive &&
          (catName.includes("HOTEL") ||
            catName.includes("LƯU TRÚ") ||
            code.includes("HOTEL"))
        );
      });
    }
  } catch (err) {
    console.error("Lỗi Hotel Services:", err);
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
    }
  } catch (err) {
    console.error("Lỗi thông tin khách hàng:", err);
  }
}

function getMaxCapacityByRoomType(roomTypeId) {
  if (!roomTypeId || globalRooms.length === 0) return 2;
  const matched = globalRooms.filter(
    (r) => String(r.roomTypeId || r.room_type_id) === String(roomTypeId),
  );
  if (matched.length === 0) return 2;

  let maxCap = 0;
  matched.forEach((r) => {
    const cap = parseInt(r.capacity, 10);
    if (!isNaN(cap) && cap > maxCap) maxCap = cap;
  });
  return maxCap > 0 ? maxCap : 2;
}

function renderHotelServices() {
  const grid = document.getElementById("roomsGrid");
  if (!grid) return;

  const listToRender =
    globalHotelServices.length > 0 ? globalHotelServices : fallbackRoomData;

  grid.innerHTML = listToRender
    .map((item) => {
      const isApi = !!item.serviceId;
      const id = isApi ? item.serviceId : item.id;
      const name = isApi ? item.serviceName : item.name;
      const priceText = isApi
        ? `${Number(item.price).toLocaleString("vi-VN")}đ`
        : item.price;
      const img =
        (isApi ? item.imageUrl : item.image) ||
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80";

      let maxCapNum = item.maxCapacityNum || 2;
      if (isApi && item.requiredRoomTypeId) {
        maxCapNum = getMaxCapacityByRoomType(item.requiredRoomTypeId);
      }

      return `
        <div class="room-card" data-id="${id}">
            <div class="room-img-wrapper">
                <img src="${img}" alt="${name}" class="room-img">
            </div>
            <div class="room-body">
                <h4 class="room-name">${name}</h4>
                <div class="room-specs">
                    <span class="spec-item"><i class="fa-solid fa-user-group"></i> Tối đa ${maxCapNum} bé</span>
                </div>
                <div class="room-price">${priceText} <span>/ đêm</span></div>
                <button class="btn-book-hotel" data-id="${id}" data-name="${name}" data-price="${priceText}" data-capacity="${maxCapNum}">
                    <i class="fa-regular fa-calendar-check"></i> Đặt lịch ngay
                </button>
            </div>
        </div>
      `;
    })
    .join("");
}

/* ==========================================================================
   📝 QUẢN LÝ DÒNG CHỌN PET ĐỘNG DỰA TRÊN SỨC CHỨA TỐI ĐA
   ========================================================================== */

function setupModalEvents() {
  document.addEventListener("click", (e) => {
    const bookBtn = e.target.closest(".btn-book-hotel");
    if (bookBtn) {
      openBookingModal(
        bookBtn.dataset.id,
        bookBtn.dataset.name,
        bookBtn.dataset.price,
        parseInt(bookBtn.dataset.capacity || 1, 10),
      );
    }

    if (e.target.closest(".btn-booking-general")) {
      const first = globalHotelServices[0] || fallbackRoomData[0];
      const cap = first.requiredRoomTypeId
        ? getMaxCapacityByRoomType(first.requiredRoomTypeId)
        : first.maxCapacityNum || 2;
      openBookingModal(
        first.serviceId || first.id,
        first.serviceName || first.name,
        first.price ? `${Number(first.price).toLocaleString()}đ` : first.price,
        cap,
      );
    }
  });

  document
    .getElementById("closeHotelModalBtn")
    ?.addEventListener("click", closeBookingModal);
  document
    .getElementById("btnHotelReset")
    ?.addEventListener("click", closeBookingModal);

  document.getElementById("btnAddPetRow")?.addEventListener("click", () => {
    const maxCap = parseInt(
      document.getElementById("maxAllowedPets").value,
      10,
    );
    const currentCount = document.querySelectorAll(".pet-row-item").length;

    if (currentCount >= maxCap) {
      showLocalToast(
        `Gói phòng này chỉ cho phép chọn tối đa ${maxCap} bé!`,
        "error",
      );
      return;
    }
    addPetRowItem();
  });

  const modal = document.getElementById("hotelBookingModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBookingModal();
    });
  }

  document
    .getElementById("formHotelBooking")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      const serviceId = document.getElementById("selectedServiceId").value;
      const date = document.getElementById("bookingDate").value;
      const time = document.getElementById("bookingTime").value;

      const petSelects = document.querySelectorAll(".cstm-pet-select");
      const selectedPetIds = [];
      petSelects.forEach((s) => {
        if (s.value) selectedPetIds.push(s.value);
      });

      if (selectedPetIds.length === 0) {
        showLocalToast("Vui lòng chọn ít nhất 1 bé thú cưng!", "error");
        return;
      }

      showLocalToast(
        `🎉 Đã ghi nhận đơn đặt phòng thành công! (Dịch vụ: ${serviceId}, ${selectedPetIds.length} bé, Ngày: ${date} ${time})`,
        "success",
      );
      closeBookingModal();
    });
}

function openBookingModal(serviceId, serviceName, servicePrice, maxCapacity) {
  document.getElementById("selectedServiceId").value = serviceId;
  document.getElementById("maxAllowedPets").value = maxCapacity;

  document.getElementById("selectedServiceDisplay").innerHTML = `
    <span class="service-display-name"><i class="fa-solid fa-bed"></i> ${serviceName}</span>
    <span class="service-display-price">${servicePrice} / đêm</span>
  `;

  document.getElementById("capacityHintText").innerText =
    `(Tối đa ${maxCapacity} bé)`;

  // Reset danh sách pet
  const petContainer = document.getElementById("hotelPetContainer");
  petContainer.innerHTML = "";
  addPetRowItem(); // Thêm 1 ô chọn mặc định

  document.getElementById("hotelBookingModal")?.classList.add("active");
}

function addPetRowItem() {
  const container = document.getElementById("hotelPetContainer");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "pet-row-item";

  let options = `<option value="">-- Chọn bé thú cưng --</option>`;
  if (myPetsList.length === 0) {
    options = `<option value="">Chưa có thú cưng nào</option>`;
  } else {
    myPetsList.forEach((p) => {
      options += `<option value="${p.petId}">${p.petName} (${p.species || "Thú cưng"})</option>`;
    });
  }

  const isFirstRow = container.children.length === 0;

  row.innerHTML = `
    <select class="modal-select cstm-pet-select" required>${options}</select>
    ${!isFirstRow ? '<button type="button" class="btn-remove-pet"><i class="fa-solid fa-xmark"></i></button>' : ""}
  `;

  if (!isFirstRow) {
    row
      .querySelector(".btn-remove-pet")
      .addEventListener("click", () => row.remove());
  }

  container.appendChild(row);
}

function closeBookingModal() {
  document.getElementById("hotelBookingModal")?.classList.remove("active");
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
