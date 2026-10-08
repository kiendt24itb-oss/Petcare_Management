/**
 * 🛠️ FILE: ServiceManagement.js
 * Quản lý Dịch vụ & Loại dịch vụ - Tích hợp Laravel API v1 chuẩn
 * (Đã cập nhật: Tất cả dịch vụ đều gán phòng tự động dựa trên Loại phòng)
 */

const SERVER_HOST = "http://127.0.0.1:8000";
const BASE_URL = `${SERVER_HOST}/api/v1`;

let globalServiceCategories = [];
let globalRoomTypes = [];
let globalRooms = [];
let globalServices = [];

let selectedCategoryId = "all";
let selectedStatus = "all";
let tempUploadedImageUrl = null;

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    console.warn("⚠️ Chưa tìm thấy Token hợp lệ. Vui lòng đăng nhập!");
    showLocalToast("Phiên đăng nhập hết hạn hoặc chưa xác thực!", "error");
    return;
  }

  // 1. Khởi tạo dữ liệu ban đầu
  initServiceManagement(token);

  // 2. Lắng nghe Bộ lọc Trạng thái
  const statusFilterEl = document.getElementById("statusFilter");
  if (statusFilterEl) {
    statusFilterEl.addEventListener("change", function (e) {
      selectedStatus = e.target.value;
      renderTable();
    });
  }

  // 3. Đăng ký sự kiện Modal
  setupModalEvents(token);
});

/* ==========================================================================
   🔑 AUTH & TOKEN HELPER
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

async function initServiceManagement(token) {
  await Promise.all([
    fetchServiceCategories(token),
    fetchRoomTypes(token),
    fetchRooms(token),
    fetchServices(token),
  ]);

  renderHeaderStats();
  renderSidebarCategory();
  renderTable();
}

/* ==========================================================================
   📡 FETCH DATA FROM API
   ========================================================================== */

async function fetchServiceCategories(token) {
  try {
    const res = await fetch(`${BASE_URL}/service-categories`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      globalServiceCategories = result.data || [];
    }
  } catch (err) {
    console.error("Lỗi lấy Service Categories:", err);
  }
}

async function fetchRoomTypes(token) {
  try {
    const res = await fetch(`${BASE_URL}/room-types`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      globalRoomTypes = result.data || [];
    }
  } catch (err) {
    console.error("Lỗi lấy Room Types:", err);
  }
}

