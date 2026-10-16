/**
 * 👥 FILE: StaffManagement.js
 * Quản lý Nhân viên phía Admin - Kết nối trực tiếp API Backend Laravel
 */

const API_BASE_URL = "http://localhost:8000/api/v1";

// CẤU HÌNH BIẾN TOÀN CỤC
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;

let positionsList = []; // Lưu danh sách Chức vụ lấy từ DB
let editingStaffId = null; // null: Thêm mới, khác null: Đang sửa
let deletingStaffId = null; // Staff ID đang chọn xóa / khóa
let uploadedAvatarPath = null; // Lưu đường dẫn ảnh upload thành công

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    showPetToast("Phiên làm việc hết hạn. Vui lòng đăng nhập lại!", "error");
    return;
  }

  // 1. Tải danh mục Chức vụ (Positions) trực tiếp từ DB
  loadPositionsFromDB(token);

  // 2. Tải Thống kê Tổng quan Nhân viên
  loadSummaryStats(token);

  // 3. Tải Danh sách Nhân viên
  loadStaffList(token);

  // 4. Lắng nghe sự kiện chọn Chức vụ trong Modal -> Tải Mã NV Real-time
  const empRoleSelect = document.getElementById("empRole");
  if (empRoleSelect) {
    empRoleSelect.addEventListener("change", function () {
      handleRoleChange(this.value, token);
    });
  }

  // 5. Sự kiện Lọc theo Chức vụ trên Header
  const roleFilter = document.getElementById("roleFilter");
  if (roleFilter) {
    roleFilter.addEventListener("change", () => {
      currentPage = 1;
      loadStaffList(token);
    });
  }

  // 6. Sự kiện Upload Ảnh đại diện trong Modal
  const localAvatarInput = document.getElementById("localAvatarInput");
  if (localAvatarInput) {
    localAvatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleUploadAvatar(file, token);
    });
  }

  // 7. Chuyển Tab trong Modal
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) targetTab.classList.add("active");
    });
  });

  // 8. Mở Modal Thêm mới
  const btnOpenAdd = document.getElementById("btnOpenAddModal");
  if (btnOpenAdd) {
    btnOpenAdd.addEventListener("click", () => openAddModal());
  }

  // 9. Đóng Modal Thêm/Sửa
  const btnCloseModal = document.getElementById("btnCloseEmpModal");
  const btnCancelModal = document.getElementById("btnCancelEmpModal");
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeEmpModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeEmpModal);

  // 10. Submit Form Thêm / Sửa Nhân viên
  const empForm = document.getElementById("employeeForm");
  if (empForm) {
    empForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitStaffForm(token);
    });
  }

  // 11. Đóng Modal Xóa / Đổi trạng thái
  const btnCloseDelete = document.getElementById("btnCloseDeleteModal");
  const btnCancelDelete = document.getElementById("btnCancelDelete");
  if (btnCloseDelete)
    btnCloseDelete.addEventListener("click", closeDeleteModal);
  if (btnCancelDelete)
    btnCancelDelete.addEventListener("click", closeDeleteModal);

  // 12. Bấm nút Xác nhận Xóa / Ngừng làm việc
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", () =>
      confirmToggleStatus(token),
    );
  }

  // 13. Toggle logic Ca làm việc & Tần suất
  setupShiftToggleLogic();
});

/**
 * 🔑 Lấy Auth Token từ Storage / Parent Frame
 */
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
 * ⚡ Tải Mã Nhân Viên Dự Kiến Real-time khi Admin Chọn / Thay Đổi Chức Vụ
 */
