/**
 * 👤 FILE: Customer_info.js
 * Xử lý thông tin cá nhân khách hàng (Đồng bộ Back-end PHP XAMPP thuần & JWT qua index.php)
 */

// 🌐 Cấu hình địa chỉ Server PHP XAMPP tập trung
const SERVER_HOST = "http://localhost/petcare_management_v2_api";

// 🔥 NÂNG CẤP CHÍ MẠNG: Bổ sung /index.php để định tuyến PHP thuần gánh endpoint ảo trên XAMPP thành công
const BASE_URL = `${SERVER_HOST}/index.php/api`;

let uploadedAvatarPath = null; // Lưu đường dẫn tương đối (Ví dụ: /uploads/avatars/abc.jpg)

document.addEventListener("DOMContentLoaded", function () {
  // 🔑 Lấy token từ URL hoặc localStorage
  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get("token");

  if (!token) {
    token = localStorage.getItem("petcare_token");
  }
  if (!token && window.parent && window.parent.localStorage) {
    token = window.parent.localStorage.getItem("petcare_token");
  }

  // Kiểm tra Token hợp lệ trước khi gọi API
  if (
    !token ||
    token === "null" ||
    token === "undefined" ||
    token.trim() === ""
  ) {
    console.error("❌ Front-End chặn đứng: Không tìm thấy Token hợp lệ!");
    showLocalToast("Phiên làm việc hết hạn. Vui lòng đăng nhập lại!", "error");
    return;
  }

  console.log("🔒 Token thông quan thành công:", token);
  loadCustomerProfile(token);

  // 📸 XỬ LÝ CHỌN ẢNH ĐẠI DIỆN TRỰC QUAN (PREVIEW & UPLOAD)
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

      // Xem trước ảnh tạm bằng FileReader
      const reader = new FileReader();
      reader.onload = function (e) {
        customerAvatar.src = e.target.result;
      };
      reader.readAsDataURL(file);

      // 🔥 ĐẨY FILE LÊN SERVER PHP XAMPP
      await uploadAvatar(file, token);
      inputAvatar.value = "";
    });
  }

  // 💾 LẮNG NGHE SỰ KIỆN LƯU THAY ĐỔI (SUBMIT FORM)
  const formUpdate = document.getElementById("formUpdateCustomer");
  if (formUpdate) {
    formUpdate.addEventListener("submit", function (event) {
      submitUpdateCustomer(event, token);
    });
  }

  // 🔄 LẮNG NGHE SỰ KIỆN BẤM NÚT "ĐẶT LẠI" (RESET FORM)
  const btnReset = document.getElementById("btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", function () {
      loadCustomerProfile(token);
      showLocalToast("Đã khôi phục lại dữ liệu ban đầu!", "success");
    });
  }
});

/**
 * 📥 Hàm gọi API lấy thông tin Profile Khách Hàng đổ vào các ô dữ liệu
 */
