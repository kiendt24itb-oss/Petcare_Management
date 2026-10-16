/**
 * 👤 FILE: Staff_profile.js
 * Xử lý Xem, Cập nhật Profile Nhân viên & Upload Ảnh Đại Diện
 */

const API_BASE_URL = "http://localhost:8000/api/v1";

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    console.warn("⚠️ Chưa tìm thấy Token hợp lệ. Vui lòng đăng nhập!");
    showPetToast("Phiên làm việc hết hạn. Vui lòng đăng nhập lại!", "error");
    return;
  }

  // 1. Tải thông tin cá nhân của nhân viên
  loadStaffProfile(token);

  // 2. Lắng nghe Upload Avatar
  const inputAvatar = document.getElementById("inputAvatar");
  if (inputAvatar) {
    inputAvatar.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) handleUploadAvatar(file, token);
    });
  }

  // 3. Lắng nghe Submit form cập nhật
  const formUpdate = document.getElementById("formUpdateStaff");
  if (formUpdate) {
    formUpdate.addEventListener("submit", function (event) {
      submitUpdateStaff(event, token);
    });
  }

  // 4. Lắng nghe nút Hỗ trợ HR / IT
  const btnSupportChat = document.getElementById("btnSupportChat");
  if (btnSupportChat) {
    btnSupportChat.addEventListener("click", openSupportChat);
  }
});

/**
 * 🔑 Lấy Bearer Token từ Storage / Parent Iframe
 */
function getAuthToken() {
  let token = localStorage.getItem("petcare_token");
  if (!token) token = sessionStorage.getItem("petcare_token");

  try {
    if (!token && window.parent && window.parent.localStorage) {
      token = window.parent.localStorage.getItem("petcare_token");
    }
  } catch (e) {
    console.warn("Cross-origin iframe access blocked:", e);
  }

  if (!token || token === "null" || token === "undefined") return null;
  return token.trim();
}

/**
 * 📥 Tải dữ liệu Profile từ Laravel API
 */
async function loadStaffProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/staff/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Không thể tải thông tin nhân viên!"),
        "error",
      );
      return;
    }

    const staff = result.data;
    if (!staff) return;

    // 1. Kiểm tra Chức vụ & Mã NV
    const hasPosition = staff.position && staff.position.positionId;
    const staffCodeInput = document.getElementById("staffCode");

    if (!hasPosition || !staff.staffCode || staff.staffCode.startsWith("NV-")) {
      staffCodeInput.value = "Chờ cập nhật theo chức vụ";
    } else {
      staffCodeInput.value = staff.staffCode;
    }

    const posName =
      staff.position?.positionName || staff.positionName || "Chưa gán chức vụ";
    document.getElementById("positionName").value = posName;

    document.getElementById("fullName").value =
      staff.fullName === "Chưa cập nhật" ? "" : staff.fullName || "";
    document.getElementById("citizenId").value = staff.citizenId || "";
    document.getElementById("phone").value = staff.phone || "";
    document.getElementById("email").value = staff.email || "";
    document.getElementById("address").value = staff.address || "";

    // 2. Cập nhật Sidebar Thông tin
    const profileNameEl = document.getElementById("profileName");
    if (profileNameEl)
      profileNameEl.innerText =
        staff.fullName === "Chưa cập nhật" || !staff.fullName
          ? "Nhân viên mới"
          : staff.fullName;

    const sidebarPosEl = document.getElementById("profileSidebarPos");
    if (sidebarPosEl) sidebarPosEl.innerText = posName.toUpperCase();

    // 3. Cập nhật Avatar
    const avatarImg = document.getElementById("staffAvatar");
    if (avatarImg) {
      avatarImg.src = getImageUrl(staff.avatar);
      avatarImg.dataset.avatarPath = staff.avatar || "";
    }

    // 4. Bảng lương
    const salaryPerShift = parseFloat(staff.salaryPerShift) || 0;
    const estimatedBonus = salaryPerShift * 0.1;
    const totalSalary = salaryPerShift + estimatedBonus;

    const salBaseEl = document.getElementById("sal-base");
    const salBonusEl = document.getElementById("sal-bonus");
    const salTotalEl = document.getElementById("sal-total");

    if (salBaseEl) salBaseEl.innerText = formatVND(salaryPerShift);
    if (salBonusEl) salBonusEl.innerText = formatVND(estimatedBonus);
    if (salTotalEl) salTotalEl.innerText = formatVND(totalSalary);

    // Đồng bộ LocalStorage & Parent Frame
    if (staff.fullName && staff.fullName !== "Chưa cập nhật") {
      localStorage.setItem("petcare_username", staff.fullName);
      syncParentName(staff.fullName);
    }
    if (staff.avatar) {
      syncParentAvatar(getImageUrl(staff.avatar));
    }
  } catch (error) {
    console.error("Lỗi lấy Profile Staff:", error);
    showPetToast("Không thể kết nối đến máy chủ API!", "error");
  }
}

/**
 * 📷 Upload Ảnh đại diện Nhân viên
 */