async function fetchRooms(token) {
  try {
    const res = await fetch(`${BASE_URL}/rooms`, {
      // Hoặc ${BASE_URL}/admin/rooms
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      globalRooms = result.data || [];
    }
  } catch (err) {
    console.error("Lỗi lấy Rooms:", err);
  }
}

async function fetchServices(token) {
  try {
    const res = await fetch(`${BASE_URL}/services`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      globalServices = result.data || [];
    }
  } catch (err) {
    console.error("Lỗi lấy Services:", err);
    showLocalToast("Không thể kết nối đến máy chủ!", "error");
  }
}

/* ==========================================================================
   ⚙️ BỘ GEN MÃ TỰ TĂNG
   ========================================================================== */

function generateNextCode(prefix, currentList, codeKey = "serviceCode") {
  let maxNum = 0;

  currentList.forEach((item) => {
    const codeVal =
      item[codeKey] || item.categoryCode || item.code || item.serviceCode || "";
    if (codeVal) {
      const match = String(codeVal).match(/\d+/g);
      if (match) {
        const num = parseInt(match[match.length - 1], 10);
        if (num > maxNum) maxNum = num;
      }
    } else {
      const itemId = item.serviceId || item.categoryId || item.id;
      if (itemId && !isNaN(itemId) && parseInt(itemId, 10) > maxNum) {
        maxNum = parseInt(itemId, 10);
      }
    }
  });

  const nextNum = maxNum + 1;
  const formattedNum = String(nextNum).padStart(3, "0");
  return `${prefix}-A${formattedNum}`;
}

/* ==========================================================================
   📊 RENDER STATS, SIDEBAR & TABLE
   ========================================================================== */

function renderHeaderStats() {
  const statsContainer = document.getElementById("statsGrid");
  if (!statsContainer) return;

  let html = `
    <div class="stat-card card-0">
      <div class="stat-icon"><i class="fa-solid fa-list-check"></i></div>
      <div class="stat-info">
        <div class="label">Tổng dịch vụ</div>
        <div class="value-box">
          <span class="value">${globalServices.length}</span>
          <span class="unit">Gói dịch vụ</span>
        </div>
      </div>
    </div>
  `;

  globalServiceCategories.forEach((cat, idx) => {
    const catId = cat.categoryId || cat.id;
    const count = globalServices.filter(
      (s) => Number(s.categoryId) === Number(catId),
    ).length;
    const iconClass = cat.icon || "fa-concierge-bell";
    const cardClass = `card-${(idx % 4) + 1}`;

    html += `
      <div class="stat-card ${cardClass}">
        <div class="stat-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="stat-info">
          <div class="label">${cat.categoryName || cat.name}</div>
          <div class="value-box">
            <span class="value">${count}</span>
            <span class="unit">Gói dịch vụ</span>
          </div>
        </div>
      </div>
    `;
  });

  statsContainer.innerHTML = html;
}

function renderSidebarCategory() {
  const ul = document.getElementById("categoryList");
  if (!ul) return;

  let html = `
    <li class="category-item ${selectedCategoryId === "all" ? "active" : ""}" data-category-id="all">
      <span><i class="fa-solid fa-border-all"></i> Tất cả dịch vụ</span>
      <span class="count">${globalServices.length}</span>
    </li>
  `;

  globalServiceCategories.forEach((cat) => {
    const catId = cat.categoryId || cat.id;
    const catName = cat.categoryName || cat.name;
    const count = globalServices.filter(
      (s) => Number(s.categoryId) === Number(catId),
    ).length;
    const isActive = String(selectedCategoryId) === String(catId);
    const iconClass = cat.icon || "fa-folder";

    html += `
      <li class="category-item ${isActive ? "active" : ""}" data-category-id="${catId}">
        <span><i class="fa-solid ${iconClass}"></i> ${catName}</span>
        <span class="count">${count}</span>
      </li>
    `;
  });

  ul.innerHTML = html;

  ul.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", function () {
      ul.querySelectorAll(".category-item").forEach((i) =>
        i.classList.remove("active"),
      );
      this.classList.add("active");
      selectedCategoryId = this.dataset.categoryId;
      renderTable();
    });
  });
}

