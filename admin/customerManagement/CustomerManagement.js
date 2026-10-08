/**
 * 👤 FILE: CustomerManagement.js
 * Quản lý danh sách khách hàng và thú cưng dành cho Admin
 * Đồng bộ API Back-end PHP XAMPP & JWT
 */

// 🌐 Cấu hình địa chỉ Server PHP XAMPP
const SERVER_HOST = "http://localhost/petcare_management_v2_api";
const BASE_URL = `${SERVER_HOST}/index.php/api`;

// Dữ liệu & Cấu hình Phân trang
let customers = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 5;
let targetCustomerId = null; // Lưu customerId khi thao tác Modal
let targetStatusAction = null; // 'LOCKED' hoặc 'ACTIVE'

document.addEventListener("DOMContentLoaded", function () {
  // 🔑 Lấy JWT Token từ localStorage
  const token = getToken();

  if (!token) {
    showToast("Phiên làm việc hết hạn hoặc chưa đăng nhập Admin!", "error");
    return;
  }

  // Tải dữ liệu khách hàng từ API Admin
  fetchCustomers(token);

  // Lắng nghe sự kiện lọc trạng thái
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  // Lắng nghe sự kiện xác nhận trên Modal
  const btnConfirm = document.getElementById("btnConfirmAction");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", function () {
      confirmToggleLock(token);
    });
  }
});

/**
 * 🔑 Helper lấy JWT Token từ các nguồn
 */
function getToken() {
  let token = localStorage.getItem("petcare_token");
  if (!token && window.parent && window.parent.localStorage) {
    token = window.parent.localStorage.getItem("petcare_token");
  }
  return token && token !== "null" && token !== "undefined" ? token : null;
}

/**
 * 📥 Gọi API Admin lấy danh sách tất cả khách hàng
 */
