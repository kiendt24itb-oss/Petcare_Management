/**
 * 👤 FILE: Customer_info.js
 * Xử lý cập nhật Profile, Xác thực Email và Upload Avatar
 */

const SERVER_HOST = "http://localhost/petcare_management_v2_api";
const BASE_URL = `${SERVER_HOST}/index.php/api`;

let uploadedAvatarPath = null;
let currentCustomerId = null;
let userEmailVerified = false;

document.addEventListener("DOMContentLoaded", function () {
  // Lấy token linh hoạt từ URL hoặc LocalStorage (đảm bảo không bị vỡ script)
  let token = getAuthToken();

  const urlParams = new URLSearchParams(window.location.search);
  currentCustomerId = urlParams.get("id");

  if (!token) {
    console.warn("⚠️ Chưa tìm thấy Token hợp lệ. Vui lòng đăng nhập!");
    showLocalToast(
      "Không tìm thấy phiên làm việc. Hãy đăng nhập lại!",
      "error",
    );
    return;
  }

  console.log("🔒 Token thông quan thành công:", token);

  // 1. Tải thông tin khách hàng từ API
  loadCustomerProfile(token);

  // 2. Xử lý Upload Ảnh đại diện
  const inputAvatar = document.getElementById("inputAvatar");
  const customerAvatar = document.getElementById("customerAvatar");

  if (inputAvatar) {
    inputAvatar.addEventListener("change", async function (event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showLocalToast(
          "Vui lòng chọn tệp hình ảnh hợp lệ (png, jpg, webp)!",
          "error",
        );
        inputAvatar.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        if (customerAvatar) customerAvatar.src = e.target.result;
      };
      reader.readAsDataURL(file);

      await uploadAvatar(file, token);
      inputAvatar.value = "";
    });
  }

  // 3. Lắng nghe Submit form cập nhật
  const formUpdate = document.getElementById("formUpdateCustomer");
  if (formUpdate) {
    formUpdate.addEventListener("submit", function (event) {
      submitUpdateCustomer(event, token);
    });
  }

  // 4. Lắng nghe nút "Xác thực email" inline
  const btnInlineVerify = document.getElementById("btnInlineVerifyEmail");
  if (btnInlineVerify) {
    btnInlineVerify.addEventListener("click", function () {
      sendEmailVerification(token);
    });
  }

  // 5. Lắng nghe nút "Xác thực ngay" ở Card bên phải
  const btnRightVerify = document.getElementById("btnRightVerifyEmail");
  if (btnRightVerify) {
    btnRightVerify.addEventListener("click", function () {
      sendEmailVerification(token);
    });
  }

  // 6. Lắng nghe nút "Tư vấn ngay"
  const btnSupportChat = document.getElementById("btnSupportChat");
  if (btnSupportChat) {
    btnSupportChat.addEventListener("click", function () {
      openSupportChat();
    });
  }
});

/**
 * 🔑 Hàm lấy Token đa kênh (tránh xịt JS khi chạy trong Iframe)
 */
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
    console.warn("Cross-origin iframe storage access blocked:", e);
  }

  if (token === "null" || token === "undefined" || !token) {
    return null;
  }
  return token.trim();
}

/**
 * 📥 Hàm lấy Profile Khách hàng
 */
