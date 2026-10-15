/**
 * 👤 FILE: Customer_info.js
 * Xử lý Xem, Cập nhật Profile Khách hàng & Upload Ảnh Đại Diện
 */

const API_BASE_URL = "http://localhost:8000/api/v1";

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    console.warn("⚠️ Chưa tìm thấy Token hợp lệ. Vui lòng đăng nhập!");
    showPetToast("Phiên làm việc hết hạn. Vui lòng đăng nhập lại!", "error");
    return;
  }

  // 1. Tải thông tin cá nhân của khách hàng
  loadCustomerProfile(token);

  // 2. Lắng nghe Upload Avatar
  const inputAvatar = document.getElementById("inputAvatar");
  if (inputAvatar) {
    inputAvatar.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) handleUploadAvatar(file, token);
    });
  }

  // 3. Lắng nghe Submit form cập nhật
  const formUpdate = document.getElementById("formUpdateCustomer");
  if (formUpdate) {
    formUpdate.addEventListener("submit", function (event) {
      submitUpdateCustomer(event, token);
    });
  }

  // 4. Lắng nghe các nút phụ (Xác thực / Hỗ trợ)
  const btnInlineVerify = document.getElementById("btnInlineVerifyEmail");
  if (btnInlineVerify) {
    btnInlineVerify.addEventListener("click", () => {
      showPetToast("Tính năng xác thực email đang phát triển!", "success");
    });
  }

  const btnRightVerify = document.getElementById("btnRightVerifyEmail");
  if (btnRightVerify) {
    btnRightVerify.addEventListener("click", () => {
      showPetToast("Tính năng xác thực email đang phát triển!", "success");
    });
  }

  const btnSupportChat = document.getElementById("btnSupportChat");
  if (btnSupportChat) {
    btnSupportChat.addEventListener("click", openSupportChat);
  }
});

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
async function loadCustomerProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Không thể tải thông tin cá nhân!"),
        "error",
      );
      return;
    }

    const customer = result.data;
    if (!customer) return;

    document.getElementById("customerId").value =
      customer.customerCode || "Chưa cấp mã";
    document.getElementById("fullName").value = customer.fullName || "";
    document.getElementById("age").value = customer.age || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("gender").value = customer.gender || "";
    document.getElementById("address").value = customer.address || "";
    document.getElementById("email").value = customer.email || "";

    const profileNameEl = document.getElementById("profileName");
    if (profileNameEl)
      profileNameEl.innerText = customer.fullName || "Khách hàng";

    const avatarImg = document.getElementById("customerAvatar");
    if (avatarImg) {
      avatarImg.src = getImageUrl(customer.avatar);
      avatarImg.dataset.avatarPath = customer.avatar || "";
    }

    if (customer.fullName)
      localStorage.setItem("petcare_username", customer.fullName);
  } catch (error) {
    console.error("Lỗi lấy Profile:", error);
    showPetToast("Không thể kết nối đến máy chủ API!", "error");
  }
}

/**
 * 📷 Upload Ảnh đại diện Khách hàng
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
      `${API_BASE_URL}/customer/profile/upload-avatar`,
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

    const avatarPath = result.data; // e.g., 'storage/avatars/customers/xxx.jpg'
    const avatarImg = document.getElementById("customerAvatar");

    if (avatarImg) {
      avatarImg.src = getImageUrl(avatarPath);
      avatarImg.dataset.avatarPath = avatarPath;
    }

    showPetToast("🎉 Upload ảnh đại diện thành công!", "success");
  } catch (error) {
    console.error("Lỗi upload avatar:", error);
    showPetToast("Lỗi kết nối máy chủ khi upload ảnh!", "error");
  }
}

/**
 * 📤 Gửi thông tin cập nhật Profile
 */
async function submitUpdateCustomer(event, token) {
  event.preventDefault();

  const avatarImg = document.getElementById("customerAvatar");
  const updatePayload = {
    fullName: document.getElementById("fullName").value.trim(),
    age: parseInt(document.getElementById("age").value) || null,
    gender: document.getElementById("gender").value || null,
    email: document.getElementById("email").value.trim() || null,
    phone: document.getElementById("phone").value.trim() || null,
    address: document.getElementById("address").value.trim() || null,
    avatar: avatarImg?.dataset?.avatarPath || null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/customer/profile/update`, {
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
      result.message || "🎉 Cập nhật thông tin thành công!",
      "success",
    );
    loadCustomerProfile(token);
  } catch (error) {
    console.error("Lỗi cập nhật Profile:", error);
    showPetToast("Mất kết nối đường truyền tới máy chủ!", "error");
  }
}

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
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI5MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (!path || path.trim() === "") return defaultSvg;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  )
    return path;
  return `http://localhost:8000/${path.startsWith("/") ? path.slice(1) : path}`;
}

function openSupportChat() {
  showPetToast("🎧 Đang kết nối tới bộ phận Tư vấn PetCare...", "success");
}

function showPetToast(message, type = "success") {
  let container = document.getElementById("pet-toast-container");
  if (!container && window.parent && window.parent.document) {
    container = window.parent.document.getElementById("pet-toast-container");
  }
  if (!container) {
    container = document.createElement("div");
    container.id = "pet-toast-container";
    container.style.cssText =
      "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `pet-toast ${type}`;
  toast.style.cssText = `padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; background: ${
    type === "success" ? "#52c41a" : "#ff4d4f"
  }`;
  toast.innerHTML = `<span>${type === "success" ? "🎉" : "❌"}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
