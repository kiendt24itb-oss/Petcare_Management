/**
 * =============================================================================
 * Register.js
 * -----------------------------------------------------------------------------
 * Chức năng:
 * - Thu thập dữ liệu từ Form Đăng ký HTML.
 * - Gửi request dạng JSON POST tới Backend API (/api/register).
 * - Hiển thị thông báo (Toast notification) thành công hoặc thất bại.
 * =============================================================================
 */

// Định nghĩa URL gốc của Backend API (Cấu hình tùy thuộc vào môi trường chạy, ví dụ localhost)
const API_BASE_URL = "http://localhost/petcare_management_v2_api/index.php";
/**
 * 1. Hàm xử lý Đăng ký tài khoản khi Submit Form
 */
async function submitRegister(event) {
  // Ngăn chặn sự kiện reload trang mặc định của Form
  event.preventDefault();

  // Lấy giá trị thực tế từ các ô input thông qua ID
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPwd").value;
  const confirm_password = document.getElementById("confirmPwd").value;

  // Chuẩn bị object data khớp 100% với cấu trúc AccountService xử lý đầu vào
  const requestData = {
    username: username,
    email: email,
    password: password,
    confirm_password: confirm_password,
  };

  try {
    // Thực hiện lệnh Fetch API gửi POST request dạng JSON
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(requestData),
    });

    // Đọc dữ liệu JSON phản hồi từ Backend (qua ResponseHelper định dạng)
    const result = await response.json();

    if (response.status === 201 || result.status === true) {
      // Đăng ký thành công!
      showToast(
        result.message || "Đăng ký tài khoản thành công! 🎉",
        "success",
      );

      // Xóa sạch dữ liệu trên form sau khi tạo tài khoản xong
      event.target.reset();

      // Tự động chuyển hướng khách hàng sang form Đăng nhập sau 1.5 giây
      setTimeout(() => {
        if (typeof loadAuthComponent === "function") {
          loadAuthComponent("login");
        } else {
          alert("Đăng ký thành công! Vui lòng chuyển sang trang Đăng nhập.");
        }
      }, 1500);
    } else {
      // Backend trả về lỗi nghiệp vụ (Ví dụ: trùng email, trùng tên đăng nhập...)
      showToast(
        result.message || "Đăng ký thất bại. Vui lòng thử lại!",
        "error",
      );
    }
  } catch (error) {
    // Lỗi kết nối mạng hoặc lỗi server không phản hồi JSON
    console.error("Lỗi kết nối API Register:", error);
    showToast("Không thể kết nối đến hệ thống máy chủ!", "error");
  }
}

/**
 * 2. Hàm ẩn/hiển thị mật khẩu (Mắt xem) công dụng cho các ô input password
 */
function togglePwd(inputId) {
  const pwdInput = document.getElementById(inputId);
  if (!pwdInput) return;

  if (pwdInput.type === "password") {
    pwdInput.type = "text";
  } else {
    pwdInput.type = "password";
  }
}

/**
 * 3. Hàm hiển thị thông báo Toast nhanh gọn, đẹp mắt vào thẻ #pet-toast-container
 */
function showToast(message, type = "success") {
  const container = document.getElementById("pet-toast-container");
  if (!container) {
    // Fallback dùng tạm alert thông thường nếu giao diện chưa load kịp container
    alert(message);
    return;
  }

  // Tạo phần tử toast mới
  const toast = document.createElement("div");
  toast.className = `pet-toast pet-toast-${type}`;
  toast.style.padding = "12px 20px";
  toast.style.margin = "10px 0";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "bold";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  toast.style.background = type === "success" ? "#2ecc71" : "#e74c3c";
  toast.style.animation = "slideIn 0.3s ease-out";

  toast.innerText = message;

  // Đẩy toast vào container hiển thị trên màn hình
  container.appendChild(toast);

  // Tự động biến mất sau 3 giây
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
