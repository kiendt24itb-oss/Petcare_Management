/**
 * 🏠 FILE: RoomManagement.js
 * Quản lý Phòng & Loại phòng - Đã sửa triệt để lỗi không load dropdown Loại dịch vụ & Loại phòng
 */

const SERVER_HOST = "http://127.0.0.1:8000";
const BASE_URL = `${SERVER_HOST}/api/v1`;

let globalServiceCategories = [];
let globalRoomTypes = [];
let globalRooms = [];

let activeFilter = "all";
let activeStatus = "all";

// Biến lưu trạng thái tạm thời đang chọn trong Modal Xem chi tiết
let selectedModalStatus = null;

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    console.warn("⚠️ Chưa tìm thấy Token hợp lệ. Vui lòng đăng nhập!");
    showLocalToast("Phiên đăng nhập hết hạn hoặc chưa xác thực!", "error");
    return;
  }

  // 1. Tải dữ liệu ban đầu
  initRoomManagement(token);

  // 2. Lắng nghe Bộ lọc Trạng thái
  const statusFilterEl = document.getElementById("statusFilter");
  if (statusFilterEl) {
    statusFilterEl.addEventListener("change", function (e) {
      activeStatus = e.target.value;
      renderRoomTable();
    });
  }

  // 3. Sự kiện Modal & Form
  setupModalEvents(token);

  // 4. Sự kiện Xem & Xuất Báo cáo Phòng
  setupReportFeature(token);
});

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

async function initRoomManagement(token) {
  await Promise.all([
    fetchServiceCategories(token),
    fetchRoomTypes(token),
    fetchRooms(token),
  ]);

  // Cập nhật ngay dữ liệu vào các Dropdown Select khi dữ liệu tải xong
  populateCategorySelectOptions();
  populateRoomServiceOptions();

  renderSidebarCategories();
  renderRoomTable();
  updateStatsCounters();
}

/* ==========================================================================
   📡 FETCH DATA FROM API
   ========================================================================== */