async function loadCustomerProfile(token) {
  try {
    let apiEndpoint = `${BASE_URL}/customer/profile`;
    if (currentCustomerId) {
      apiEndpoint = `${BASE_URL}/admin/customers/detail?id=${currentCustomerId}`;
    }

    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      const customer = result.data;

      if (customer.avatar) {
        uploadedAvatarPath = customer.avatar;
        document.getElementById("customerAvatar").src = getImageUrl(
          customer.avatar,
        );
      } else {
        document.getElementById("customerAvatar").src = getImageUrl(null);
      }

      document.getElementById("customerId").value =
        customer.customerCode || "KH-A003";
      document.getElementById("fullName").value = customer.fullName || "";

      const profileNameEl = document.getElementById("profileName");
      if (profileNameEl) {
        profileNameEl.innerText = customer.fullName || "Khách hàng";
      }

      document.getElementById("age").value = customer.age || "";
      document.getElementById("phone").value = customer.phone || "";
      document.getElementById("gender").value = customer.gender || "";
      document.getElementById("address").value = customer.address || "";
      document.getElementById("email").value = customer.email || "";

      userEmailVerified = customer.isEmailVerified || false;
      updateEmailStatusUI(userEmailVerified);

      if (!currentCustomerId && customer.fullName) {
        localStorage.setItem("petcare_username", customer.fullName);
        try {
          if (window.parent && window.parent.document) {
            const parentNameEl =
              window.parent.document.getElementById("userProfileName");
            if (parentNameEl) parentNameEl.innerText = customer.fullName;
          }
        } catch (e) {
          console.warn("Parent DOM access error:", e);
        }
      }
    } else {
      showLocalToast(
        result.message || `Lỗi lấy dữ liệu: ${response.status}`,
        "error",
      );
    }
  } catch (error) {
    console.error("Lỗi kết nối endpoint profile:", error);
    showLocalToast("Không thể kết nối đến máy chủ dữ liệu!", "error");
  }
}

/**
 * 📤 Hàm gửi thông tin cập nhật
 */
async function submitUpdateCustomer(event, token) {
  event.preventDefault();

  const updateData = {
    fullName: document.getElementById("fullName").value.trim(),
    age: parseInt(document.getElementById("age").value) || null,
    gender: document.getElementById("gender").value || null,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    avatar: uploadedAvatarPath || null,
  };

  let apiEndpoint = `${BASE_URL}/customer/profile`;
  if (currentCustomerId) {
    apiEndpoint = `${BASE_URL}/admin/customers/update?id=${currentCustomerId}`;
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      showLocalToast("🎉 Lưu thay đổi thông tin thành công!", "success");

      const savedData = result.data || updateData;
      document.getElementById("profileName").innerText = savedData.fullName;

      if (!currentCustomerId) {
        localStorage.setItem("petcare_username", savedData.fullName);
        try {
          if (window.parent && window.parent.document) {
            const parentNameEl =
              window.parent.document.getElementById("userProfileName");
            if (parentNameEl) parentNameEl.innerText = savedData.fullName;
          }
        } catch (e) {
          console.warn("Parent DOM access error:", e);
        }
      }

      loadCustomerProfile(token);
    } else {
      showLocalToast(result.message || "Cập nhật hồ sơ thất bại!", "error");
    }
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    showLocalToast("Mất kết nối đường truyền tới máy chủ!", "error");
  }
}

/**
 * ✉️ Hàm gửi Email xác thực
 */
async function sendEmailVerification(token) {
  const emailInput = document.getElementById("email").value.trim();
  if (!emailInput) {
    showLocalToast("Vui lòng nhập địa chỉ Email trước khi xác thực!", "error");
    return;
  }

  try {
    showLocalToast("⏳ Đang gửi yêu cầu xác thực tới Email...", "success");

    const response = await fetch(
      `${BASE_URL}/customer/send-email-verification`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput }),
      },
    );

    const result = await response.json();

    if (response.ok && result.status === true) {
      showLocalToast(
        "📩 Đã gửi liên kết xác thực! Vui lòng kiểm tra hộp thư Email.",
        "success",
      );
    } else {
      showLocalToast(result.message || "Gửi email xác thực thất bại!", "error");
    }
  } catch (error) {
    console.error("Lỗi xác thực email:", error);
    showLocalToast("Mất kết nối tới máy chủ gửi thư!", "error");
  }
}

/**
 * 🎨 Đồng bộ UI Xác thực Email
 */
