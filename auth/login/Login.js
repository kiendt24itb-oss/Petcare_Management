{
  // URL API Laravel mới
  const API_BASE_URL = "http://localhost:8000/api/v1";
  let isLoginSubmitting = false;

  /**
   * Khởi tạo Form Đăng Nhập
   */
  const initializeLoginForm = function () {
    const form = document.getElementById("loginForm");
    if (!form || form.dataset.bound === "true") return;

    form.addEventListener("submit", submitLogin);
    form.dataset.bound = "true";
  };

  window.initializeLoginForm = initializeLoginForm;

  /**
   * Xử lý Submit Đăng Nhập
   */
  const submitLogin = async function (event) {
    event.preventDefault();
    if (isLoginSubmitting) return;

    const username = document.getElementById("loginUsername")?.value.trim();
    const password = document.getElementById("loginPwd")?.value;

    if (!username || !password) {
      showPetToast("Vui lòng nhập tài khoản/email và mật khẩu!", "error");
      return;
    }

    isLoginSubmitting = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await readApiResponse(response);

      if (!response.ok || result.success !== true) {
        showPetToast(
          getApiErrorMessage(result, "Đăng nhập thất bại."),
          "error",
        );
        return;
      }

      const authData = result.data;
      if (!authData?.access_token || !authData.user) {
        throw new Error("Dữ liệu đăng nhập trả về từ máy chủ không hợp lệ.");
      }

      // Lưu thông tin xác thực vào LocalStorage
      localStorage.setItem("petcare_token", authData.access_token);
      localStorage.setItem("petcare_role", authData.user.role || "");
      localStorage.setItem(
        "petcare_username",
        authData.user.display_name || authData.user.username || "",
      );
      localStorage.setItem("petcare_accountId", authData.user.account_id || "");
      localStorage.setItem("petcare_email", authData.user.email || "");

      showPetToast(
        result.message || "Đăng nhập thành công! Đang chuyển hướng...",
        "success",
      );

      // Đóng modal đăng nhập (nếu có) và cập nhật giao diện
      const container = document.getElementById("authModalContainer");
      if (container) container.innerHTML = "";
      if (typeof checkLoginStatus === "function") checkLoginStatus();

      // Chuyển hướng sau 1 giây
      window.setTimeout(() => {
        window.location.assign("dashboard/Dashboard.html");
      }, 1000);
    } catch (error) {
      console.error("Lỗi kết nối API Login:", error);
      showPetToast(
        error instanceof TypeError
          ? "Không thể kết nối đến máy chủ API (Kiểm tra Laravel Serve)!"
          : error.message,
        "error",
      );
    } finally {
      isLoginSubmitting = false;
    }
  };

  /**
   * Đọc dữ liệu JSON an toàn
   */
  const readApiResponse = async function (response) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
    }
  };

  /**
   * Bóc tách thông báo lỗi Validation / Business Error
   */
  const getApiErrorMessage = function (result, fallback) {
    const validationErrors = result?.errors;
    if (validationErrors) {
      if (typeof validationErrors === "object") {
        const firstErrorList = Object.values(validationErrors);
        if (firstErrorList.length > 0) {
          const firstMsg = Array.isArray(firstErrorList[0])
            ? firstErrorList[0][0]
            : firstErrorList[0];
          if (firstMsg) return firstMsg;
        }
      }
    }
    return result?.message || fallback;
  };

  /**
   * Bật/Tắt xem mật khẩu
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
  const showPetToast = function (message, type = "success") {
    const container = document.getElementById("pet-toast-container");
    if (!container) {
      alert(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `pet-toast ${type}`;
    toast.style.padding = "12px 20px";
    toast.style.margin = "10px 0";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    toast.style.background = type === "success" ? "#2ecc71" : "#e74c3c";
    toast.style.transition = "all 0.4s ease";
    toast.textContent = `${type === "success" ? "🎉" : "❌"} ${message}`;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      window.setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  // Khởi tạo khi DOM tải xong
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLoginForm);
  } else {
    initializeLoginForm();
  }
}