async function fetchServiceCategories(token) {
  try {
    const res = await fetch(`${BASE_URL}/service-categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
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
    const res = await fetch(`${BASE_URL}/admin/rooms`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      globalRooms = result.data || [];
    }
  } catch (err) {
    console.error("Lỗi lấy Rooms:", err);
    showLocalToast("Không thể kết nối đến máy chủ!", "error");
  }
}

/* ==========================================================================
   ⚙️ BỘ GEN MÃ TỰ TĂNG
   ========================================================================== */

function generateNextCode(prefix, currentList, codeKey = "typeCode") {
  let maxNum = 0;

  currentList.forEach((item) => {
    const codeVal =
      item[codeKey] ||
      item.categoryCode ||
      item.typeCode ||
      item.roomCode ||
      item.code ||
      "";
    if (codeVal) {
      const match = String(codeVal).match(/\d+/g);
      if (match) {
        const num = parseInt(match[match.length - 1], 10);
        if (num > maxNum) maxNum = num;
      }
    } else {
      const itemId =
        item.roomTypeId || item.categoryId || item.roomId || item.id;
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
   📝 XỬ LÝ MODAL & CÁC FORM ACTION
   ========================================================================== */

function setupModalEvents(token) {
  // 1. Mở Modal Thêm Loại Dịch Vụ
  document.getElementById("btnAddService")?.addEventListener("click", () => {
    const serviceCodeInput = document.getElementById("serviceCode");
    if (serviceCodeInput) {
      serviceCodeInput.value = generateNextCode(
        "CAT",
        globalServiceCategories,
        "categoryCode",
      );
    }
    openModal("modalAddService");
  });

  // 2. Mở Modal Thêm Loại Phòng
  document.getElementById("btnAddRoomType")?.addEventListener("click", () => {
    const roomTypeCodeInput = document.getElementById("roomTypeCode");
    if (roomTypeCodeInput) {
      roomTypeCodeInput.value = generateNextCode(
        "RT",
        globalRoomTypes,
        "typeCode",
      );
    }
    populateCategorySelectOptions();
    openModal("modalAddRoomType");
  });

  // 3. Mở Modal Thêm Phòng
  document.getElementById("btnAddRoom")?.addEventListener("click", () => {
    const newRoomCodeInput = document.getElementById("newRoomCode");
    if (newRoomCodeInput) {
      newRoomCodeInput.value = generateNextCode("RM", globalRooms, "roomCode");
    }
    populateRoomServiceOptions();
    openModal("modalAddRoom");
  });

  // 4. Mở Modal Điều Chuyển Nhanh Khẩn Cấp
  document.getElementById("btnQuickTransfer")?.addEventListener("click", () => {
    populateTransferSelects();
    openModal("modalQuickTransfer");
  });

  // Đóng Modal
  document.querySelectorAll(".btn-close-modal, .btn-cancel").forEach((btn) => {
    btn.addEventListener("click", function () {
      const overlay = this.closest(".modal-overlay");
      if (overlay) overlay.classList.remove("active");
    });
  });

  // Submit: Thêm Loại Dịch Vụ
  document
    .querySelector("#modalAddService .btn-save")
    ?.addEventListener("click", async function () {
      const nameInput = document.getElementById("serviceCategoryName");
      const descInput = document.getElementById("serviceCategoryDesc");

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
          closeModal("modalAddService");
          nameInput.value = "";
          if (descInput) descInput.value = "";
          initRoomManagement(token);
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

  // Submit: Thêm Loại Phòng
  document
    .querySelector("#modalAddRoomType .btn-save")
    ?.addEventListener("click", async function () {
      const catSelect = document.getElementById("selectRoomTypeCategory");
      const typeNameInput = document.getElementById("roomTypeName");
      const descInput = document.getElementById("roomTypeDesc");

      if (!catSelect || !catSelect.value) {
        showLocalToast("Vui lòng chọn loại hình dịch vụ!", "error");
        return;
      }

      if (!typeNameInput || !typeNameInput.value.trim()) {
        showLocalToast("Vui lòng nhập tên loại phòng!", "error");
        return;
      }

      const selectedCategoryId = parseInt(catSelect.value, 10);

      const payload = {
        categoryId: selectedCategoryId,
        typeName: typeNameInput.value.trim(),
        description: descInput ? descInput.value.trim() : "",
      };

      try {
        const res = await fetch(`${BASE_URL}/admin/room-types/create`, {
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
          showLocalToast("Tạo loại phòng mới thành công!", "success");
          closeModal("modalAddRoomType");
          typeNameInput.value = "";
          if (descInput) descInput.value = "";
          initRoomManagement(token);
        } else {
          showLocalToast(
            result.message || result.error || "Tạo loại phòng thất bại!",
            "error",
          );
        }
      } catch (e) {
        showLocalToast("Lỗi kết nối máy chủ!", "error");
      }
    });

  // Dropdown phụ thuộc trong Modal Thêm Phòng: Chọn loại dịch vụ -> Load loại phòng
  const selectRoomService = document.getElementById("selectRoomService");
  if (selectRoomService) {
    selectRoomService.addEventListener("change", function () {
      const catId = this.value;
      const selectRoomType = document.getElementById("selectRoomType");

      if (!catId) {
        selectRoomType.innerHTML = `<option value="">-- Chọn loại dịch vụ trước --</option>`;
        return;
      }

      const filteredTypes = globalRoomTypes.filter(
        (rt) => String(rt.categoryId || rt.category_id) === String(catId),
      );

      if (filteredTypes.length === 0) {
        selectRoomType.innerHTML = `<option value="">-- Dịch vụ này chưa có loại phòng nào --</option>`;
        return;
      }

      let html = `<option value="">-- Chọn loại phòng --</option>`;
      filteredTypes.forEach((t) => {
        const typeId = t.roomTypeId || t.room_type_id || t.id;
        const typeName = t.typeName || t.type_name;
        if (typeId) {
          html += `<option value="${typeId}">${typeName}</option>`;
        }
      });
      selectRoomType.innerHTML = html;
    });
  }

  // Submit: Thêm Phòng mới
  document
    .querySelector("#modalAddRoom .btn-save")
    ?.addEventListener("click", async function () {
      const roomTypeSelect = document.getElementById("selectRoomType");
      const roomNameInput = document.getElementById("newRoomName");
      const newRoomCodeInput = document.getElementById("newRoomCode");
      const capacityInput = document.getElementById("newRoomCapacity");
      const noteInput = document.getElementById("newRoomNote");

      if (!roomTypeSelect || !roomTypeSelect.value) {
        showLocalToast("Vui lòng chọn loại phòng!", "error");
        return;
      }

      if (!roomNameInput || !roomNameInput.value.trim()) {
        showLocalToast("Vui lòng nhập tên phòng!", "error");
        return;
      }

      const selectedRoomTypeId = parseInt(roomTypeSelect.value, 10);
      const roomCodeVal = newRoomCodeInput ? newRoomCodeInput.value : "";

      try {
        const res = await fetch(`${BASE_URL}/admin/rooms/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            roomName: roomNameInput.value.trim(),
            roomTypeId: selectedRoomTypeId,
            roomCode: roomCodeVal,
            capacity: capacityInput ? capacityInput.value.trim() : null,
            note: noteInput ? noteInput.value.trim() : null,
          }),
        });
        const result = await res.json();
        if (res.ok && (result.status || result.success)) {
          showLocalToast("Tạo phòng mới thành công!", "success");
          closeModal("modalAddRoom");
          roomNameInput.value = "";
          if (capacityInput) capacityInput.value = "";
          if (noteInput) noteInput.value = "";
          initRoomManagement(token);
        } else {
          showLocalToast(result.message || "Tạo phòng thất bại!", "error");
        }
      } catch (e) {
        showLocalToast("Lỗi kết nối máy chủ!", "error");
      }
    });

  // Submit: Lưu cập nhật Trạng thái Phòng
  document
    .getElementById("btnSaveRoomStatus")
    ?.addEventListener("click", async function () {
      const roomId = document.getElementById("detailRoomId")?.value;
      if (!roomId || !selectedModalStatus) {
        showLocalToast("Không tìm thấy thông tin đổi trạng thái!", "error");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/admin/rooms/change-status`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            roomId: parseInt(roomId, 10),
            status: selectedModalStatus,
          }),
        });

        const result = await res.json();
        if (res.ok && (result.status || result.success)) {
          showLocalToast("Đã cập nhật trạng thái phòng thành công!", "success");
          closeModal("modalRoomDetail");

          const room = globalRooms.find(
            (r) => String(r.roomId || r.id) === String(roomId),
          );
          if (room) {
            addActivityLog(
              room.roomName || room.room_name,
              selectedModalStatus,
            );
          }

          initRoomManagement(token);
        } else {
          showLocalToast(
            result.message || "Cập nhật trạng thái thất bại!",
            "error",
          );
        }
      } catch (e) {
        showLocalToast("Lỗi kết nối máy chủ!", "error");
      }
    });

  // Submit: Điều chuyển nhanh khẩn cấp
  document
    .getElementById("btnSubmitTransfer")
    ?.addEventListener("click", async function () {
      const sourceId = document.getElementById("selectSourceRoom")?.value;
      const targetId = document.getElementById("selectTargetRoom")?.value;
      const reason = document.getElementById("transferReason")?.value;

      if (!sourceId || !targetId) {
        showLocalToast("Vui lòng chọn đầy đủ phòng cần chuyển!", "error");
        return;
      }
      if (!reason || !reason.trim()) {
        showLocalToast("Vui lòng nhập lý do điều chuyển!", "error");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/admin/rooms/transfer`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            sourceRoomId: parseInt(sourceId, 10),
            targetRoomId: parseInt(targetId, 10),
            reason: reason.trim(),
          }),
        });

        const result = await res.json();
        if (res.ok && (result.status || result.success)) {
          showLocalToast(
            "Đã thực hiện điều chuyển khẩn cấp thành công!",
            "success",
          );
          closeModal("modalQuickTransfer");
          document.getElementById("transferReason").value = "";

          const sourceRoom = globalRooms.find(
            (r) => String(r.roomId || r.id) === String(sourceId),
          );
          const targetRoom = globalRooms.find(
            (r) => String(r.roomId || r.id) === String(targetId),
          );

          if (sourceRoom && targetRoom) {
            addActivityLog(
              `Điều chuyển: ${sourceRoom.roomName || sourceRoom.room_name} ➔ ${targetRoom.roomName || targetRoom.room_name}`,
              "TRANSFER",
            );
          }

          initRoomManagement(token);
        } else {
          showLocalToast(
            result.message || "Điều chuyển phòng thất bại!",
            "error",
          );
        }
      } catch (e) {
        showLocalToast("Lỗi kết nối máy chủ!", "error");
      }
    });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

