/**
 * =============================================================================
 * Dashboard.js
 * -----------------------------------------------------------------------------
 * Chức năng:
 * - Bảo mật trang quản trị: Kiểm tra Token hợp lệ, chặn vào lén.
 * - Phân quyền Menu động xuất ra Sidebar dựa vào Role của người dùng (ADMIN, STAFF, CUSTOMER).
 * - Hiển thị thông tin Mini Profile (Username, Badge danh hiệu, Avatar từ DB).
 * - Đồng bộ hóa từ khóa tìm kiếm (Search Box) xuyên suốt Iframe nội dung.
 * - Xử lý sự kiện đăng xuất, làm sạch bộ nhớ phiên làm việc.
 * =============================================================================
 */

// Định nghĩa URL gốc của API Back-End PHP XAMPP
const API_BASE_URL = "http://localhost/petcare_management_v2_api/index.php";

// Chuỗi ảnh đại diện SVG gradient hồng mặc định khi tài khoản chưa cập nhật ảnh
const DEFAULT_SVG_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

document.addEventListener("DOMContentLoaded", function () {
  // 1. 🔒 CHẶN VÀO LÉN - Kiểm tra quyền trong localStorage
  const token = localStorage.getItem("petcare_token");
  const username = localStorage.getItem("petcare_username") || "Người dùng";
  const role = localStorage.getItem("petcare_role");

  if (!token) {
    alert(
      "🔒 Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập! Vui lòng quay lại.",
    );
    window.location.href = "/index.html";
    return;
  }

  // 2. 👤 HIỂN THỊ THÔNG TIN USER LÊN MINI PROFILE
  document.getElementById("userProfileName").innerText = username;
  loadUserAvatar(token);

  // Gắn danh hiệu hiển thị (Badge) tương ứng với từng vai trò tài khoản
  const badge = document.getElementById("userRoleBadge");
  if (badge) {
    if (role === "ADMIN") {
      badge.innerText = "👑 Quản trị viên";
      badge.style.background = "#fff2e8";
      badge.style.color = "#fa541c";
    } else if (role === "STAFF") {
      badge.innerText = "🧑‍⚕️ Nhân viên";
      badge.style.background = "#e6f7ff";
      badge.style.color = "#1890ff";
    } else {
      badge.innerText = "🐾 Khách hàng";
      badge.style.background = "#f6ffed";
      badge.style.color = "#52c41a";
    }
  }

  // 3. 📂 ĐỊNH NGHĨA DANH SÁCH MENU THEO TÍNH NĂNG TỪNG VAI TRÒ
  const menuData = {
    CUSTOMER: [
      {
        text: "👤 Thông tin cá nhân",
        url: "/user/customer/Customer_info.html",
      },
      { text: "🐱 Thông tin thú cưng", url: "/user/pet/Pet_list.html" },
      { text: "📅 Đặt lịch dịch vụ", url: "/user/booking/Booking_list.html" },
    ],
    STAFF: [
      {
        text: "👤 Thông tin cá nhân",
        url: "/staff/staff_profile/Staff_profile.html",
      },
      {
        text: "⏰ Chấm công hàng ngày",
        url: "/staff/attendance/Attendance.html",
      },
      {
        text: "📅 Xem lịch làm việc",
        url: "/staff/staff_schedule/Staff_schedule.html",
      },
    ],
    ADMIN: [
      { text: "📊 Thống kê tổng quan", url: "/admin/overview/Overview.html" },
      {
        text: "👥 Quản lý nhân viên",
        url: "/admin/staffManagement/StaffManagement.html",
        showSearch: true,
      },
      {
        text: "👨‍💼 Quản lý khách hàng",
        url: "/admin/customerManagement/CustomerManagement.html",
        showSearch: true,
      },
      {
        text: "📦 Các gói dịch vụ",
        url: "/admin/serviceManagement/ServiceManagement.html",
      },
      {
        text: "🏨 Quản lý vận hành",
        url: "/admin/dashboardOperation/DashboardOperation.html",
      },
      {
        text: "🏢 Phòng & Vị trí làm việc",
        url: "/admin/roomManagement/RoomManagement.html",
      },
    ],
  };

  // 🛠️ ĐIỀU KHIỂN HIỂN THỊ CÁC THÀNH PHẦN TOPBAR DỰA THEO ROLE TÀI KHOẢN
  const searchContainer = document.getElementById("topbarSearchContainer");
  const portalWrapper = document.getElementById("cosmicPortalWrapper");
  const customerNotiBell = document.getElementById("customerNotiBell");

  if (role === "CUSTOMER") {
    if (searchContainer) searchContainer.style.display = "none";
    if (portalWrapper) portalWrapper.style.display = "none";
    if (customerNotiBell) {
      customerNotiBell.style.display = "inline-block";
      initCustomerNotifications(token); // Tạm giữ hàm gọi thông báo (Sẽ làm API sau)
    }
  } else {
    // Với vai trò ADMIN hoặc STAFF
    if (customerNotiBell) customerNotiBell.style.display = "none";
    if (portalWrapper) portalWrapper.style.display = "inline-block";
    if (searchContainer) searchContainer.style.display = "none"; // Mặc định ẩn ô tìm kiếm ở trang đầu tiên
  }

  // 4. 🖨️ ĐỔ MENU ĐỘNG RA SIDEBAR GIAO DIỆN
  const menuContainer = document.getElementById("dynamicMenu");
  const iframeContainer = document.getElementById("mainFrame");
  const userMenu = menuData[role] || menuData["CUSTOMER"];

  if (menuContainer) {
    menuContainer.innerHTML = "";

    userMenu.forEach((item, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      // Đính kèm Token lên URL Iframe giúp các trang con tự động xác thực mà không cần login lại
      const urlWithToken = `${item.url}?token=${encodeURIComponent(token)}`;

      a.href = urlWithToken;
      a.target = "mainFrame";
      a.innerHTML = item.text;

      // Kích hoạt nạp trang đầu tiên làm mặc định khi mở Dashboard lên
      if (index === 0 && iframeContainer) {
        a.classList.add("active");
        iframeContainer.src = urlWithToken;

        if (role === "ADMIN" && searchContainer) {
          searchContainer.style.display = item.showSearch ? "flex" : "none";
        }
      }

      // Xử lý chuyển đổi qua lại giữa các tab menu
      a.addEventListener("click", function () {
        document
          .querySelectorAll("#dynamicMenu a")
          .forEach((nav) => nav.classList.remove("active"));
        this.classList.add("active");

        // Dọn sạch text trong ô tìm kiếm tránh xung đột bộ lọc khi sang trang mới
        const topbarSearch = document.getElementById("topbarSearch");
        if (topbarSearch) topbarSearch.value = "";

        // 🔍 Ẩn/Hiện thanh tìm kiếm thông minh thời gian thực cho ADMIN
        if (role === "ADMIN" && searchContainer) {
          searchContainer.style.display = item.showSearch ? "flex" : "none";
        }
      });

      li.appendChild(a);
      menuContainer.appendChild(li);
    });
  }

  // 🌟 5. LẮNG NGHE Ô TÌM KIẾM - BẮN TỪ KHÓA XUYÊN QUA IFRAME CON (POSTMESSAGE)
  const topbarSearch = document.getElementById("topbarSearch");
  if (topbarSearch) {
    topbarSearch.addEventListener("input", function () {
      const keyword = this.value.trim();
      const iframe = document.getElementById("mainFrame");

      if (iframe && iframe.contentWindow) {
        // Gửi thông điệp chứa từ khóa trực tiếp vào trong Iframe đang hiển thị
        iframe.contentWindow.postMessage(
          { action: "SEARCH_DATA", keyword: keyword },
          "*",
        );
      }
    });
  }

  // ⚡ 6. ĐÓNG MỞ DROPDOWN CHUÔNG THÔNG BÁO KHÁCH HÀNG
  const notiBellBtn = document.getElementById("notiBellBtn");
  const notiDropdown = document.getElementById("notiDropdown");

  if (notiBellBtn && notiDropdown) {
    notiBellBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      notiDropdown.classList.toggle("open");
    });

    document.addEventListener("click", function () {
      notiDropdown.classList.remove("open");
    });
  }

  // 🚪 7. XỬ LÝ SỰ KIỆN NÚT ĐĂNG XUẤT
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function (event) {
      event.preventDefault();
      // Xóa toàn bộ dấu vết lưu trữ phiên làm việc trong bộ nhớ trình duyệt
      localStorage.removeItem("petcare_token");
      localStorage.removeItem("petcare_username");
      localStorage.removeItem("petcare_role");
      localStorage.removeItem("petcare_accountId");
      localStorage.removeItem("petcare_email");

      window.location.href = "/index.html";
    });
  }
});