async function handleRoleChange(positionId, token) {
  const empCodeInput = document.getElementById("empCode");
  if (!empCodeInput) return;

  if (!positionId) {
    empCodeInput.value = "Chờ chọn chức vụ...";
    return;
  }

  try {
    empCodeInput.value = "Đang cập nhật mã...";
    const response = await fetch(
      `${API_BASE_URL}/admin/staffs/preview-code?position_id=${positionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    const result = await response.json();

    if (response.ok && result.status) {
      empCodeInput.value = result.data; // Tải mã mới preview theo chức vụ được chọn
    } else {
      empCodeInput.value = "Không thể sinh mã";
    }
  } catch (e) {
    console.error("Lỗi preview code:", e);
    empCodeInput.value = "Lỗi kết nối máy chủ";
  }
}

/**
 * 📥 1. Lấy danh mục Chức vụ từ Database (`/api/v1/positions`)
 */
async function loadPositionsFromDB(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/positions`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await response.json();

    if (response.ok && result.status) {
      positionsList = result.data || [];

      // 1. Cập nhật Bộ Lọc Dropdown
      const roleFilter = document.getElementById("roleFilter");
      if (roleFilter) {
        roleFilter.innerHTML = `<option value="all">Tất cả chức vụ</option>`;
        positionsList.forEach((pos) => {
          roleFilter.innerHTML += `<option value="${pos.positionId}">${pos.positionName}</option>`;
        });
      }

      // 2. Cập nhật Dropdown Chức vụ trong Form Modal
      const empRole = document.getElementById("empRole");
      if (empRole) {
        empRole.innerHTML = `<option value="">-- Chọn chức vụ --</option>`;
        positionsList.forEach((pos) => {
          empRole.innerHTML += `<option value="${pos.positionId}">${pos.positionName} (${pos.positionCode})</option>`;
        });
      }
    }
  } catch (e) {
    console.error("Lỗi lấy danh mục chức vụ từ DB:", e);
    showPetToast("Lỗi tải danh mục chức vụ!", "error");
  }
}

/**
 * 📊 2. Lấy số liệu Thống kê cho Header
 */
async function loadSummaryStats(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/staffs/summary`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await response.json();

    if (response.ok && result.status) {
      const stats = result.data;
      document.getElementById("total-count").textContent =
        stats.total_staffs || 0;
      document.getElementById("working-count").textContent =
        stats.active_staffs || 0;
      document.getElementById("late-count").textContent =
        stats.inactive_staffs || 0;
      document.getElementById("absent-count").textContent = 0;
    }
  } catch (e) {
    console.error("Lỗi tải thống kê nhân viên:", e);
  }
}

/**
 * 📋 3. Tải Danh sách Nhân viên & Render Bảng
 */
async function loadStaffList(token) {
  try {
    const roleFilterVal = document.getElementById("roleFilter").value;
    let url = `${API_BASE_URL}/admin/staffs?page=${currentPage}&per_page=${itemsPerPage}`;

    if (roleFilterVal !== "all") {
      url += `&position_id=${roleFilterVal}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await response.json();

    if (!response.ok || !result.status) {
      showPetToast(
        getApiErrorMessage(result, "Lỗi tải danh sách nhân viên!"),
        "error",
      );
      return;
    }

    const paginatedData = result.data;
    const staffs = paginatedData.data || paginatedData || [];
    totalPages = paginatedData.last_page || 1;

    renderStaffTable(staffs);
    renderPagination();
  } catch (e) {
    console.error("Lỗi tải danh sách nhân viên:", e);
    showPetToast("Không thể kết nối đến máy chủ!", "error");
  }
}

/**
 * 🖼️ Render Dữ liệu Bảng Nhân viên
 */