function renderTable() {
  const tbody = document.getElementById("serviceTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = globalServices.filter((s) => {
    const matchCat =
      selectedCategoryId === "all" ||
      String(s.categoryId) === String(selectedCategoryId);

    let matchStatus = true;
    if (selectedStatus !== "all") {
      const statusUpper = (s.status || "").toUpperCase();
      if (selectedStatus === "Đang hoạt động") {
        matchStatus =
          statusUpper === "ACTIVE" || statusUpper === "ĐANG HOẠT ĐỘNG";
      } else if (selectedStatus === "Bảo trì") {
        matchStatus =
          statusUpper === "MAINTENANCE" || statusUpper === "BẢO TRÌ";
      } else if (selectedStatus === "Tạm ngưng") {
        matchStatus = statusUpper === "INACTIVE" || statusUpper === "TẠM NGƯNG";
      }
    }
    return matchCat && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: #94a3b8;">Không tìm thấy dịch vụ phù hợp</td></tr>`;
    return;
  }

  filtered.forEach((s) => {
    const tr = document.createElement("tr");

    const cat = globalServiceCategories.find(
      (c) => String(c.categoryId || c.id) === String(s.categoryId),
    );
    const categoryName = cat
      ? cat.categoryName || cat.name
      : s.categoryName || "Chưa phân loại";

    // Tất cả dịch vụ hiển thị Loại phòng áp dụng
    let roomLocationDisplay = "Gán tự động";
    if (s.requiredRoomTypeName) {
      roomLocationDisplay = `<span style="color:#475569;"><i class="fa-solid fa-door-open"></i> Loại: ${s.requiredRoomTypeName}</span>`;
    }

    const sId = s.serviceId || s.id;
    const sCode = s.serviceCode || s.code || `SV-A${sId}`;
    const sName = s.serviceName || s.name;
    const sPrice = s.price ? Number(s.price).toLocaleString() : "0";
    const sDuration = s.duration ? `${s.duration} phút` : "Theo yêu cầu";
    const sImg = s.imageUrl || "https://via.placeholder.com/80?text=PetCare";

    tr.innerHTML = `
      <td>
        <div class="product-item-cell">
          <img src="${sImg}" class="product-img" alt="${sName}">
          <div>
            <div class="product-info-name">${sName}</div>
            <div class="product-code">Mã DV: ${sCode}</div>
          </div>
        </div>
      </td>
      <td><span class="category-tag"><i class="fa-solid fa-tag"></i> ${categoryName}</span></td>
      <td><strong style="color: #ea580c;">${sPrice}đ</strong></td>
      <td><span class="duration-text"><i class="fa-regular fa-clock"></i> ${sDuration}</span></td>
      <td><span style="font-size: 11px;">${roomLocationDisplay}</span></td>
      <td>${getStatusBadge(s.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-edit" title="Chỉnh sửa dịch vụ" onclick="openEditServiceModal(${sId})">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="btn-icon btn-delete" title="Xóa dịch vụ" onclick="deleteService(${sId})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getStatusBadge(status) {
  const st = (status || "").toUpperCase();
  if (st === "ACTIVE" || st === "ĐANG HOẠT ĐỘNG") {
    return `<span class="badge-status normal">Đang hoạt động</span>`;
  }
  if (st === "MAINTENANCE" || st === "BẢO TRÌ") {
    return `<span class="badge-status low">Bảo trì</span>`;
  }
  return `<span class="badge-status out">Tạm ngưng</span>`;
}

/* ==========================================================================
   📝 XỬ LÝ MODAL & FORM EVENTS
   ========================================================================== */

function setupModalEvents(token) {
  document
    .getElementById("btnOpenAddCategoryModal")
    ?.addEventListener("click", () => {
      openAddCategoryModal(token);
    });

  document
    .getElementById("btnOpenAddServiceModal")
    ?.addEventListener("click", () => {
      openAddServiceModal(token);
    });

  document.getElementById("btnExportExcel")?.addEventListener("click", () => {
    openReportModal();
  });
}

/* --------------------------------------------------------------------------
   MODAL 1: THÊM LOẠI DỊCH VỤ
   -------------------------------------------------------------------------- */
function openAddCategoryModal(token) {
  const nextCode = generateNextCode(
    "CAT",
    globalServiceCategories,
    "categoryCode",
  );
  const modalHTML = `
    <div class="modal-backdrop" id="modalAddCategory">
      <div class="modal-box">
        <div class="modal-header">
          <h3><i class="fa-solid fa-folder-plus"></i> Thêm loại dịch vụ</h3>
          <button class="modal-close-btn" onclick="closeModal('modalAddCategory')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group-modal">
            <label>Mã loại dịch vụ</label>
            <input type="text" class="input-modal" value="${nextCode}" readonly id="catCode" />
          </div>
          <div class="form-group-modal">
            <label>Tên loại dịch vụ <span class="req">*</span></label>
            <input type="text" class="input-modal" id="catName" placeholder="Ví dụ: PET HOTEL, PET SPA & GROOMING..." />
          </div>
          <div class="form-group-modal">
            <label>Mô tả loại dịch vụ</label>
            <textarea class="textarea-modal" id="catDesc" rows="3" placeholder="Nhập mô tả chi tiết..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-m-cancel" onclick="closeModal('modalAddCategory')">Hủy</button>
          <button class="btn-m-save" id="btnSaveCategory">Lưu lại</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("modalContainer").innerHTML = modalHTML;

  document
    .getElementById("btnSaveCategory")
    ?.addEventListener("click", async () => {
      const nameInput = document.getElementById("catName");
      const descInput = document.getElementById("catDesc");

      if (!nameInput || !nameInput.value.trim()) {
        showLocalToast("Vui lòng nhập tên loại dịch vụ!", "error");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/admin/service-categories/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            categoryName: nameInput.value.trim(),
            description: descInput ? descInput.value.trim() : "",
          }),
        });

        const result = await res.json();
        if (res.ok && (result.status || result.success)) {
          showLocalToast("Tạo loại dịch vụ thành công!", "success");
          closeModal("modalAddCategory");
          initServiceManagement(token);
        } else {
          showLocalToast(
            result.message || "Tạo loại dịch vụ thất bại!",
            "error",
          );
        }
      } catch (e) {
        showLocalToast("Lỗi kết nối máy chủ!", "error");
      }
    });
}