/**
 * 📥 HÀM TẢI AVATAR TÀI KHOẢN TỪ BACK-END PHP
 */
async function loadUserAvatar(token) {
  try {
    // Gọi API lấy thông tin Profile tài khoản đang đăng nhập hiện tại
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return;

    const result = await response.json();
    if (result.status !== true || !result.data) return;

    const avatarEl = document.getElementById("userAvatar");
    if (!avatarEl) return;

    // Trích xuất đường dẫn file ảnh từ data trả về của PHP
    const avatarPath = result.data.avatar;

    if (avatarPath) {
      avatarEl.src = getImageUrl(avatarPath);
    } else {
      avatarEl.src = DEFAULT_SVG_AVATAR;
    }
  } catch (error) {
    console.error("Lỗi tải thông tin avatar tài khoản:", error);
  }
}

/**
 * 🛠️ CHUẨN HÓA ĐƯỜNG DẪN ẢNH ĐẦU RA
 */
function getImageUrl(path) {
  if (!path || path.trim() === "") return DEFAULT_SVG_AVATAR;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  ) {
    return path;
  }
  // Nếu là đường dẫn tương đối từ DB, nối kèm URL gốc của máy chủ XAMPP để hiển thị ảnh
  return "http://localhost/petcare_management_v2_api" + path;
}

/**
 * 🔔 HÀM ĐỢI ĐỔ DỮ LIỆU CHUÔNG THÔNG BÁO CHO CUSTOMER
 * (Sẽ được viết API hoàn thiện ở các module lịch hẹn sau)
 */
async function initCustomerNotifications(token) {
  const notiCount = document.getElementById("notiCount");
  const notiBodyList = document.getElementById("notiBodyList");
  if (!notiBodyList) return;

  // Trạng thái chờ xử lý API ở các bước làm module Đặt lịch tiếp theo
  notiBodyList.innerHTML = `<div class="noti-empty-state">Chưa có thông báo lịch hẹn nào.</div>`;
  if (notiCount) notiCount.style.display = "none";
}