function populateCategorySelectOptions() {
  const catSelect = document.getElementById("selectRoomTypeCategory");
  if (!catSelect) return;

  if (!globalServiceCategories || globalServiceCategories.length === 0) {
    catSelect.innerHTML = `<option value="">-- Chưa có loại dịch vụ nào --</option>`;
    return;
  }

  let html = `<option value="">-- Chọn loại dịch vụ --</option>`;
  globalServiceCategories.forEach((c) => {
    const catId = c.categoryId || c.category_id || c.id;
    const catName = c.categoryName || c.category_name;

    if (catId) {
      html += `<option value="${catId}">${catName}</option>`;
    }
  });

  catSelect.innerHTML = html;
}

function populateRoomServiceOptions() {
  const selectRoomService = document.getElementById("selectRoomService");
  const selectRoomType = document.getElementById("selectRoomType");
  if (!selectRoomService) return;

  if (!globalServiceCategories || globalServiceCategories.length === 0) {
    selectRoomService.innerHTML = `<option value="">-- Chưa có loại dịch vụ nào --</option>`;
    return;
  }

  let html = `<option value="">-- Chọn loại dịch vụ --</option>`;
  globalServiceCategories.forEach((c) => {
    const catId = c.categoryId || c.category_id || c.id;
    const catName = c.categoryName || c.category_name;
    if (catId) {
      html += `<option value="${catId}">${catName}</option>`;
    }
  });
  selectRoomService.innerHTML = html;

  if (selectRoomType) {
    selectRoomType.innerHTML = `<option value="">-- Chọn loại dịch vụ trước --</option>`;
  }
}