function updateEmailStatusUI(isVerified) {
  const badgeRow = document.getElementById("emailStatusBadge");
  const btnInline = document.getElementById("btnInlineVerifyEmail");
  const btnRight = document.getElementById("btnRightVerifyEmail");

  if (isVerified) {
    if (badgeRow) {
      badgeRow.className = "cstm-status-row verified";
      badgeRow.style.color = "#52c41a";
      badgeRow.innerHTML = `<span>🟢</span><span>Đã xác thực</span>`;
    }
    if (btnInline) {
      btnInline.innerText = "✓ Đã xác thực";
      btnInline.style.color = "#52c41a";
      btnInline.style.borderColor = "#b7eb8f";
      btnInline.disabled = true;
    }
    if (btnRight) {
      btnRight.innerText = "✓ Email Đã Xác Thực";
      btnRight.style.background = "#52c41a";
      btnRight.disabled = true;
    }
  } else {
    if (badgeRow) {
      badgeRow.className = "cstm-status-row unverified";
      badgeRow.style.color = "#ff4d4f";
      badgeRow.innerHTML = `<span>🔴</span><span>Chưa xác thực</span>`;
    }
    if (btnInline) {
      btnInline.innerText = "✉ Xác thực email";
      btnInline.style.color = "var(--primary-orange)";
      btnInline.style.borderColor = "#ffccbc";
      btnInline.disabled = false;
    }
    if (btnRight) {
      btnRight.innerText = "✉ Xác thực ngay";
      btnRight.style.background = "var(--primary-orange)";
      btnRight.disabled = false;
    }
  }
}

/**
 * 🎧 Mở Khung Chat Hỗ Trợ
 */
function openSupportChat() {
  try {
    if (window.parent && typeof window.parent.openPetCareChat === "function") {
      window.parent.openPetCareChat();
      return;
    }
  } catch (e) {
    console.warn("Parent chat function error:", e);
  }
  showLocalToast("🎧 Đang kết nối tới bộ phận Tư vấn PetCare...", "success");
}

/**
 * 📸 Upload Avatar
 */
async function uploadAvatar(file, token) {
  const formData = new FormData();
  formData.append("avatar_file", file);

  try {
    const response = await fetch(`${BASE_URL}/customer/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      uploadedAvatarPath = result.data;
      const fullUrl = getImageUrl(uploadedAvatarPath);
      document.getElementById("customerAvatar").src = fullUrl;

      if (!currentCustomerId) {
        try {
          if (window.parent && window.parent.document) {
            const parentAvatar =
              window.parent.document.getElementById("userAvatar");
            if (parentAvatar) parentAvatar.src = fullUrl;
          }
        } catch (e) {
          console.warn("Parent avatar update error:", e);
        }
      }
      showLocalToast("Tải ảnh đại diện lên thành công!", "success");
    } else {
      showLocalToast(result.message || "Upload ảnh thất bại!", "error");
    }
  } catch (error) {
    console.error("Lỗi upload avatar:", error);
    showLocalToast("Không thể upload ảnh lên máy chủ!", "error");
  }
}

/**
 * 🛠️ Chuẩn hóa đường dẫn Ảnh
 */
function getImageUrl(path) {
  const defaultSvg =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (!path || path.trim() === "") return defaultSvg;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  ) {
    return path;
  }
  return `${SERVER_HOST}/${path.startsWith("/") ? path.slice(1) : path}`;
}

/**
 * 🍿 Hiển thị Toast thông báo
 */
function showLocalToast(message, type = "success") {
  let container = null;
  try {
    if (window.parent && window.parent.document) {
      container = window.parent.document.getElementById("pet-toast-container");
    }
  } catch (e) {
    console.warn("Parent toast container error:", e);
  }

  if (!container) {
    container = document.getElementById("pet-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "pet-toast-container";
      container.style.cssText =
        "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
      document.body.appendChild(container);
    }
  }

  const toast = document.createElement("div");
  toast.style.cssText = `padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: ${type === "success" ? "#52c41a" : "#ff4d4f"}`;

  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}
