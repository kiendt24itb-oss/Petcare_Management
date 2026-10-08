/**
 * 👤 FILE: Staff_profile.js
 * Xử lý thông tin Hồ sơ Nhân viên & Lương thưởng
 */

const SERVER_HOST = "http://localhost/petcare_management_v2_api";
const BASE_URL = `${SERVER_HOST}/index.php/api`;

let uploadedAvatarPath = null;

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get("token");

  if (!token) token = localStorage.getItem("petcare_token");
  if (!token && window.parent) {
    try {
      token = window.parent.localStorage.getItem("petcare_token");
    } catch (e) {
      console.warn("Iframe access blocked:", e);
    }
  }

  if (
    !token ||
    token === "null" ||
    token === "undefined" ||
    token.trim() === ""
  ) {
    showLocalToast(
      "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!",
      "error",
    );
    return;
  }

  // 1. Tải hồ sơ Nhân viên
  loadStaffProfile(token);

  // 2. Upload Avatar
  const inputAvatar = document.getElementById("inputAvatar");
  if (inputAvatar) {
    inputAvatar.addEventListener("change", async function (e) {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showLocalToast(
          "Vui lòng chọn ảnh đại diện hợp lệ (png, jpg, webp)!",
          "error",
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = function (ev) {
        document.getElementById("staffAvatar").src = ev.target.result;
      };
      reader.readAsDataURL(file);

      await uploadStaffAvatar(file, token);
      inputAvatar.value = "";
    });
  }

  // 3. Submit Cập nhật Form
  const form = document.getElementById("formUpdateStaff");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitUpdateStaff(token);
    });
  }
});

/**
 * 📥 Tải dữ liệu Nhân viên từ API
 */
async function loadStaffProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/staff/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      showLocalToast(result.message || "Lỗi tải thông tin nhân viên!", "error");
      return;
    }

    const staff = result.data;
    const avatar = staff.avatar;

    if (
      avatar &&
      avatar.trim() !== "" &&
      avatar !== "null" &&
      !avatar.includes("default-avatar")
    ) {
      uploadedAvatarPath = avatar;
      const avatarUrl = getImageUrl(avatar);
      document.getElementById("staffAvatar").src = avatarUrl;
      localStorage.setItem("petcare_avatar", avatar);

      syncParentAvatar(avatarUrl);
    } else {
      uploadedAvatarPath = null;
      localStorage.removeItem("petcare_avatar");
      const defaultImg = getImageUrl(null);
      document.getElementById("staffAvatar").src = defaultImg;
      syncParentAvatar(defaultImg);
    }

    // Đổ dữ liệu vào inputs
    document.getElementById("staffCode").value = staff.staffCode || "";
    document.getElementById("positionName").value =
      staff.positionName || "Nhân viên";
    document.getElementById("fullName").value = staff.fullName || "";
    document.getElementById("phone").value = staff.phone || "";
    document.getElementById("citizenId").value = staff.citizenId || "";
    document.getElementById("email").value = staff.email || "";
    document.getElementById("address").value = staff.address || "";
    if (staff.gender) document.getElementById("gender").value = staff.gender;

    document.getElementById("profileName").innerText =
      staff.fullName || "Nhân viên";
    document.getElementById("profileSidebarPos").innerText =
      staff.positionName || "NHÂN VIÊN";

    // Tính Lương Thưởng
    const baseSalary = parseFloat(staff.baseSalaryPerShift) || 0;
    const bonus = baseSalary * 0.1;

    document.getElementById("sal-base").innerText = formatVND(baseSalary);
    document.getElementById("sal-bonus").innerText = formatVND(bonus);
    document.getElementById("sal-total").innerText = formatVND(
      baseSalary + bonus,
    );

    syncParentName(staff.fullName || "Nhân viên");
  } catch (e) {
    console.error(e);
    showLocalToast("Không thể kết nối đến máy chủ dữ liệu!", "error");
  }
}

/**
 * 📤 Submit thông tin cập nhật
 */
async function submitUpdateStaff(token) {
  const citizenId = document.getElementById("citizenId").value.trim();

  if (citizenId !== "" && !/^\d{12}$/.test(citizenId)) {
    showLocalToast("Số CCCD phải bao gồm đúng 12 chữ số!", "error");
    return;
  }

  const updateData = {
    fullName: document.getElementById("fullName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    citizenId: citizenId,
    address: document.getElementById("address").value.trim(),
    gender: document.getElementById("gender").value,
    avatar: uploadedAvatarPath,
  };

  try {
    const response = await fetch(`${BASE_URL}/staff/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      showLocalToast(result.message || "Cập nhật hồ sơ thất bại!", "error");
      return;
    }

    const staff = result.data || updateData;
    showLocalToast("🎉 Lưu thay đổi thành công!", "success");

    if (staff.fullName) {
      document.getElementById("profileName").innerText = staff.fullName;
      syncParentName(staff.fullName);
    }

    loadStaffProfile(token);
  } catch (e) {
    console.error(e);
    showLocalToast("Lỗi kết nối khi lưu thông tin!", "error");
  }
}

/**
 * 📸 Upload Ảnh Đại Diện
 */
async function uploadStaffAvatar(file, token) {
  const formData = new FormData();
  formData.append("avatar_file", file);

  try {
    const response = await fetch(`${BASE_URL}/staff/upload-avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      showLocalToast(result.message || "Tải ảnh lên thất bại!", "error");
      return;
    }

    uploadedAvatarPath = result.data;
    localStorage.setItem("petcare_avatar", uploadedAvatarPath);

    const avatarUrl = getImageUrl(uploadedAvatarPath);
    document.getElementById("staffAvatar").src = avatarUrl;
    syncParentAvatar(avatarUrl);

    showLocalToast("Cập nhật ảnh đại diện thành công!", "success");
  } catch (e) {
    console.error(e);
    showLocalToast("Không thể tải ảnh lên máy chủ!", "error");
  }
}

/**
 * 🖼️ Chuẩn hóa URL Ảnh
 */
function getImageUrl(path) {
  const defaultSvg =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZWFmN2IiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNhM2UxYTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (
    !path ||
    path.trim() === "" ||
    path === "null" ||
    path.includes("default-avatar")
  ) {
    return defaultSvg;
  }
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  ) {
    return path;
  }
  const cleanHost = SERVER_HOST.endsWith("/")
    ? SERVER_HOST.slice(0, -1)
    : SERVER_HOST;
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  return cleanHost + cleanPath;
}

function syncParentName(name) {
  localStorage.setItem("petcare_username", name);
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

function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * 🍿 Hiển thị Toast mượt từ góc phải (Slide-In từ bên phải)
 */
function showLocalToast(message, type = "success") {
  // Tự động inject CSS Animation nếu chưa có
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

  // Cố định Container luôn nổi trên cùng bên phải góc màn hình
  container.style.cssText =
    "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;";

  const toast = document.createElement("div");
  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  const icon = type === "success" ? "✓" : "✕";

  toast.style.cssText = `
    pointer-events: auto;
    min-width: 250px;
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
