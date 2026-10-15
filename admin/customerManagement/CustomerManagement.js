/**
 * 👤 FILE: CustomerManagement.js
 * Quản lý Khách hàng & Thú cưng - Khớp với AdminCustomerController & CustomerManagement.html
 */

const SERVER_HOST = "http://127.0.0.1:8000";
const BASE_URL = `${SERVER_HOST}/api/v1`;

let globalCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;

let targetCustomerId = null;
let targetStatusAction = null;
let currentSearchKeyword = "";

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    console.warn("⚠️ Chưa tìm thấy Token hợp lệ. Vui lòng đăng nhập!");
    showLocalToast("Phiên đăng nhập hết hạn hoặc chưa xác thực!", "error");
    return;
  }

  // 1. Tải dữ liệu ban đầu
  initCustomerManagement(token);

  // 2. Lắng nghe Bộ lọc Trạng thái
  const statusFilterEl = document.getElementById("statusFilter");
  if (statusFilterEl) {
    statusFilterEl.addEventListener("change", function () {
      applyFilters();
    });
  }

  // 3. Lắng nghe sự kiện tìm kiếm gửi từ Frame ngoài (nếu có)
  window.addEventListener("message", function (event) {
    if (event.data && event.data.action === "SEARCH_DATA") {
      currentSearchKeyword = (event.data.keyword || "").trim().toLowerCase();
      applyFilters();
    }
  });

  // 4. Lắng nghe nút Xác nhận Khóa / Mở khóa trong Modal
  const btnConfirm = document.getElementById("btnConfirmAction");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", function () {
      confirmToggleLock(token);
    });
  }
});

/* ==========================================================================
   🔑 TOKEN HELPER
   ========================================================================== */

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

/* ==========================================================================
   🚀 INITIALIZER
   ========================================================================== */

async function initCustomerManagement(token) {
  await Promise.all([fetchCustomers(token), fetchSummaryStats(token)]);
}

/* ==========================================================================
   📡 FETCH DATA FROM API
   ========================================================================== */

/**
 * 1. Gọi API: GET /v1/admin/customers
 */
