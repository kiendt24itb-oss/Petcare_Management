/**
 * =============================================================================
 * Login.js
 * -----------------------------------------------------------------------------
 * Chức năng:
 * - Thu thập dữ liệu đăng nhập từ Form HTML.
 * - Gửi request JSON tới Backend PHP XAMPP (`/api/login`).
 * - Lưu JWT Token và thông tin User vào localStorage sau khi đăng nhập thành công.
 * - Điều hướng người dùng vào trang Dashboard.
 * =============================================================================
 */

// Định nghĩa URL gốc của Backend PHP XAMPP (khớp với file Register.js của ní)
const API_BASE_URL = "http://localhost/petcare_management_v2_api/index.php";

// Biến cờ chặn người dùng click submit liên tục
let isLoginSubmitting = false;

/**
 * 1. Hàm xử lý Đăng Nhập khi Submit Form
 */
async function submitLogin(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Nếu đang gửi request thì chặn không cho bấm tiếp
  if (isLoginSubmitting) return;

  const usernameInput = document.getElementById("loginUsername");
  const pwdInput = document.getElementById("loginPwd");

  if (!usernameInput || !pwdInput) return;

  const username = usernameInput.value.trim();
  const password = pwdInput.value;

  if (!username || !password) {
    showPetToast("Vui lòng nhập tài khoản và mật khẩu!", "error");
    return;
  }

  const loginData = { username: username, password: password };

  try {
    isLoginSubmitting = true;

    // Gọi API Đăng nhập của PHP
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    if (response.status === 200 || result.status === true) {
      // Lấy object data trả về từ ResponseHelper của PHP
      const authData = result.data;

      // Lưu thông tin đăng nhập vào localStorage bằng bộ key petcare
      localStorage.setItem("petcare_token", authData.token);
      localStorage.setItem("petcare_role", authData.role);
      localStorage.setItem("petcare_username", authData.username);
      localStorage.setItem("petcare_accountId", authData.account_id);
      localStorage.setItem("petcare_email", authData.email);

      showPetToast(
        result.message || `Đăng nhập thành công! Đang chuyển hướng...`,
        "success",
      );

      // Tắt modal popup ngay lập tức
      const container = document.getElementById("authModalContainer");
      if (container) container.innerHTML = "";

      // Kiểm tra và cập nhật trạng thái menu header nếu có hàm này
      if (typeof checkLoginStatus === "function") {
        checkLoginStatus();
      }

      // ĐIỀU HƯỚNG TOÀN TRANG: Chuyển hướng sang trang Dashboard sau 1 giây hiển thị Toast
      setTimeout(() => {
        window.location.assign("dashboard/Dashboard.html");
      }, 1000);
    } else {
      // Trường hợp sai tài khoản/mật khẩu hoặc tài khoản bị khóa (Code 401, 400...)
      showPetToast(
        result.message || "Tài khoản hoặc mật khẩu không đúng!",
        "error",
      );
    }
  } catch (error) {
    console.error("Lỗi kết nối API Login:", error);
    showPetToast("Không thể kết nối tới máy chủ Back-End!", "error");
  } finally {
    isLoginSubmitting = false;
  }
}

/**
 * 2. Hàm ẩn/hiển thị mật khẩu (Mắt xem)
 */
function togglePwd(inputId) {
  const passwordInput = document.getElementById(inputId);
  if (!passwordInput) return;
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

/**
 * 3. Hàm đóng Modal khi click ra ngoài vùng overlay
 */
function closeAuthModal(event) {
  const overlay = document.getElementById("authOverlay");
  if (event.target === overlay) {
    if (typeof removeAuthModal === "function") {
      removeAuthModal();
    } else {
      const container = document.getElementById("authModalContainer");
      if (container) container.innerHTML = "";
    }
  }
}

/**
 * 4. Hàm tạo Toast thông báo trượt góc màn hình chuẩn giao diện PetCare
 */
function showPetToast(message, type = "success") {
  const container = document.getElementById("pet-toast-container");
  if (!container) {
    alert(message);
    return;
  }

  // Chặn trùng lặp thông báo giống nhau liên tục
  const existingToasts = container.querySelectorAll(".pet-toast");
  for (let t of existingToasts) {
    if (t.innerText.includes(message)) return;
  }

  const toast = document.createElement("div");
  toast.className = `pet-toast ${type}`;

  // Thêm style nhanh CSS inline để đảm bảo hiển thị đúng nếu file CSS cũ bị lệch
  toast.style.padding = "12px 20px";
  toast.style.margin = "10px 0";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "bold";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  toast.style.background = type === "success" ? "#2ecc71" : "#e74c3c";

  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