/* --------------------------------------------------------------------------
   MODAL 2: THÊM DỊCH VỤ MỚI & SỬA DỊCH VỤ
   -------------------------------------------------------------------------- */
function openAddServiceModal(token) {
  renderServiceFormModal(token, null);
}

function openEditServiceModal(serviceId) {
  const token = getAuthToken();
  const service = globalServices.find(
    (s) => Number(s.serviceId) === Number(serviceId),
  );
  if (!service) {
    showLocalToast("Không tìm thấy thông tin dịch vụ!", "error");
    return;
  }
  renderServiceFormModal(token, service);
}

function renderServiceFormModal(token, serviceData = null) {
  tempUploadedImageUrl = serviceData ? serviceData.imageUrl : null;
  const isEdit = !!serviceData;
  const nextCode = isEdit
    ? serviceData.serviceCode
    : generateNextCode("SV", globalServices, "serviceCode");

  let categoryOptionsHTML = globalServiceCategories
    .map((cat) => {
      const catId = cat.categoryId || cat.id;
      const isSelected =
        isEdit && Number(serviceData.categoryId) === Number(catId)
          ? "selected"
          : "";
      return `<option value="${catId}" ${isSelected}>${cat.categoryName || cat.name}</option>`;
    })
    .join("");

  const modalHTML = `
    <div class="modal-backdrop" id="modalServiceForm">
      <div class="modal-box">
        <div class="modal-header">
          <h3><i class="fa-solid fa-concierge-bell"></i> ${isEdit ? "Chỉnh sửa gói dịch vụ" : "Thêm dịch vụ mới"}</h3>
          <button class="modal-close-btn" onclick="closeModal('modalServiceForm')">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="srvEditId" value="${isEdit ? serviceData.serviceId : ""}" />

          <!-- Ảnh đại diện dịch vụ -->
          <div class="form-group-modal">
            <label>Hình ảnh đại diện dịch vụ</label>
            <div class="service-img-uploader">
              <img src="${tempUploadedImageUrl || "https://via.placeholder.com/80?text=PetCare"}" id="srvImgPreview" class="service-preview-img" alt="Preview">
              <button type="button" class="btn-upload-trigger" id="btnTriggerUpload">
                📷 Chọn hình ảnh
              </button>
              <input type="file" id="srvInputFile" accept="image/*" style="display:none;" />
            </div>
          </div>

          <div class="grid-2col-modal">
            <div class="form-group-modal">
              <label>Mã dịch vụ</label>
              <input type="text" class="input-modal" value="${nextCode}" id="srvCode" readonly />
            </div>
            <div class="form-group-modal">
              <label>Loại dịch vụ <span class="req">*</span></label>
              <select class="select-modal" id="srvCategorySelect">
                ${categoryOptionsHTML}
              </select>
            </div>
          </div>

          <div class="form-group-modal">
            <label>Tên gói dịch vụ <span class="req">*</span></label>
            <input type="text" class="input-modal" id="srvName" value="${isEdit ? serviceData.serviceName : ""}" placeholder="Nhập tên gói dịch vụ..." />
          </div>

          <div class="grid-2col-modal">
            <div class="form-group-modal">
              <label>Giá dịch vụ (VNĐ) <span class="req">*</span></label>
              <input type="number" class="input-modal" id="srvPrice" value="${isEdit ? serviceData.price : ""}" placeholder="Ví dụ: 250000" />
            </div>
            <div class="form-group-modal">
              <label>Thời gian thực hiện (Phút) <span class="req">*</span></label>
              <input type="number" class="input-modal" id="srvDuration" value="${isEdit ? serviceData.duration : ""}" placeholder="Ví dụ: 60" />
            </div>
          </div>

          <div class="form-group-modal" id="roomTypeContainer"></div>

          <div class="form-group-modal">
            <label>Mô tả dịch vụ</label>
            <textarea class="textarea-modal" id="srvDesc" rows="2" placeholder="Mô tả dịch vụ...">${isEdit ? serviceData.description || "" : ""}</textarea>
          </div>

          <div class="form-group-modal">
            <label>Trạng thái ban đầu</label>
            <select class="select-modal" id="srvStatus">
              <option value="ACTIVE" ${isEdit && serviceData.status === "ACTIVE" ? "selected" : ""}>Đang hoạt động</option>
              <option value="MAINTENANCE" ${isEdit && serviceData.status === "MAINTENANCE" ? "selected" : ""}>Bảo trì</option>
              <option value="INACTIVE" ${isEdit && serviceData.status === "INACTIVE" ? "selected" : ""}>Tạm ngưng</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-m-cancel" onclick="closeModal('modalServiceForm')">Hủy</button>
          <button class="btn-m-save" id="btnSaveService">Lưu gói dịch vụ</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("modalContainer").innerHTML = modalHTML;

  // Lắng nghe nút Upload
  document.getElementById("btnTriggerUpload")?.addEventListener("click", () => {
    document.getElementById("srvInputFile")?.click();
  });

  document.getElementById("srvInputFile")?.addEventListener("change", (e) => {
    handleImageUpload(e, token);
  });

  const catSelect = document.getElementById("srvCategorySelect");
  if (catSelect) {
    catSelect.addEventListener("change", (e) => {
      renderRoomTypeSelectBox(e.target.value, null);
    });

    const initialCatId = isEdit
      ? serviceData.categoryId
      : globalServiceCategories[0]?.categoryId ||
        globalServiceCategories[0]?.id;
    const initialRoomTypeId = isEdit ? serviceData.requiredRoomTypeId : null;

    renderRoomTypeSelectBox(initialCatId, initialRoomTypeId);
  }

  document.getElementById("btnSaveService")?.addEventListener("click", () => {
    saveService(token, isEdit);
  });
}

function renderRoomTypeSelectBox(selectedCatId, selectedRoomTypeId = null) {
  const roomTypeBox = document.getElementById("roomTypeContainer");
  if (!roomTypeBox) return;

  const filteredRoomTypes = globalRoomTypes.filter(
    (rt) => String(rt.categoryId) === String(selectedCatId),
  );

  let typeOptions = `<option value="">-- Chọn loại phòng áp dụng --</option>`;
  filteredRoomTypes.forEach((t) => {
    const isSelected =
      selectedRoomTypeId && String(t.roomTypeId) === String(selectedRoomTypeId)
        ? "selected"
        : "";
    typeOptions += `<option value="${t.roomTypeId}" ${isSelected}>${t.typeName}</option>`;
  });

  roomTypeBox.innerHTML = `
    <label>Loại phòng áp dụng <span class="req">*</span></label>
    <select class="select-modal" id="srvRoomType">
      ${typeOptions}
    </select>
  `;
}

async function handleImageUpload(event, token) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showLocalToast("Vui lòng chọn file hình ảnh hợp lệ!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("image_file", file);

  try {
    showLocalToast("Đang tải ảnh lên...", "success");
    const res = await fetch(`${BASE_URL}/admin/services/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
    });

    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      tempUploadedImageUrl = result.data;
      const previewImg = document.getElementById("srvImgPreview");
      if (previewImg) previewImg.src = tempUploadedImageUrl;
      showLocalToast("Tải ảnh thành công!", "success");
    } else {
      showLocalToast(result.message || "Tải ảnh thất bại!", "error");
    }
  } catch (e) {
    showLocalToast("Lỗi kết nối máy chủ khi upload ảnh!", "error");
  }
}