/* ==========================================================================
   👁️ CHI TIẾT PHÒNG & ĐỔI TRẠNG THÁI KIỂU KHỐI VUÔNG
   ========================================================================== */

function openRoomDetailModal(roomId) {
  const room = globalRooms.find(
    (r) => String(r.roomId || r.id) === String(roomId),
  );
  if (!room) return;

  const roomType = globalRoomTypes.find(
    (rt) =>
      String(rt.roomTypeId || rt.room_type_id) ===
      String(room.roomTypeId || room.room_type_id),
  );
  const category = roomType
    ? globalServiceCategories.find(
        (cat) =>
          String(cat.categoryId || cat.category_id || cat.id) ===
          String(roomType.categoryId || roomType.category_id),
      )
    : null;

  document.getElementById("detailRoomId").value = room.roomId || room.id;
  document.getElementById("detailRoomName").innerText =
    room.roomName || room.room_name;
  document.getElementById("detailRoomCode").innerText =
    room.roomCode || room.room_code || "RM-00" + (room.roomId || room.id);
  document.getElementById("detailServiceGroup").innerText = category
    ? category.categoryName || category.category_name
    : "Dịch vụ";
  document.getElementById("detailRoomType").innerText = roomType
    ? roomType.typeName || roomType.type_name
    : "Loại phòng";
  document.getElementById("detailCapacity").innerText =
    room.capacity || "Không xác định";
  document.getElementById("detailNote").innerText =
    room.note || "Không có ghi chú";

  renderStatusBlocks(room.status);

  openModal("modalRoomDetail");
}