function renderStaffTable(staffs) {
  const tableBody = document.getElementById("employeeTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (staffs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: #94a3b8;">Không tìm thấy nhân viên nào</td></tr>`;
    return;
  }

  staffs.forEach((emp) => {
    const posName = emp.position ? emp.position.positionName : "Chưa phân công";
    const statusText = emp.isWorking ? "Đang làm việc" : "Nghỉ tạm thời";
    const statusClass = emp.isWorking ? "status-working" : "status-leave";
    const avatarUrl = getImageUrl(emp.avatar);
    const startDate = emp.createdAt
      ? emp.createdAt.split(" ")[0]
      : "--/--/----";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="emp-code"><strong>${emp.staffCode || "---"}</strong></td>
      <td>
        <div class="emp-profile">
          <img src="${avatarUrl}" alt="${emp.fullName}" class="avatar">
          <span>${emp.fullName || "<em>Chưa cập nhật</em>"}</span>
        </div>
      </td>
      <td><span class="role-badge role-manager">${posName}</span></td>
      <td class="phone-cell"><i class="fa-solid fa-phone"></i> ${emp.phone || "---"}</td>
      <td class="email-cell"><i class="fa-solid fa-envelope"></i> ${emp.email || "---"}</td>
      <td>
        <span class="status-badge ${statusClass}">
          <span class="status-dot"></span>
          ${statusText}
        </span>
      </td>
      <td><i class="fa-regular fa-calendar" style="color: #ff7a45; margin-right: 6px;"></i>${startDate}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" title="Xem & Sửa thông tin" onclick="openEditModal(${emp.staffId})"><i class="fa-regular fa-eye"></i></button>
          <button class="btn-icon btn-delete" title="Đổi trạng thái / Khóa" onclick="openDeleteModal(${emp.staffId}, '${emp.fullName || emp.staffCode}')"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * 📄 Render Phân Trang
 */
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  const token = getAuthToken();

  const prevBtn = document.createElement("div");
  prevBtn.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadStaffList(token);
    }
  };
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("div");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.textContent = i;
    pageItem.onclick = () => {
      currentPage = i;
      loadStaffList(token);
    };
    paginationContainer.appendChild(pageItem);
  }

  const nextBtn = document.createElement("div");
  nextBtn.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadStaffList(token);
    }
  };
  paginationContainer.appendChild(nextBtn);
}

/**
 * ➕ Mở Modal Thêm mới Nhân viên
 */
function openAddModal() {
  editingStaffId = null;
  uploadedAvatarPath = null;

  document.getElementById("modalTitle").innerHTML =
    `<i class="fa-solid fa-user-plus"></i> Thêm nhân viên mới`;

  const form = document.getElementById("employeeForm");
  if (form) form.reset();

  const empCodeInput = document.getElementById("empCode");
  if (empCodeInput) {
    empCodeInput.value = "Chờ chọn chức vụ...";
    empCodeInput.disabled = true;
  }

  document.getElementById("empName").required = false;
  document.getElementById("empPhone").required = false;
  document.getElementById("empCccd").required = false;

  const avatarPreview = document.getElementById("avatarPreview");
  if (avatarPreview) avatarPreview.src = getImageUrl(null);

  const tabBtns = document.querySelectorAll(".tab-btn");
  if (tabBtns.length > 0) tabBtns[0].click();

  const modal = document.getElementById("employeeModal");
  if (modal) modal.classList.add("active");
}

/**
 * 👁️ Mở Modal Xem & Chỉnh sửa Nhân viên
 */
async function openEditModal(staffId) {
  const token = getAuthToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/staffs/detail?id=${staffId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    const result = await response.json();

    if (!response.ok || !result.status) {
      showPetToast("Không tìm thấy thông tin chi tiết nhân viên!", "error");
      return;
    }

    const emp = result.data;
    editingStaffId = emp.staffId;
    uploadedAvatarPath = emp.avatar;

    document.getElementById("modalTitle").innerHTML =
      `<i class="fa-regular fa-eye"></i> Thông tin & Sửa Nhân Viên`;

    document.getElementById("empCode").value = emp.staffCode || "";
    document.getElementById("empCode").disabled = true;

    document.getElementById("empName").value =
      emp.fullName === "Chưa cập nhật" ? "" : emp.fullName || "";
    document.getElementById("empPhone").value = emp.phone || "";
    document.getElementById("empEmail").value = emp.email || "";
    document.getElementById("empCccd").value = emp.citizenId || "";
    document.getElementById("empAddress").value = emp.address || "";
    document.getElementById("empShiftSalary").value = emp.salaryPerShift || 0;

    if (emp.position) {
      document.getElementById("empRole").value = emp.position.positionId;
    } else {
      document.getElementById("empRole").value = "";
    }
    document.getElementById("empStatus").value = emp.isWorking
      ? "Đang làm việc"
      : "Nghỉ tạm thời";

    const avatarPreview = document.getElementById("avatarPreview");
    if (avatarPreview) avatarPreview.src = getImageUrl(emp.avatar);

    const modal = document.getElementById("employeeModal");
    if (modal) modal.classList.add("active");
  } catch (e) {
    console.error("Lỗi lấy thông tin NV:", e);
    showPetToast("Không thể kết nối máy chủ!", "error");
  }
}

/**
 * 💾 Submit Form Thêm / Sửa Nhân Viên & Phân Ca Làm Việc
 */
async function submitStaffForm(token) {
  const positionId = document.getElementById("empRole").value;
  if (!positionId) {
    showPetToast("Vui lòng chọn chức vụ cho nhân viên!", "error");
    return;
  }

  // Thu thập thông tin Phân ca từ Tab 2
  const selectedShiftRadio = document.querySelector(
    'input[name="shiftType"]:checked',
  );
  const selectedScheduleRadio = document.querySelector(
    'input[name="schedulePattern"]:checked',
  );

  let shiftId = null;
  if (selectedShiftRadio) {
    const shiftVal = selectedShiftRadio.value;
    if (shiftVal === "Ca sáng") shiftId = 1;
    else if (shiftVal === "Ca chiều") shiftId = 2;
    else if (shiftVal === "Ca tối") shiftId = 3;
  }

  let savedStaffId = editingStaffId;

  if (editingStaffId) {
    // 1. API CẬP NHẬT NHÂN VIÊN
    const updatePayload = {
      positionId: parseInt(positionId),
      salaryPerShift:
        parseFloat(document.getElementById("empShiftSalary").value) || 0,
      isWorking: document.getElementById("empStatus").value === "Đang làm việc",
      fullName: document.getElementById("empName").value.trim() || null,
      phone: document.getElementById("empPhone").value.trim() || null,
      citizenId: document.getElementById("empCccd").value.trim() || null,
      address: document.getElementById("empAddress").value.trim() || null,
      avatar: uploadedAvatarPath,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/staffs/update?id=${editingStaffId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        },
      );

      const result = await response.json();
      if (!response.ok || !result.status) {
        showPetToast(
          getApiErrorMessage(result, "Cập nhật nhân viên thất bại!"),
          "error",
        );
        return;
      }
    } catch (e) {
      console.error(e);
      showPetToast("Lỗi kết nối khi cập nhật nhân viên!", "error");
      return;
    }
  } else {
    // 2. API TẠO NHÂN VIÊN MỚI
    const email = document.getElementById("empEmail").value.trim();
    if (!email) {
      showPetToast("Vui lòng nhập Email làm việc cho tài khoản!", "error");
      return;
    }

    const createPayload = {
      username: email.split("@")[0],
      email: email,
      password: "Password123!",
      positionId: parseInt(positionId),
      salaryPerShift:
        parseFloat(document.getElementById("empShiftSalary").value) || 0,
      fullName: document.getElementById("empName").value.trim() || null,
      phone: document.getElementById("empPhone").value.trim() || null,
      citizenId: document.getElementById("empCccd").value.trim() || null,
      address: document.getElementById("empAddress").value.trim() || null,
      avatar: uploadedAvatarPath,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/staffs/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPayload),
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        showPetToast(
          getApiErrorMessage(result, "Tạo nhân viên thất bại!"),
          "error",
        );
        return;
      }
      savedStaffId = result.data?.staffId;
    } catch (e) {
      console.error(e);
      showPetToast("Lỗi kết nối khi tạo nhân viên!", "error");
      return;
    }
  }

  // 3. NẾU CÓ CHỌN PHÂN CA LÀM VIỆC TẠI TAB 2 -> GỬI API PHÂN CA
  if (savedStaffId && shiftId && selectedScheduleRadio) {
    const customDays = Array.from(
      document.querySelectorAll(".day-cb:checked"),
    ).map((cb) => cb.value);
    const assignPayload = {
      staff_id: savedStaffId,
      shift_id: shiftId,
      pattern: selectedScheduleRadio.value,
      custom_days: customDays,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };

    try {
      await fetch(`${API_BASE_URL}/admin/shifts/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignPayload),
      });
    } catch (e) {
      console.error("Lỗi phân ca:", e);
    }
  }

  showPetToast("🎉 Lưu thông tin & Phân ca nhân viên thành công!", "success");
  closeEmpModal();
  loadStaffList(token);
  loadSummaryStats(token);
}