async function saveService(token, isEdit = false) {
  const serviceId = document.getElementById("srvEditId")?.value;
  const categoryId = document.getElementById("srvCategorySelect")?.value;
  const name = document.getElementById("srvName")?.value.trim();
  const price = parseFloat(document.getElementById("srvPrice")?.value);
  const duration = parseInt(document.getElementById("srvDuration")?.value, 10);
  const requiredRoomTypeId = document.getElementById("srvRoomType")?.value;
  const description = document.getElementById("srvDesc")?.value.trim();
  const status = document.getElementById("srvStatus")?.value;

  if (!name || isNaN(price) || price < 0) {
    showLocalToast("Vui lòng nhập tên gói và giá dịch vụ hợp lệ!", "error");
    return;
  }

  if (isNaN(duration) || duration <= 0) {
    showLocalToast("Vui lòng nhập thời lượng thực hiện (> 0 phút)!", "error");
    return;
  }

  if (!requiredRoomTypeId) {
    showLocalToast("Vui lòng chọn Loại phòng áp dụng cho dịch vụ!", "error");
    return;
  }

  const payload = {
    categoryId: parseInt(categoryId, 10),
    serviceName: name,
    requiredRoomTypeId: parseInt(requiredRoomTypeId, 10),
    duration: duration,
    price: price,
    description: description || "",
    imageUrl: tempUploadedImageUrl || "",
    status: status || "ACTIVE",
  };

  if (isEdit) {
    payload.serviceId = parseInt(serviceId, 10);
  }

  const endpoint = isEdit
    ? `${BASE_URL}/admin/services/update`
    : `${BASE_URL}/admin/services/create`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      showLocalToast(
        isEdit ? "Cập nhật dịch vụ thành công!" : "Tạo dịch vụ mới thành công!",
        "success",
      );
      closeModal("modalServiceForm");
      initServiceManagement(token);
    } else {
      showLocalToast(result.message || "Thao tác dịch vụ thất bại!", "error");
    }
  } catch (e) {
    showLocalToast("Lỗi kết nối máy chủ!", "error");
  }
}