function renderStatusBlocks(currentStatus) {
  const container = document.getElementById("statusBlocksContainer");
  if (!container) return;

  selectedModalStatus = currentStatus;

  const blocks = [
    {
      code: "AVAILABLE",
      title: "Sẵn sàng",
      desc: "Sẵn sàng phục vụ",
      icon: "fa-circle-check",
      canSelect: true,
    },
    {
      code: "MAINTENANCE",
      title: "Bảo trì",
      desc: "Tạm dừng sử dụng",
      icon: "fa-wrench",
      canSelect: true,
    },
  ];

  if (currentStatus === "OCCUPIED" || currentStatus === "Đang sử dụng") {
    blocks.unshift({
      code: "OCCUPIED",
      title: "Đang sử dụng",
      desc: "Do dịch vụ gán",
      icon: "fa-arrows-spin",
      canSelect: false,
    });
  } else if (
    currentStatus === "INACTIVE" ||
    currentStatus === "Không hoạt động"
  ) {
    blocks.unshift({
      code: "INACTIVE",
      title: "Ngừng hoạt động",
      desc: "Trạng thái hiện tại",
      icon: "fa-ban",
      canSelect: false,
    });
  } else if (currentStatus === "ASSIGNED" || currentStatus === "Đã được gán") {
    blocks.unshift({
      code: "ASSIGNED",
      title: "Đã gán Hotel",
      desc: "Khách lưu trú",
      icon: "fa-key",
      canSelect: false,
    });
  }

  let html = "";
  blocks.forEach((b) => {
    const isSelected = selectedModalStatus === b.code;
    const disabledClass = !b.canSelect && !isSelected ? "disabled" : "";

    html += `
      <div class="status-block ${isSelected ? "selected" : ""} ${disabledClass}" data-status="${b.code}" data-canselect="${b.canSelect}">
        <i class="fa-solid ${b.icon}"></i>
        <div class="block-title">${b.title}</div>
        <div class="block-desc">${b.desc}</div>
        <i class="fa-solid fa-circle-check check-badge"></i>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll(".status-block").forEach((el) => {
    el.addEventListener("click", function () {
      const stCode = this.dataset.status;
      const canSelect = this.dataset.canselect === "true";

      if (canSelect || stCode === currentStatus) {
        container
          .querySelectorAll(".status-block")
          .forEach((b) => b.classList.remove("selected"));
        this.classList.add("selected");
        selectedModalStatus = stCode;
      } else {
        showLocalToast(
          "Trạng thái này do hệ thống dịch vụ gán, chỉ được phép chuyển về Bảo trì hoặc Sẵn sàng!",
          "error",
        );
      }
    });
  });
}

/* ==========================================================================
   🔄 POPULATE DỮ LIỆU ĐIỀU CHUYỂN PHÒNG KHẨN CẤP
   ========================================================================== */

function populateTransferSelects() {
  const sourceSelect = document.getElementById("selectSourceRoom");
  const targetSelect = document.getElementById("selectTargetRoom");
  if (!sourceSelect || !targetSelect) return;

  const occupiedRooms = globalRooms.filter(
    (r) => r.status === "OCCUPIED" || r.status === "Đang sử dụng",
  );

  let sourceHtml = `<option value="">-- Chọn phòng đang sử dụng bị lỗi --</option>`;
  occupiedRooms.forEach((r) => {
    sourceHtml += `<option value="${r.roomId || r.id}">${r.roomName || r.room_name} (${r.roomCode || "RM"})</option>`;
  });
  sourceSelect.innerHTML = sourceHtml;

  targetSelect.innerHTML = `<option value="">-- Chọn phòng bị sự cố trước --</option>`;

  sourceSelect.onchange = function () {
    const sourceId = this.value;
    if (!sourceId) {
      targetSelect.innerHTML = `<option value="">-- Chọn phòng bị sự cố trước --</option>`;
      return;
    }

    const selectedSourceRoom = globalRooms.find(
      (r) => String(r.roomId || r.id) === String(sourceId),
    );

    if (!selectedSourceRoom) return;

    const sourceTypeId =
      selectedSourceRoom.roomTypeId || selectedSourceRoom.room_type_id;

    const validTargets = globalRooms.filter((r) => {
      const isAvailable = r.status === "AVAILABLE" || r.status === "Sẵn sàng";
      const isSameType =
        String(r.roomTypeId || r.room_type_id) === String(sourceTypeId);
      const isDifferentRoom =
        String(r.roomId || r.id) !==
        String(selectedSourceRoom.roomId || selectedSourceRoom.id);

      return isAvailable && isSameType && isDifferentRoom;
    });

    if (validTargets.length === 0) {
      targetSelect.innerHTML = `<option value="">-- Không có phòng cùng loại đang Sẵn sàng --</option>`;
      return;
    }

    let targetHtml = `<option value="">-- Chọn phòng thay thế phù hợp --</option>`;
    validTargets.forEach((r) => {
      targetHtml += `<option value="${r.roomId || r.id}">${r.roomName || r.room_name} (${r.roomCode || "RM"})</option>`;
    });
    targetSelect.innerHTML = targetHtml;
  };
}

/* ==========================================================================
   📊 XEM VÀ XUẤT BÁO CÁO PHÒNG
   ========================================================================== */

function setupReportFeature(token) {
  const btnExport = document.getElementById("btnExport");
  const btnDownloadExcel = document.getElementById("btnDownloadExcel");
  if (!btnExport) return;

  let currentReportData = null;

  // 1. Nhấn nút "Báo cáo phòng" -> Gọi API -> Mở Modal Xem trước
  btnExport.addEventListener("click", async function () {
    try {
      showLocalToast("Đang tải dữ liệu báo cáo...", "success");

      const res = await fetch(`${BASE_URL}/admin/rooms/report`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();
      if (res.ok && (result.status || result.success)) {
        currentReportData = result.data;
        renderReportModal(currentReportData);
        openModal("modalRoomReport");
      } else {
        showLocalToast(
          result.message || "Không thể lấy dữ liệu báo cáo!",
          "error",
        );
      }
    } catch (e) {
      showLocalToast("Lỗi kết nối khi lấy báo cáo!", "error");
    }
  });

  // 2. Nhấn nút "Tải về Excel" trong Modal -> Tải file .csv UTF-8
  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener("click", function () {
      if (!currentReportData || !currentReportData.details) {
        showLocalToast("Không có dữ liệu để xuất Excel!", "error");
        return;
      }
      exportToCSV(currentReportData.details);
    });
  }
}

function renderReportModal(data) {
  const genTimeEl = document.getElementById("reportGenTime");
  const summaryEl = document.getElementById("reportSummaryCards");
  const tbody = document.getElementById("reportTableBody");

  if (genTimeEl) {
    // Nếu API có trả về data.generatedAt thì parse thành Date rồi ép về giờ Việt Nam (Asia/Ho_Chi_Minh)
    let timeStr = new Date().toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (data && data.generatedAt) {
      const parsedDate = new Date(data.generatedAt);
      if (!isNaN(parsedDate.getTime())) {
        timeStr = parsedDate.toLocaleTimeString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    }

    genTimeEl.innerText = `Thời gian xuất: ${timeStr}`;
  }

  // Render thẻ thống kê
  if (summaryEl && data.summary) {
    summaryEl.innerHTML = `
      <div class="report-summary-card ready">
        <small>Sẵn sàng</small><br><strong style="font-size:16px;">${data.summary.AVAILABLE || 0}</strong>
      </div>
      <div class="report-summary-card occupied">
        <small>Đang sử dụng</small><br><strong style="font-size:16px;">${data.summary.OCCUPIED || 0}</strong>
      </div>
      <div class="report-summary-card assigned">
        <small>Đã gán Hotel</small><br><strong style="font-size:16px;">${data.summary.ASSIGNED || 0}</strong>
      </div>
      <div class="report-summary-card maintenance">
        <small>Bảo trì</small><br><strong style="font-size:16px;">${data.summary.MAINTENANCE || 0}</strong>
      </div>
    `;
  }

  // Render bảng danh sách phòng
  if (tbody) {
    let html = "";
    (data.details || []).forEach((r) => {
      html += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px;"><strong>${r.roomCode || "-"}</strong></td>
          <td style="padding: 8px;">${r.roomName || "-"}</td>
          <td style="padding: 8px;">${r.categoryName || "-"}</td>
          <td style="padding: 8px;">${r.typeName || "-"}</td>
          <td style="padding: 8px;">${r.capacity || 1}</td>
          <td style="padding: 8px;">${getStatusPill(r.status)}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }
}

function exportToCSV(items) {
  let csvContent = "\uFEFF"; // Byte Order Mark (BOM) UTF-8 để không bị lỗi tiếng Việt trên Excel
  csvContent +=
    "Mã phòng,Tên phòng,Nhóm dịch vụ,Loại phòng,Sức chứa,Trạng thái,Ghi chú\n";

  items.forEach((item) => {
    const row = [
      `"${item.roomCode || ""}"`,
      `"${item.roomName || ""}"`,
      `"${item.categoryName || ""}"`,
      `"${item.typeName || ""}"`,
      `"${item.capacity || 1}"`,
      `"${item.status || ""}"`,
      `"${item.note || ""}"`,
    ];
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Bao_Cao_Phong_PetCare_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showLocalToast("Đã tải xuống file báo cáo Excel thành công!", "success");
}

/* ==========================================================================
   🎨 UI & SIDEBAR HELPER
   ========================================================================== */

function renderSidebarCategories() {
  const categoryListEl = document.getElementById("categoryList");
  if (!categoryListEl) return;

  let html = `
    <li class="category-item ${activeFilter === "all" ? "active" : ""}" data-filter="all">
      <span><i class="fa-solid fa-border-all"></i> Tất cả khu vực</span>
      <span class="count">${globalRooms.length}</span>
    </li>
  `;

  globalServiceCategories.forEach((cat) => {
    const currentCatId = cat.categoryId || cat.category_id || cat.id;
    const catName = cat.categoryName || cat.category_name || "";

    const catTypes = globalRoomTypes.filter(
      (rt) => String(rt.categoryId || rt.category_id) === String(currentCatId),
    );

    html += `
      <li class="category-group-title">
        <i class="fa-solid fa-concierge-bell"></i> ${catName.toUpperCase()}
      </li>
    `;

    catTypes.forEach((type) => {
      const typeId = type.roomTypeId || type.room_type_id || type.id;
      const typeName = type.typeName || type.type_name;
      const typeRoomCount = globalRooms.filter(
        (r) => String(r.roomTypeId || r.room_type_id) === String(typeId),
      ).length;

      const isSelected = activeFilter === `type-${typeId}`;

      html += `
        <li class="category-item sub-item ${isSelected ? "active" : ""}" data-filter="type-${typeId}">
          <span>${typeName}</span>
          <span class="count">${typeRoomCount}</span>
        </li>
      `;
    });
  });

  categoryListEl.innerHTML = html;

  categoryListEl.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", function () {
      categoryListEl
        .querySelectorAll(".category-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      activeFilter = this.dataset.filter;
      renderRoomTable();
    });
  });
}

function renderRoomTable() {
  const tbody = document.getElementById("roomTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const filtered = globalRooms.filter((r) => {
    let matchCat = true;
    if (activeFilter !== "all") {
      const typeId = activeFilter.replace("type-", "");
      matchCat = String(r.roomTypeId || r.room_type_id) === String(typeId);
    }

    let matchStatus = true;
    if (activeStatus !== "all") {
      matchStatus = r.status === activeStatus;
    }

    return matchCat && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">Không tìm thấy dữ liệu phòng phù hợp</td></tr>`;
    return;
  }

  filtered.forEach((r) => {
    const tr = document.createElement("tr");

    const roomType = globalRoomTypes.find(
      (rt) =>
        String(rt.roomTypeId || rt.room_type_id) ===
        String(r.roomTypeId || r.room_type_id),
    );
    const typeName = roomType
      ? roomType.typeName || roomType.type_name
      : "Không xác định";
    const category = roomType
      ? globalServiceCategories.find(
          (cat) =>
            String(cat.categoryId || cat.category_id || cat.id) ===
            String(roomType.categoryId || roomType.category_id),
        )
      : null;
    const grpName = category
      ? category.categoryName || category.category_name
      : "Dịch vụ";

    tr.innerHTML = `
      <td>
        <div class="room-name-cell">
          <div class="room-icon-box"><i class="fa-solid fa-door-closed"></i></div>
          <div>
            <div style="font-weight: 600; color: #1e293b;">${r.roomName || r.room_name}</div>
            <div class="room-code">Mã: ${r.roomCode || r.room_code || "RM-A00" + (r.roomId || r.id)}</div>
          </div>
        </div>
      </td>
      <td>${getGroupBadge(grpName)}</td>
      <td><strong style="color: #475569;">${typeName}</strong></td>
      <td>
        <div style="font-size: 11px; color: #475569;">Sức chứa: ${r.capacity || "Chưa đặt"}</div>
        <div style="font-size: 10px; color: #94a3b8;">Ghi chú: ${r.note || "Không có"}</div>
      </td>
      <td>${getStatusPill(r.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" title="Xem chi tiết & Đổi trạng thái" onclick="openRoomDetailModal(${r.roomId || r.id})">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn-icon btn-delete" title="Xóa phòng" onclick="deleteRoom(${r.roomId || r.id})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStatsCounters() {
  const ready = globalRooms.filter(
    (r) => r.status === "AVAILABLE" || r.status === "Sẵn sàng",
  ).length;
  const occupied = globalRooms.filter(
    (r) => r.status === "OCCUPIED" || r.status === "Đang sử dụng",
  ).length;
  const assigned = globalRooms.filter(
    (r) => r.status === "ASSIGNED" || r.status === "Đã được gán",
  ).length;
  const maintenance = globalRooms.filter(
    (r) => r.status === "MAINTENANCE" || r.status === "Bảo trì",
  ).length;

  if (document.getElementById("stat-ready"))
    document.getElementById("stat-ready").innerText = ready;
  if (document.getElementById("stat-occupied"))
    document.getElementById("stat-occupied").innerText = occupied;
  if (document.getElementById("stat-assigned"))
    document.getElementById("stat-assigned").innerText = assigned;
  if (document.getElementById("stat-maintenance"))
    document.getElementById("stat-maintenance").innerText = maintenance;
}

function getGroupBadge(grpName) {
  const lower = (grpName || "").toLowerCase();
  if (lower.includes("hotel") || lower.includes("lưu trú")) {
    return `<span class="tag-grp hotel"><i class="fa-solid fa-hotel"></i> ${grpName}</span>`;
  }
  if (lower.includes("spa") || lower.includes("làm đẹp")) {
    return `<span class="tag-grp spa"><i class="fa-solid fa-spa"></i> ${grpName}</span>`;
  }
  return `<span class="tag-grp health"><i class="fa-solid fa-heart-pulse"></i> ${grpName}</span>`;
}

function getStatusPill(status) {
  switch (status) {
    case "AVAILABLE":
    case "Sẵn sàng":
      return `<span class="status-pill status-ready"><i class="fa-solid fa-circle-check"></i> Sẵn sàng</span>`;
    case "OCCUPIED":
    case "Đang sử dụng":
      return `<span class="status-pill status-occupied"><i class="fa-solid fa-arrows-spin"></i> Đang sử dụng</span>`;
    case "ASSIGNED":
    case "Đã được gán":
      return `<span class="status-pill status-assigned"><i class="fa-solid fa-key"></i> Đã được gán</span>`;
    case "MAINTENANCE":
    case "Bảo trì":
      return `<span class="status-pill status-maintenance"><i class="fa-solid fa-wrench"></i> Bảo trì</span>`;
    case "INACTIVE":
    case "Ngừng hoạt động":
      return `<span class="status-pill status-inactive"><i class="fa-solid fa-ban"></i> Ngừng hoạt động</span>`;
    default:
      return `<span class="status-pill">${status || "Mới"}</span>`;
  }
}

function addActivityLog(title, type) {
  const list = document.getElementById("activityList");
  if (!list) return;

  const emptyMsg = list.querySelector("li");
  if (emptyMsg && emptyMsg.innerText.includes("Chưa có hoạt động mới")) {
    list.innerHTML = "";
  }

  const li = document.createElement("li");
  const timeStr = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  li.innerHTML = `
    <div class="act-icon import"><i class="fa-solid fa-arrows-rotate"></i></div>
    <div class="act-details">
      <div class="act-title">${title}</div>
      <div class="act-sub">Cập nhật: <span class="act-change positive">${type}</span></div>
      <div class="act-time">${timeStr} hôm nay</div>
    </div>
  `;
  list.insertBefore(li, list.firstChild);
}

async function deleteRoom(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;
  const token = getAuthToken();

  try {
    const res = await fetch(`${BASE_URL}/admin/rooms/delete?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const result = await res.json();
    if (res.ok && (result.status || result.success)) {
      showLocalToast("Đã xóa phòng thành công!", "success");
      initRoomManagement(token);
    } else {
      showLocalToast(result.message || "Xóa phòng thất bại!", "error");
    }
  } catch (e) {
    showLocalToast("Lỗi kết nối khi xóa!", "error");
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
        "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
      document.body.appendChild(container);
    }
  }

  const toast = document.createElement("div");
  toast.style.cssText = `padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align- items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: ${
    type === "success" ? "#52c41a" : "#ff4d4f"
  }`;

  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}