async function handleUploadAvatar(file, token) {
  if (!file.type.startsWith("image/")) {
    showPetToast(
      "Vui lòng chọn tệp hình ảnh hợp lệ (jpg, png, webp)!",
      "error",
    );
    return;
  }

  const formData = new FormData();
  formData.append("avatar_file", file);

  try {
    showPetToast("⏳ Đang tải ảnh lên máy chủ...", "success");

    const response = await fetch(
      `${API_BASE_URL}/staff/profile/upload-avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(getApiErrorMessage(result, "Upload ảnh thất bại!"), "error");
      return;
    }

    const avatarPath = result.data;
    const avatarImg = document.getElementById("staffAvatar");

    if (avatarImg) {
      const fullUrl = getImageUrl(avatarPath);
      avatarImg.src = fullUrl;
      avatarImg.dataset.avatarPath = avatarPath;
      syncParentAvatar(fullUrl);
    }

    showPetToast("🎉 Cập nhật ảnh đại diện thành công!", "success");
  } catch (error) {
    console.error("Lỗi upload avatar staff:", error);
    showPetToast("Lỗi kết nối máy chủ khi upload ảnh!", "error");
  }
}

/**
 * 📤 Gửi thông tin cập nhật Profile Nhân viên
 */
async function submitUpdateStaff(event, token) {
  event.preventDefault();

  const citizenId = document.getElementById("citizenId").value.trim();
  if (citizenId !== "" && !/^\d{12}$/.test(citizenId)) {
    showPetToast("Số CCCD phải bao gồm đúng 12 chữ số!", "error");
    return;
  }

  const avatarImg = document.getElementById("staffAvatar");
  const updatePayload = {
    fullName: document.getElementById("fullName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    citizenId: citizenId || null,
    address: document.getElementById("address").value.trim() || null,
    avatar: avatarImg?.dataset?.avatarPath || null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/staff/profile/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Cập nhật hồ sơ thất bại!"),
        "error",
      );
      return;
    }

    showPetToast(
      result.message || "🎉 Cập nhật thông tin hồ sơ thành công!",
      "success",
    );
    loadStaffProfile(token);
  } catch (error) {
    console.error("Lỗi cập nhật Profile Staff:", error);
    showPetToast("Mất kết nối đường truyền tới máy chủ!", "error");
  }
}

/**
 * 🛠️ CÁC HÀM BỔ TRỢ & TIỆN ÍCH
 */

async function readApiResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
  }
}

function getApiErrorMessage(result, fallback) {
  const validationErrors = result?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const firstErrorList = Object.values(validationErrors);
    if (firstErrorList.length > 0) {
      const firstMsg = Array.isArray(firstErrorList[0])
        ? firstErrorList[0][0]
        : firstErrorList[0];
      if (firstMsg) return firstMsg;
    }
  }
  return result?.message || fallback;
}

function getImageUrl(path) {
  const defaultSvg =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZWFmN2IiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNhM2UxYTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI5MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (!path || path.trim() === "" || path === "null") return defaultSvg;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  )
    return path;

  return `http://localhost:8000/${path.startsWith("/") ? path.slice(1) : path}`;
}

function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function syncParentName(name) {
  try {
    if (window.parent && window.parent.document) {
      const el = window.parent.document.getElementById("userProfileName");
      if (el) el.innerText = name;
    }
  } catch (e) {}
}

function syncParentAvatar(url) {
  try {
    if (window.parent && window.parent.document) {
      const el = window.parent.document.getElementById("userAvatar");
      if (el) el.src = url;
    }
  } catch (e) {}
}

function openSupportChat() {
  showPetToast("🎧 Đang kết nối tới bộ phận HR / IT PetCare...", "success");
}

/**
 * 🍿 Hiển thị Toast thông báo trượt mượt từ góc trên bên phải
 */
function showPetToast(message, type = "success") {
  if (!document.getElementById("pet-toast-animation-style")) {
    const style = document.createElement("style");
    style.id = "pet-toast-animation-style";
    style.innerHTML = `
      @keyframes slideInRight {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  let container = document.getElementById("pet-toast-container");
  if (!container && window.parent && window.parent.document) {
    container = window.parent.document.getElementById("pet-toast-container");
  }
  if (!container) {
    container = document.createElement("div");
    container.id = "pet-toast-container";
    document.body.appendChild(container);
  }

  container.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 999999 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    pointer-events: none !important;
  `;

  const toast = document.createElement("div");
  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  const icon = type === "success" ? "✓" : "✕";

  toast.style.cssText = `
    pointer-events: auto;
    min-width: 260px;
    max-width: 360px;
    padding: 12px 18px;
    background: #ffffff;
    color: #2c3e50;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border-left: 5px solid ${bgColor};
    animation: slideInRight 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `;

  toast.innerHTML = `
    <span style="width: 22px; height: 22px; background: ${bgColor}; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0;">${icon}</span>
    <span style="flex: 1; line-height: 1.4;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease-in forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