/* --------------------------------------------------------------------------
   MODAL 3: XUẤT BÁO CÁO CSV / EXCEL
   -------------------------------------------------------------------------- */
function openReportModal() {
  const timeStr = new Date().toLocaleTimeString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const total = globalServices.length;
  const activeCount = globalServices.filter(
    (s) => (s.status || "").toUpperCase() === "ACTIVE",
  ).length;
  const maintCount = total - activeCount;

  let rowsHTML = "";
  globalServices.forEach((s) => {
    const cat = globalServiceCategories.find(
      (c) => String(c.categoryId || c.id) === String(s.categoryId),
    );
    const categoryName = cat ? cat.categoryName || cat.name : "Chưa phân loại";

    let roomLocationDisplay = "Gán tự động";
    if (s.requiredRoomTypeName) {
      roomLocationDisplay = `Loại: ${s.requiredRoomTypeName}`;
    }

    const sCode = s.serviceCode || s.code || `SV-A${s.serviceId || s.id}`;
    const sName = s.serviceName || s.name;
    const sPrice = s.price ? Number(s.price).toLocaleString() : "0";

    rowsHTML += `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px;"><strong>${sCode}</strong></td>
        <td style="padding: 8px;">${sName}</td>
        <td style="padding: 8px;">${categoryName}</td>
        <td style="padding: 8px; color: #ea580c; font-weight: 600;">${sPrice}đ</td>
        <td style="padding: 8px;">${roomLocationDisplay}</td>
        <td style="padding: 8px;">${getStatusBadge(s.status)}</td>
      </tr>
    `;
  });

  const modalHTML = `
    <div class="modal-backdrop" id="modalServiceReport">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <h3><i class="fa-solid fa-file-excel"></i> Báo Cáo Dịch Vụ & Vị Trí Cung Cấp</h3>
          <button class="modal-close-btn" onclick="closeModal('modalServiceReport')">&times;</button>
        </div>
        <div class="modal-body">
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #1e293b;">Báo cáo tổng quan dịch vụ PetCare</div>
            <div style="font-size: 11px; color: #64748b;">Thời gian xuất: ${timeStr}</div>
          </div>

          <div class="report-summary-cards">
            <div class="report-card">
              <div class="r-title">Tổng số dịch vụ</div>
              <div class="r-val">${total} gói</div>
            </div>
            <div class="report-card">
              <div class="r-title">Đang hoạt động</div>
              <div class="r-val" style="color: #16a34a;">${activeCount} gói</div>
            </div>
            <div class="report-card">
              <div class="r-title">Bảo trì / Tạm ngưng</div>
              <div class="r-val" style="color: #ef4444;">${maintCount} gói</div>
            </div>
          </div>

          <div style="max-height: 280px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;">
            <table>
              <thead>
                <tr>
                  <th>Mã DV</th>
                  <th>Tên dịch vụ</th>
                  <th>Loại Dịch Vụ</th>
                  <th>Giá tham khảo</th>
                  <th>Vị trí phòng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-m-cancel" onclick="closeModal('modalServiceReport')">Đóng</button>
          <button class="btn-m-excel" onclick="exportToCSV()"><i class="fa-solid fa-download"></i> Tải về Excel (.csv)</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("modalContainer").innerHTML = modalHTML;
}

function exportToCSV() {
  let csvContent = "\uFEFF";
  csvContent +=
    "Mã DV,Tên Dịch Vụ,Loại Dịch Vụ,Giá Tham Khảo,Vị Trí Phòng,Trạng Thái\n";

  globalServices.forEach((s) => {
    const cat = globalServiceCategories.find(
      (c) => String(c.categoryId || c.id) === String(s.categoryId),
    );
    const categoryName = cat ? cat.categoryName || cat.name : "Chưa phân loại";

    let roomLocationDisplay = "Gán tự động";
    if (s.requiredRoomTypeName) {
      roomLocationDisplay = `Loại: ${s.requiredRoomTypeName}`;
    }

    const sCode = s.serviceCode || s.code || `SV-A${s.serviceId || s.id}`;
    const sName = `"${(s.serviceName || s.name || "").replace(/"/g, '""')}"`;
    const location = `"${roomLocationDisplay.replace(/"/g, '""')}"`;

    csvContent += `${sCode},${sName},"${categoryName}",${s.price || 0},${location},"${s.status || "ACTIVE"}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const today = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `Bao_Cao_Dich_Vu_PetCare_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showLocalToast("Đã tải xuống báo cáo Excel (.csv) thành công!", "success");
}

/* ==========================================================================
   🛠️ COMMON HELPER FUNCTIONS
   ========================================================================== */

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.remove();
}

async function deleteService(id) {
  if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ này không?`)) return;
  const token = getAuthToken();

  try {
    const res = await fetch(`${BASE_URL}/admin/services/delete?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      showLocalToast("Đã xóa dịch vụ thành công!", "success");
      initServiceManagement(token);
    } else {
      showLocalToast(result.message || "Xóa dịch vụ thất bại!", "error");
    }
  } catch (e) {
    showLocalToast("Lỗi kết nối khi xóa dịch vụ!", "error");
  }
}

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
        "position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;";
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
