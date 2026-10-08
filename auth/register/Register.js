{
  // Cấu hình URL cho Laravel API mới
  const API_BASE_URL = "http://localhost:8000/api/v1";
  let isRegisterSubmitting = false;

  /**
   * Khởi tạo form Đăng ký
   */
  function initializeRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form || form.dataset.bound === "true") return;

    form.addEventListener("submit", submitRegister);
    form.dataset.bound = "true";
  }

  window.initializeRegisterForm = initializeRegisterForm;

  /**
   * Xử lý Submit Form Đăng ký
   */
  async function submitRegister(event) {
    event.preventDefault();
    if (isRegisterSubmitting) return;

    const form = event.currentTarget;
    const username = document.getElementById("regUsername")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const password = document.getElementById("regPwd")?.value;
    const passwordConfirmation = document.getElementById("confirmPwd")?.value;

    // Validate phía Frontend
    if (!username || !email || !password || !passwordConfirmation) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    if (password !== passwordConfirmation) {
      showToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Mật khẩu phải chứa ít nhất 6 ký tự.", "error");
      return;
    }

    isRegisterSubmitting = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const result = await readApiResponse(response);

      // Nếu API trả về lỗi hoặc HTTP status không ok
      if (!response.ok || result.success === false) {
        const errorMsg = getApiErrorMessage(result, "Đăng ký thất bại.");
        showToast(errorMsg, "error");
        return;
      }

      // Đăng ký thành công
      showToast(result.message || "Đăng ký tài khoản thành công!", "success");
      form.reset();

      // Chuyển sang form Đăng nhập sau 1.5s
      window.setTimeout(() => {
        if (typeof loadAuthComponent === "function") {
          loadAuthComponent("login");
        } else {
          alert("Đăng ký thành công! Vui lòng chuyển sang trang Đăng nhập.");
        }
      }, 1500);
    } catch (error) {
      console.error("Lỗi kết nối API Register:", error);
      showToast(
        error instanceof TypeError
          ? "Không thể kết nối đến máy chủ API (Kiểm tra lại Laravel Serve)!"
          : error.message,
        "error",
      );
    } finally {
      isRegisterSubmitting = false;
    }
  }

  /**
   * Đọc dữ liệu JSON an toàn từ Response
   */
  async function readApiResponse(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error("Máy chủ trả về phản hồi không hợp lệ.");
    }
  }

  /**
   * Bóc tách thông báo lỗi từ Laravel Validation Response
   */
  function getApiErrorMessage(result, fallback) {
    if (result?.errors) {
      // Trường hợp Laravel trả về mảng lỗi validation: { errors: { email: ["Email đã tồn tại"] } }
      if (typeof result.errors === "object") {
        const firstErrorList = Object.values(result.errors);
        if (firstErrorList.length > 0) {
          const firstMsg = Array.isArray(firstErrorList[0])
            ? firstErrorList[0][0]
            : firstErrorList[0];
          if (firstMsg) return firstMsg;
        }
      }
    }
    return result?.message || fallback;
  }

  /**
   * Bật/Tắt ẩn hiện mật khẩu
   */
  window.togglePwd = function (inputId) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput) {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    }
  };

  /**
   * Hiển thị Toast thông báo
   */
  function showToast(message, type = "success") {
    const container = document.getElementById("pet-toast-container");
    if (!container) {
      alert(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `pet-toast pet-toast-${type}`;
    toast.style.padding = "12px 20px";
    toast.style.margin = "10px 0";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    toast.style.background = type === "success" ? "#2ecc71" : "#e74c3c";
    toast.style.transition = "all 0.4s ease";
    toast.textContent = message;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      window.setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // Tự động khởi tạo khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRegisterForm);
  } else {
    initializeRegisterForm();
  }
}