async function loadCustomerProfile(token) {
  try {
    // Gọi trúng endpoint qua lõi index.php của PHP XAMPP
    const response = await fetch(`${BASE_URL}/customer/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      const customer = result.data; // Bóc tách qua thuộc tính data của ResponseHelper
      console.log("📊 Dữ liệu khách hàng nhận từ PHP:", customer);

      // Găm lại đường dẫn avatar cũ từ DB
      if (customer.avatar) {
        uploadedAvatarPath = customer.avatar;
        document.getElementById("customerAvatar").src = getImageUrl(
          customer.avatar,
        );
      } else {
        document.getElementById("customerAvatar").src = getImageUrl(null);
      }

      // Đổ dữ liệu vào các ô Input HTML (Thuộc tính dạng camelCase từ Entity PHP)
      document.getElementById("customerId").value =
        customer.customerCode || "Chưa cấp";
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

      // 🌟 ĐỒNG BỘ HOÁ LÊN LOCALSTORAGE VÀ DASHBOARD CHA
      if (customer.fullName) {
        localStorage.setItem("petcare_username", customer.fullName);
        if (window.parent && window.parent.document) {
          const parentNameEl =
            window.parent.document.getElementById("userProfileName");
          if (parentNameEl) parentNameEl.innerText = customer.fullName;
        }
      }
    } else {
      showLocalToast(
        result.message || `Lỗi lấy thông tin: ${response.status}`,
        "error",
      );
    }
  } catch (error) {
    console.error("Lỗi kết nối endpoint profile:", error);
    showLocalToast("Không thể kết nối đến máy chủ dữ liệu!", "error");
  }
}

/**
 * 📤 Hàm xử lý đóng gói dữ liệu gửi lên Back-End để lưu lại
 */
async function submitUpdateCustomer(event, token) {
  event.preventDefault();

  // Đóng gói JSON theo đúng chuẩn thuộc tính camelCase của Entity Customer PHP
  const updateData = {
    fullName: document.getElementById("fullName").value.trim(),
    age: parseInt(document.getElementById("age").value) || null,
    gender: document.getElementById("gender").value || null,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    avatar: uploadedAvatarPath || null,
  };

  try {
    console.log("===== ĐANG GỬI UPDATE CHUẨN JSON PHP =====", updateData);
    const response = await fetch(`${BASE_URL}/customer/profile`, {
      method: "POST", // File routes/api.php của bạn đã hỗ trợ nhận diện cả POST và PUT
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      showLocalToast("🎉 Lưu thay đổi thông tin thành công!", "success");

      const savedData = result.data;
      document.getElementById("profileName").innerText = savedData.fullName;

      if (window.parent) {
        localStorage.setItem("petcare_username", savedData.fullName);
        const parentNameEl =
          window.parent.document.getElementById("userProfileName");
        if (parentNameEl) parentNameEl.innerText = savedData.fullName;
      }

      loadCustomerProfile(token); // Tải lại form để đồng bộ dữ liệu mới nhất
    } else {
      showLocalToast(result.message || "Cập nhật hồ sơ thất bại!", "error");
    }
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    showLocalToast("Mất kết nối đường truyền tới máy chủ PHP!", "error");
  }
}

/**
 * 📸 Hàm upload avatar lên Server PHP
 */
async function uploadAvatar(file, token) {
  const formData = new FormData();
  formData.append("avatar_file", file); // Tên key này trùng khớp với $_FILES['avatar_file'] bên PHP

  try {
    console.log("🚀 Chuẩn bị gửi File thông qua FormData:", file.name);

    // Đường dẫn API xử lý upload hình ảnh đổ trực diện qua lõi index.php
    const response = await fetch(`${BASE_URL}/customer/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Trình duyệt tự sinh Content-Type kèm Boundary phù hợp cho file nhị phân
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      // PHP trả về đường dẫn tương đối dạng: /uploads/avatars/avatar_65a1b2c3.png
      uploadedAvatarPath = result.data;
      console.log("📸 Đường dẫn tương đối nhận từ PHP:", uploadedAvatarPath);

      const fullUrl = getImageUrl(uploadedAvatarPath);
      document.getElementById("customerAvatar").src = fullUrl;

      // Đồng bộ ảnh nhỏ ra ngoài thanh Sidebar Dashboard
      if (window.parent) {
        const parentAvatar =
          window.parent.document.getElementById("userAvatar");
        if (parentAvatar) {
          parentAvatar.src = fullUrl;
        }
      }
      showLocalToast("Tải ảnh đại diện lên thành công!", "success");
    } else {
      showLocalToast(result.message || "Upload ảnh thất bại!", "error");
    }
  } catch (error) {
    console.error("Lỗi upload avatar:", error);
    showLocalToast("Không thể upload ảnh lên máy chủ PHP!", "error");
  }
}

/**
 * 🛠️ Hàm chuẩn hóa đường dẫn ảnh thông minh
 */
function getImageUrl(path) {
  // Ảnh mặc định SVG Base64 nếu path trống
  const defaultSvg =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (!path || path.trim() === "") {
    return defaultSvg;
  }
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  ) {
    return path;
  }
  // Nối trực tiếp với HOST gốc của XAMPP (Ví dụ: http://localhost/petcare_management_v2_api/uploads/avatars/abc.png)
  return SERVER_HOST + path;
}

/**
 * 🍿 Hàm bắn Toast thông báo trượt đồng bộ Dashboard
 */
function showLocalToast(message, type = "success") {
  let container = null;
  if (window.parent && window.parent.document) {
    container = window.parent.document.getElementById("pet-toast-container");
  }
  if (!container) {
    container = document.getElementById("pet-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "pet-toast-container";
      document.body.appendChild(container);
    }
  }
  const toast = document.createElement("div");
  toast.className = `pet-toast ${type}`;
  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