async function fetchCustomers(token) {
  try {
    const response = await fetch(`${BASE_URL}/admin/customers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      customers = result.data || [];
      console.log("📊 Danh sách khách hàng từ API:", customers);

      filteredData = [...customers];
      updateStats(customers);
      updateUI();
    } else {
      showToast(
        result.message || "Không thể lấy danh sách khách hàng!",
        "error",
      );
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách khách hàng:", error);
    showToast("Không thể kết nối đến máy chủ API!", "error");
  }
}

/**
 * 🏷️ Xác định kiểu trạng thái duyệt / khóa
 */
function getApprovalType(cust) {
  const violations = cust.violationCount || 0;
  const accountStatus = (cust.accountStatus || "ACTIVE").toUpperCase();

  if (accountStatus === "LOCKED" || violations >= 5) {
    return "locked";
  }
  if (violations >= 3) {
    return "admin";
  }
  return "auto";
}

/**
 * 🎨 Render HTML Badge Trạng thái
 */
function getStatusBadgeHTML(approvalType) {
  switch (approvalType) {
    case "auto":
      return `<span class="status-badge status-auto"><i class="fa-regular fa-circle-check"></i> Tự động duyệt</span>`;
    case "admin":
      return `<span class="status-badge status-admin"><i class="fa-regular fa-clock"></i> Admin duyệt</span>`;
    case "locked":
      return `<span class="status-badge status-locked"><i class="fa-solid fa-lock"></i> Bị khóa</span>`;
    default:
      return "";
  }
}

/**
 * 🖼️ Chuẩn hóa đường dẫn Avatar
 */
function getImageUrl(path) {
  const defaultSvg =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (!path || path.trim() === "") return defaultSvg;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  )
    return path;
  return SERVER_HOST + path;
}

/**
 * 📅 Định dạng ngày từ SQL Timestamp sang DD/MM/YYYY
 */
function formatDate(dateString) {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * 📊 Cập nhật các thẻ thống kê tổng số
 */
function updateStats(data) {
  document.getElementById("total-customers").textContent = data.length;

  document.getElementById("auto-approved-customers").textContent = data.filter(
    (c) => getApprovalType(c) === "auto",
  ).length;

  document.getElementById("admin-approved-customers").textContent = data.filter(
    (c) => getApprovalType(c) === "admin",
  ).length;

  document.getElementById("locked-customers").textContent = data.filter(
    (c) => getApprovalType(c) === "locked",
  ).length;

  // Tính tổng số lượng thú cưng
  const totalPets = data.reduce(
    (acc, cur) => acc + (parseInt(cur.petsCount) || 0),
    0,
  );
  document.getElementById("total-pets").textContent = totalPets;
}

/**
 * 📋 Render dữ liệu vào Bảng HTML
 */
function renderTable(data) {
  const tableBody = document.getElementById("customerTableBody");
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = data.slice(start, end);

  if (paginatedItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #94a3b8;">Không tìm thấy khách hàng phù hợp</td></tr>`;
    return;
  }

  paginatedItems.forEach((cust) => {
    const approvalType = getApprovalType(cust);
    const isLocked = approvalType === "locked";
    const violations = cust.violationCount || 0;
    const petsCount = cust.petsCount || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="cust-code">${cust.customerCode || "KH-0000"}</span></td>
      <td>
        <div class="cust-profile">
          <img src="${getImageUrl(cust.avatar)}" alt="${cust.fullName}" class="avatar">
          <span>${cust.fullName || "Khách hàng"}</span>
        </div>
      </td>
      <td><i class="fa-solid fa-phone" style="color: #22c55e; margin-right: 4px;"></i>${cust.phone || "---"}</td>
      <td><i class="fa-solid fa-envelope" style="color: #3b82f6; margin-right: 4px;"></i>${cust.email || "---"}</td>
      <td><i class="fa-regular fa-calendar" style="color: #ff7a45; margin-right: 4px;"></i>${formatDate(cust.createdAt)}</td>
      <td style="text-align: center;">
        <span class="violation-badge ${violations >= 3 ? "high" : ""}">
          <i class="fa-solid fa-triangle-exclamation"></i> ${violations}
        </span>
      </td>
      <td style="text-align: center;">${getStatusBadgeHTML(approvalType)}</td>
      <td style="text-align: center;">
        <span class="pet-count-badge" onclick="handleViewPets(${cust.customerId})" title="Xem danh sách thú cưng">
          <i class="fa-solid fa-paw"></i> ${petsCount}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon-action btn-view-cust" onclick="handleViewCustomer(${cust.customerId})" title="Xem chi tiết khách hàng">
            <i class="fa-regular fa-eye"></i>
          </button>

          <button class="btn-icon-action btn-view-pets" onclick="handleViewPets(${cust.customerId})" title="Xem danh sách thú cưng">
            <i class="fa-solid fa-paw"></i>
          </button>

          <button class="btn-icon-action ${isLocked ? "btn-lock" : "btn-unlock"}" 
                  onclick="handleToggleLock(${cust.customerId})" 
                  title="${isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}">
            <i class="fa-solid ${isLocked ? "fa-lock" : "fa-lock-open"}"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * 📄 Render Thanh Phân Trang
 */
function renderPagination(totalItems) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("div");
  prevBtn.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateUI();
    }
  };
  paginationContainer.appendChild(prevBtn);

  let pages = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    }
  }

  let prevPage = null;
  pages.forEach((page) => {
    if (prevPage && page - prevPage > 1) {
      const dots = document.createElement("div");
      dots.className = "page-item page-dots";
      dots.textContent = "...";
      paginationContainer.appendChild(dots);
    }

    const pageItem = document.createElement("div");
    pageItem.className = `page-item ${page === currentPage ? "active" : ""}`;
    pageItem.textContent = page;
    pageItem.onclick = () => {
      currentPage = page;
      updateUI();
    };
    paginationContainer.appendChild(pageItem);

    prevPage = page;
  });

  const nextBtn = document.createElement("div");
  nextBtn.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateUI();
    }
  };
  paginationContainer.appendChild(nextBtn);
}

/**
 * 🔄 Cập nhật Giao diện (Bảng & Phân trang)
 */
function updateUI() {
  renderTable(filteredData);
  renderPagination(filteredData.length);
}