async function fetchCustomers(token) {
  try {
    const res = await fetch(`${BASE_URL}/admin/customers?perPage=100`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await res.json();

    if (res.ok && (result.status || result.success)) {
      globalCustomers = result.data || [];
      applyFilters();
    } else {
      showLocalToast(
        result.message || "Không thể lấy danh sách khách hàng!",
        "error",
      );
    }
  } catch (err) {
    console.error("Lỗi lấy danh sách khách hàng:", err);
    showLocalToast("Không thể kết nối đến máy chủ!", "error");
  }
}

/**
 * 2. Gọi API: GET /v1/admin/customers/summary
 */
async function fetchSummaryStats(token) {
  try {
    const res = await fetch(`${BASE_URL}/admin/customers/summary`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await res.json();

    if (res.ok && (result.status || result.success)) {
      const stats = result.data || {};

      if (
        document.getElementById("total-customers") &&
        stats.totalCustomers !== undefined
      ) {
        document.getElementById("total-customers").innerText =
          stats.totalCustomers;
      }
      if (
        document.getElementById("auto-approved-customers") &&
        stats.autoApprovedCustomers !== undefined
      ) {
        document.getElementById("auto-approved-customers").innerText =
          stats.autoApprovedCustomers;
      }
      if (
        document.getElementById("admin-approved-customers") &&
        stats.adminApprovedCustomers !== undefined
      ) {
        document.getElementById("admin-approved-customers").innerText =
          stats.adminApprovedCustomers;
      }
      if (
        document.getElementById("locked-customers") &&
        stats.lockedCustomers !== undefined
      ) {
        document.getElementById("locked-customers").innerText =
          stats.lockedCustomers;
      }
      if (
        document.getElementById("total-pets") &&
        stats.totalPets !== undefined
      ) {
        document.getElementById("total-pets").innerText = stats.totalPets;
      }
    }
  } catch (err) {
    console.warn("Lỗi lấy thống kê tổng quan:", err);
  }
}

/* ==========================================================================
   ⚙️ FORMATTERS & STATUS LOGIC
   ========================================================================== */

function getApprovalType(cust) {
  const violations =
    cust.violationCount !== undefined
      ? cust.violationCount
      : cust.violation_count || 0;

  const accountStatus = (
    cust.accountStatus ||
    cust.account_status ||
    cust.status ||
    "ACTIVE"
  ).toUpperCase();

  if (accountStatus === "LOCKED" || violations >= 5) {
    return "locked";
  }
  if (violations >= 3) {
    return "admin";
  }
  return "auto";
}

function getStatusBadgeHTML(approvalType) {
  switch (approvalType) {
    case "auto":
      return `<span class="status-badge status-auto"><i class="fa-regular fa-circle-check"></i> Tự động duyệt</span>`;
    case "admin":
      return `<span class="status-badge status-admin"><i class="fa-regular fa-clock"></i> Admin duyệt</span>`;
    case "locked":
      return `<span class="status-badge status-locked"><i class="fa-solid fa-lock"></i> Bị khóa</span>`;
    default:
      return `<span class="status-badge status-auto">Hoạt động</span>`;
  }
}

function getImageUrl(path) {
  const defaultSvg =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (
    !path ||
    typeof path !== "string" ||
    path.trim() === "" ||
    path === "null" ||
    path === "undefined"
  ) {
    return defaultSvg;
  }

  const cleanPath = path.trim();
  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  const relativePath = cleanPath.startsWith("/")
    ? cleanPath.slice(1)
    : cleanPath;
  return `${SERVER_HOST}/${relativePath}`;
}

function formatDate(dateString) {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ==========================================================================
   🎨 UI & RENDER TABLE
   ========================================================================== */

function updateStats(data) {
  const totalCust = data.length;
  const autoApproved = data.filter((c) => getApprovalType(c) === "auto").length;
  const adminApproved = data.filter(
    (c) => getApprovalType(c) === "admin",
  ).length;
  const lockedCust = data.filter((c) => getApprovalType(c) === "locked").length;

  const totalPets = data.reduce(
    (acc, cur) =>
      acc +
      (parseInt(
        cur.petsCount || cur.pets_count || (cur.pets ? cur.pets.length : 0),
        10,
      ) || 0),
    0,
  );

  if (document.getElementById("total-customers"))
    document.getElementById("total-customers").innerText = totalCust;
  if (document.getElementById("auto-approved-customers"))
    document.getElementById("auto-approved-customers").innerText = autoApproved;
  if (document.getElementById("admin-approved-customers"))
    document.getElementById("admin-approved-customers").innerText =
      adminApproved;
  if (document.getElementById("locked-customers"))
    document.getElementById("locked-customers").innerText = lockedCust;
  if (document.getElementById("total-pets"))
    document.getElementById("total-pets").innerText = totalPets;
}

function renderTable(data) {
  const tableBody = document.getElementById("customerTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = data.slice(start, end);

  if (paginatedItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #94a3b8;">Không tìm thấy khách hàng phù hợp</td></tr>`;
    return;
  }

  paginatedItems.forEach((cust) => {
    const custId = cust.customerId || cust.customer_id || cust.id;
    const approvalType = getApprovalType(cust);
    const isLocked = approvalType === "locked";
    const violations =
      cust.violationCount !== undefined
        ? cust.violationCount
        : cust.violation_count || 0;

    const petsCount =
      cust.petsCount || cust.pets_count || (cust.pets ? cust.pets.length : 0);
    const custCode =
      cust.customerCode ||
      cust.customer_code ||
      `KH-${String(custId).padStart(4, "0")}`;
    const fullName = cust.fullName || cust.full_name || "Khách hàng";
    const createdAt = cust.createdAt || cust.created_at;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="cust-code">${custCode}</span></td>
      <td>
        <div class="cust-profile">
          <img src="${getImageUrl(cust.avatar)}" alt="${fullName}" class="avatar" onerror="this.src='${getImageUrl(null)}'">
          <span>${fullName}</span>
        </div>
      </td>
      <td><i class="fa-solid fa-phone" style="color: #22c55e; margin-right: 4px;"></i>${cust.phone || "---"}</td>
      <td><i class="fa-solid fa-envelope" style="color: #3b82f6; margin-right: 4px;"></i>${cust.email || "---"}</td>
      <td><i class="fa-regular fa-calendar" style="color: #ff7a45; margin-right: 4px;"></i>${formatDate(createdAt)}</td>
      <td style="text-align: center;">
        <span class="violation-badge ${violations >= 3 ? "high" : ""}">
          <i class="fa-solid fa-triangle-exclamation"></i> ${violations}
        </span>
      </td>
      <td style="text-align: center;">${getStatusBadgeHTML(approvalType)}</td>
      <td style="text-align: center;">
        <span class="pet-count-badge" onclick="handleViewPets(${custId})" title="Xem danh sách thú cưng">
          <i class="fa-solid fa-paw"></i> ${petsCount}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon-action btn-view-cust" onclick="handleViewCustomer(${custId})" title="Xem chi tiết khách hàng">
            <i class="fa-regular fa-eye"></i>
          </button>

          <button class="btn-icon-action btn-view-pets" onclick="handleViewPets(${custId})" title="Xem danh sách thú cưng">
            <i class="fa-solid fa-paw"></i>
          </button>

          <!-- BẢNG DANH SÁCH: Hiển thị đúng bản chất trạng thái hiện tại -->
          <!-- Nếu đang bị khóa (isLocked) -> Nút ĐỎ + Ổ KHOẢNG ĐÓNG (btn-lock & fa-lock) -->
          <!-- Nếu đang bình thường (!isLocked) -> Nút XANH + Ổ KHOẢNG MỞ (btn-unlock & fa-lock-open) -->
          <button class="btn-icon-action ${isLocked ? "btn-lock" : "btn-unlock"}" 
                  onclick="handleToggleLock(${custId})" 
                  title="${isLocked ? "Tài khoản đang bị khóa (Bấm để Mở khóa)" : "Tài khoản đang mở (Bấm để Khóa)"}">
            <i class="fa-solid ${isLocked ? "fa-lock" : "fa-lock-open"}"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderPagination(totalItems) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

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

function updateUI() {
  renderTable(filteredCustomers);
  renderPagination(filteredCustomers.length);
}

function applyFilters() {
  const statusFilterEl = document.getElementById("statusFilter");
  const selectedStatus = statusFilterEl ? statusFilterEl.value : "all";

  filteredCustomers = globalCustomers.filter((cust) => {
    const type = getApprovalType(cust);
    const matchStatus = selectedStatus === "all" || type === selectedStatus;

    let matchKeyword = true;
    if (currentSearchKeyword) {
      const custCode = (
        cust.customerCode ||
        cust.customer_code ||
        ""
      ).toLowerCase();
      const fullName = (cust.fullName || cust.full_name || "").toLowerCase();
      const phone = (cust.phone || "").toLowerCase();
      const email = (cust.email || "").toLowerCase();

      matchKeyword =
        custCode.includes(currentSearchKeyword) ||
        fullName.includes(currentSearchKeyword) ||
        phone.includes(currentSearchKeyword) ||
        email.includes(currentSearchKeyword);
    }

    return matchStatus && matchKeyword;
  });

  currentPage = 1;
  updateStats(globalCustomers);
  updateUI();
}

/* ==========================================================================
   🔗 TÁC VỤ MODAL & ĐỔI TRẠNG THÁI (KHÓA / MỞ KHÓA)
   ========================================================================== */

function handleViewCustomer(customerId) {
  const token = getAuthToken();
  const targetUrl = `/admin/customers/${customerId}?token=${encodeURIComponent(token)}`;

  if (
    window.parent &&
    window.parent.document &&
    window.parent.document.getElementById("mainFrame")
  ) {
    window.parent.document.getElementById("mainFrame").src = targetUrl;
  } else {
    window.location.href = targetUrl;
  }
}

function handleViewPets(customerId) {
  const token = getAuthToken();
  const targetUrl = `/admin/customers/${customerId}/pets?token=${encodeURIComponent(token)}`;

  if (
    window.parent &&
    window.parent.document &&
    window.parent.document.getElementById("mainFrame")
  ) {
    window.parent.document.getElementById("mainFrame").src = targetUrl;
  } else {
    window.location.href = targetUrl;
  }
}

function handleToggleLock(customerId) {
  const targetCust = globalCustomers.find(
    (c) => (c.customerId || c.customer_id || c.id) === customerId,
  );
  if (!targetCust) return;

  targetCustomerId = customerId;
  const isLocked = getApprovalType(targetCust) === "locked";
  targetStatusAction = isLocked ? "ACTIVE" : "LOCKED";

  const modalOverlay = document.getElementById("confirmModal");
  const modalHeader = document.getElementById("modalHeader");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const btnConfirm = document.getElementById("btnConfirmAction");

  const fullName = targetCust.fullName || targetCust.full_name || "Khách hàng";
  const custCode = targetCust.customerCode || targetCust.customer_code || "KH";

  if (isLocked) {
    // ĐANG BỊ KHÓA -> Mở Modal để thực hiện "MỞ KHÓA" -> Nút bấm xác nhận màu XANH (btn-unlock-action)
    if (modalHeader) modalHeader.className = "modal-header unlock-mode";
    if (modalTitle) modalTitle.innerText = "Xác nhận mở khóa tài khoản";
    if (modalMessage) {
      modalMessage.innerHTML = `Bạn có chắc chắn muốn mở khóa tài khoản cho khách hàng <strong>${fullName} (${custCode})</strong> không?<br><small style="color: #64748b;">(Số lần vi phạm sẽ hạ về 3 - Cần Admin xét duyệt khi dịch vụ)</small>`;
    }
    if (btnConfirm) {
      btnConfirm.innerText = "Mở khóa";
      btnConfirm.className = "btn-modal btn-confirm btn-unlock-action";
    }
  } else {
    // ĐANG BÌNH THƯỜNG -> Mở Modal để thực hiện "KHÓA TÀI KHOẢN" -> Nút bấm xác nhận màu ĐỎ (btn-lock-action)
    if (modalHeader) modalHeader.className = "modal-header lock-mode";
    if (modalTitle) modalTitle.innerText = "Xác nhận khóa tài khoản";
    if (modalMessage) {
      modalMessage.innerHTML = `Bạn có chắc chắn muốn khóa tài khoản của khách hàng <strong>${fullName} (${custCode})</strong> không?<br><small style="color: #64748b;">(Số lần vi phạm sẽ tăng lên 5 để đồng bộ khóa tài khoản)</small>`;
    }
    if (btnConfirm) {
      btnConfirm.innerText = "Khóa tài khoản";
      btnConfirm.className = "btn-modal btn-confirm btn-lock-action";
    }
  }

  if (modalOverlay) modalOverlay.classList.remove("hidden");
}

function closeModal() {
  const modalOverlay = document.getElementById("confirmModal");
  if (modalOverlay) modalOverlay.classList.add("hidden");
  targetCustomerId = null;
  targetStatusAction = null;
}

/**
 * 3. Gọi API: POST /v1/admin/customers/toggle-account-status
 */
async function confirmToggleLock(token) {
  if (!targetCustomerId || !targetStatusAction) return;

  try {
    const res = await fetch(
      `${BASE_URL}/admin/customers/toggle-account-status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          customerId: targetCustomerId,
          status: targetStatusAction,
        }),
      },
    );

    const result = await res.json();

    if (res.ok && (result.status || result.success)) {
      showLocalToast(
        result.message || "Cập nhật trạng thái thành công!",
        "success",
      );
      closeModal();
      await fetchCustomers(token);
    } else {
      showLocalToast(
        result.message || "Không thể thay đổi trạng thái tài khoản!",
        "error",
      );
    }
  } catch (err) {
    console.error("Lỗi khi thay đổi trạng thái:", err);
    showLocalToast("Lỗi kết nối máy chủ!", "error");
  }
}

/* ==========================================================================
   🔔 TOAST NOTIFICATION HELPER
   ========================================================================== */

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
  toast.style.cssText = `padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: ${
    type === "success" ? "#52c41a" : "#ff4d4f"
  }`;

  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}