/**
 * 📷 Upload Ảnh đại diện trong Modal
 */
async function handleUploadAvatar(file, token) {
  if (!file.type.startsWith("image/")) {
    showPetToast("Vui lòng chọn tệp hình ảnh hợp lệ!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("avatar_file", file);

  try {
    showPetToast("⏳ Đang tải ảnh...", "success");

    const response = await fetch(
      `${API_BASE_URL}/staff/profile/upload-avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const result = await response.json();
    if (!response.ok || !result.status) {
      showPetToast("Upload ảnh thất bại!", "error");
      return;
    }

    uploadedAvatarPath = result.data;
    const avatarPreview = document.getElementById("avatarPreview");
    if (avatarPreview) avatarPreview.src = getImageUrl(uploadedAvatarPath);

    showPetToast("Tải ảnh đại diện thành công!", "success");
  } catch (e) {
    console.error(e);
    showPetToast("Lỗi tải ảnh lên máy chủ!", "error");
  }
}

/**
 * 🔴 Mở Modal Xác nhận Xóa / Ngừng làm việc
 */
function openDeleteModal(staffId, staffName) {
  deletingStaffId = staffId;
  document.getElementById("deleteEmpName").textContent = staffName;
  document.getElementById("deleteEmpCode").textContent = `ID: ${staffId}`;

  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) deleteModal.classList.add("active");
}

/**
 * 🔒 Xác nhận Thay đổi Trạng thái Làm việc / Khóa Tài Khoản
 */
async function confirmToggleStatus(token) {
  if (!deletingStaffId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/staffs/toggle-status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: deletingStaffId }),
    });

    const result = await response.json();
    if (!response.ok || !result.status) {
      showPetToast("Đổi trạng thái nhân viên thất bại!", "error");
      return;
    }

    showPetToast(
      result.message || "Đổi trạng thái làm việc thành công!",
      "success",
    );
    closeDeleteModal();
    loadStaffList(token);
    loadSummaryStats(token);
  } catch (e) {
    console.error(e);
    showPetToast("Lỗi kết nối máy chủ!", "error");
  }
}

function closeEmpModal() {
  const modal = document.getElementById("employeeModal");
  if (modal) modal.classList.remove("active");
}

function closeDeleteModal() {
  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) deleteModal.classList.remove("active");
  deletingStaffId = null;
}

/**
 * 🛠️ CÁC HÀM TIỆN ÍCH
 */

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
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZWFmN2IiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNhM2UxYTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  if (!path || path.trim() === "" || path === "null") return defaultSvg;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  )
    return path;

  return `http://localhost:8000/${path.startsWith("/") ? path.slice(1) : path}`;
}

function setupShiftToggleLogic() {
  const shiftRadios = document.querySelectorAll('input[name="shiftType"]');
  shiftRadios.forEach((radio) => {
    radio.addEventListener("click", function () {
      if (this.wasChecked) {
        this.checked = false;
        this.wasChecked = false;
      } else {
        shiftRadios.forEach((r) => (r.wasChecked = false));
        this.wasChecked = true;
      }
    });
  });

  const scheduleRadios = document.querySelectorAll(
    'input[name="schedulePattern"]',
  );
  const daysCheckboxGroup = document.getElementById("daysCheckboxGroup");

  scheduleRadios.forEach((radio) => {
    radio.addEventListener("click", function () {
      if (this.wasChecked) {
        this.checked = false;
        this.wasChecked = false;
        if (daysCheckboxGroup) daysCheckboxGroup.style.display = "none";
      } else {
        scheduleRadios.forEach((r) => (r.wasChecked = false));
        this.wasChecked = true;

        if (daysCheckboxGroup) {
          daysCheckboxGroup.style.display =
            this.value === "custom" ? "flex" : "none";
        }
      }
    });
  });
}

/**
 * 🍿 Hiển thị Toast mượt góc trên bên phải màn hình
 */
function showPetToast(message, type = "success") {
  if (!document.getElementById("pet-toast-animation-style")) {
    const style = document.createElement("style");
    style.id = "pet-toast-animation-style";
    style.innerHTML = `
      @keyframes slideInRight {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  let container = document.getElementById("pet-toast-container");
  if (!container && window.parent && window.parent.document) {
    container = window.parent.document.getElementById("pet-toast-container");
  }
  if (!container) {
    container = document.createElement("div");
    container.id = "pet-toast-container";
    document.body.appendChild(container);
  }

  container.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 999999 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    pointer-events: none !important;
  `;

  const toast = document.createElement("div");
  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  const icon = type === "success" ? "✓" : "✕";

  toast.style.cssText = `
    pointer-events: auto;
    min-width: 260px;
    max-width: 360px;
    padding: 12px 18px;
    background: #ffffff;
    color: #2c3e50;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border-left: 5px solid ${bgColor};
    animation: slideInRight 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `;

  toast.innerHTML = `
    <span style="width: 22px; height: 22px; background: ${bgColor}; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0;">${icon}</span>
    <span style="flex: 1; line-height: 1.4;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease-in forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