/**
 * 🔍 Áp dụng bộ lọc trạng thái
 */
function applyFilters() {
  const selectedStatus = document.getElementById("statusFilter").value;

  filteredData = customers.filter((cust) => {
    const type = getApprovalType(cust);
    return selectedStatus === "all" || type === selectedStatus;
  });

  currentPage = 1;
  updateStats(customers);
  updateUI();
}

/**
 * 🔗 ĐIỀU HƯỚNG: Mở trang Chi tiết thông tin Khách hàng
 */
function handleViewCustomer(customerId) {
  const targetUrl = `/user/customer/Customer_info.html?id=${customerId}`;

  if (window.parent && typeof window.parent.loadContent === "function") {
    window.parent.loadContent(targetUrl);
  } else {
    window.location.href = targetUrl;
  }
}

/**
 * 🔗 ĐIỀU HƯỚNG: Mở trang Danh sách Thú cưng
 */
function handleViewPets(customerId) {
  const targetUrl = `/user/pet/Pet_list.html?customerId=${customerId}`;

  if (window.parent && typeof window.parent.loadContent === "function") {
    window.parent.loadContent(targetUrl);
  } else {
    window.location.href = targetUrl;
  }
}

/**
 * 🔒 Bật Modal xác nhận Khóa / Mở khóa
 */
function handleToggleLock(customerId) {
  const targetCust = customers.find((c) => c.customerId === customerId);
  if (!targetCust) return;

  targetCustomerId = customerId;
  const isLocked = getApprovalType(targetCust) === "locked";
  targetStatusAction = isLocked ? "ACTIVE" : "LOCKED";

  const modalOverlay = document.getElementById("confirmModal");
  const modalHeader = document.getElementById("modalHeader");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const btnConfirm = document.getElementById("btnConfirmAction");

  if (isLocked) {
    modalHeader.className = "modal-header unlock-mode";
    modalTitle.textContent = "Xác nhận mở khóa tài khoản";
    modalMessage.innerHTML = `Bạn có chắc chắn muốn mở khóa tài khoản cho khách hàng <strong>${targetCust.fullName} (${targetCust.customerCode})</strong> không?`;
    btnConfirm.textContent = "Mở khóa";
    btnConfirm.className = "btn-modal btn-confirm btn-unlock-action";
  } else {
    modalHeader.className = "modal-header lock-mode";
    modalTitle.textContent = "Xác nhận khóa tài khoản";
    modalMessage.innerHTML = `Bạn có chắc chắn muốn khóa tài khoản của khách hàng <strong>${targetCust.fullName} (${targetCust.customerCode})</strong> không?`;
    btnConfirm.textContent = "Khóa tài khoản";
    btnConfirm.className = "btn-modal btn-confirm btn-lock-action";
  }

  modalOverlay.classList.remove("hidden");
}

/**
 * ❌ Đóng Modal
 */
function closeModal() {
  const modalOverlay = document.getElementById("confirmModal");
  if (modalOverlay) {
    modalOverlay.classList.add("hidden");
  }
  targetCustomerId = null;
  targetStatusAction = null;
}

/**
 * 🚀 Thực thi gọi API thay đổi trạng thái tài khoản sau khi nhấn nút "Xác nhận"
 */
async function confirmToggleLock(token) {
  if (!targetCustomerId || !targetStatusAction) return;

  try {
    const response = await fetch(`${BASE_URL}/admin/customers/change-status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: targetCustomerId,
        status: targetStatusAction,
      }),
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      showToast(result.message || "Cập nhật trạng thái thành công!", "success");
      closeModal();
      await fetchCustomers(token);
    } else {
      showToast(
        result.message || "Không thể đổi trạng thái tài khoản!",
        "error",
      );
    }
  } catch (error) {
    console.error("Lỗi khi thực hiện đổi trạng thái tài khoản:", error);
    showToast("Lỗi kết nối tới máy chủ!", "error");
  }
}

/**
 * 🍿 Bắn Toast Thông báo trượt
 */
function showToast(message, type = "success") {
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
