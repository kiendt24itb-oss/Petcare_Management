/**
 * 🐾 FILE: Pet_list.js
 * Quản lý Danh sách Thú Cưng (Xem, Thêm, Sửa, Xóa & Upload Ảnh)
 */

const API_BASE_URL = "http://localhost:8000/api/v1";

// Ảnh đại diện mặc định dùng chung mẫu SVG của Customer
const DEFAULT_PET_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjlhOWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPldjdXN0b21lcjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

let isEditMode = false;
let currentEditingPetId = null;
let originalPetData = null;
let uploadedPetAvatarPath = null;
let globalPetList = []; // Lưu trữ danh sách thú cưng toàn cục để tự sinh mã

document.addEventListener("DOMContentLoaded", function () {
  const token = getAuthToken();

  if (!token) {
    showPetToast("Phiên làm việc hết hạn. Vui lòng đăng nhập lại!", "error");
    return;
  }

  // 1. Tải danh sách thú cưng
  fetchMyPets(token);

  // 2. Lắng nghe upload ảnh trong modal pet
  const inputModalAvatar = document.getElementById("inputModalAvatar");
  if (inputModalAvatar) {
    inputModalAvatar.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) handleUploadPetAvatar(file, token);
    });
  }

  // 3. Sự kiện mở modal Thêm thú cưng
  const btnTopAddPet = document.getElementById("btnTopAddPet");
  if (btnTopAddPet) {
    btnTopAddPet.addEventListener("click", () => openModalForAdd());
  }

  // 4. Sự kiện submit form
  const formAddPet = document.getElementById("formAddPet");
  if (formAddPet) {
    formAddPet.addEventListener("submit", function (event) {
      event.preventDefault();
      if (isEditMode) {
        submitUpdatePet(token);
      } else {
        submitAddPet(token);
      }
    });
  }

  initModalActions(token);
});

function getAuthToken() {
  let token = localStorage.getItem("petcare_token");
  if (!token && window.parent && window.parent.localStorage) {
    token = window.parent.localStorage.getItem("petcare_token");
  }
  if (!token || token === "null" || token.trim() === "") return null;
  return token.trim();
}

/**
 * ⚙️ HÀM TỰ SINH MÃ THÚ CƯNG DỰA TRÊN LOGIC CODEGENERATORSERVICE (VD: PET-A001)
 */
function generateNextPetCode(currentList) {
  const prefix = "PET";
  let maxLetter = "A";
  let maxNumber = 0;

  if (Array.isArray(currentList) && currentList.length > 0) {
    currentList.forEach((item) => {
      const codeVal = item.petCode || item.pet_code || "";
      if (codeVal && codeVal.includes("-")) {
        const parts = codeVal.split("-");
        const suffix = parts[parts.length - 1]; // "A001"
        const letter = suffix.substring(0, 1); // "A"
        const num = parseInt(suffix.substring(1), 10); // 1

        if (!isNaN(num)) {
          if (letter > maxLetter) {
            maxLetter = letter;
            maxNumber = num;
          } else if (letter === maxLetter && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });
  }

  let nextNumber = maxNumber + 1;
  let nextLetter = maxLetter;

  if (nextNumber > 99) {
    nextNumber = 1;
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
  }

  const formattedNum = String(nextNumber).padStart(3, "0");
  return `${prefix}-${nextLetter}${formattedNum}`;
}

/**
 * 📥 Lấy danh sách thú cưng từ API
 */
async function fetchMyPets(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/pets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Không thể tải danh sách thú cưng!"),
        "error",
      );
      return;
    }

    globalPetList = result.data || [];
    renderPetGrid(globalPetList, token);
  } catch (error) {
    console.error("Lỗi lấy danh sách thú cưng:", error);
    showPetToast("Không thể kết nối máy chủ!", "error");
  }
}

/**
 * 📷 Upload Ảnh Thú Cưng
 */
async function handleUploadPetAvatar(file, token) {
  if (!file.type.startsWith("image/")) {
    showPetToast("Vui lòng chọn tệp hình ảnh hợp lệ!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("avatar_file", file);

  try {
    showPetToast("⏳ Đang upload ảnh thú cưng...", "success");

    const response = await fetch(
      `${API_BASE_URL}/customer/pets/upload-avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Upload ảnh bé cưng thất bại!"),
        "error",
      );
      return;
    }

    uploadedPetAvatarPath = result.data;
    document.getElementById("modalPetAvatar").src = getImageUrl(
      uploadedPetAvatarPath,
    );

    showPetToast("🎉 Upload ảnh thú cưng thành công!", "success");
  } catch (error) {
    console.error("Lỗi upload ảnh pet:", error);
    showPetToast("Lỗi kết nối khi tải ảnh lên!", "error");
  }
}

/**
 * 🎨 Hiển thị danh sách thú cưng
 */
function renderPetGrid(pets, token) {
  const petGrid = document.querySelector(".pet-grid");
  if (!petGrid) return;

  petGrid.innerHTML = "";

  pets.forEach((pet) => {
    const petCard = document.createElement("div");
    petCard.className = "pet-card-horizontal";

    const avatarUrl = pet.avatar ? getImageUrl(pet.avatar) : DEFAULT_PET_SVG;
    const speciesText = pet.breed
      ? `${pet.breed}`
      : pet.species === "DOG"
        ? "Chó"
        : pet.species === "CAT"
          ? "Mèo"
          : "Khác";
    const genderText = pet.gender === "MALE" ? "Đực" : "Cái";
    const ageText = pet.age ? formatPetAge(pet.age) : "Chưa rõ";
    const noteText = pet.healthNote || "Thân thiện, khỏe mạnh";

    petCard.innerHTML = `
      <div class="card-main-body">
        <div class="card-img-wrapper">
          <img src="${avatarUrl}" alt="${pet.petName}" class="card-img" onerror="this.src='${DEFAULT_PET_SVG}'" />
        </div>
        <div class="card-info-box">
          <div class="card-top-row">
            <h3 class="card-pet-name"><i class="fa-solid fa-paw icon-species"></i> Bé ${pet.petName || "Chưa tên"}</h3>
            <span class="card-badge-status">Mã: ${pet.petCode || "Chưa cấp"}</span>
          </div>
          <div class="card-details-list">
            <div class="detail-item">
              <span class="detail-label"><i class="fa-solid fa-dog icon-species"></i> Loài</span>
              <span class="detail-val">${speciesText}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa-solid fa-venus-mars icon-gender"></i> Giới tính</span>
              <span class="detail-val">${genderText}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa-regular fa-calendar-alt icon-age"></i> Tuổi</span>
              <span class="detail-val">${ageText}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa-regular fa-note-sticky icon-note"></i> Đặc điểm</span>
              <span class="detail-val">${noteText}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-actions-row">
        <button type="button" class="btn-card-action btn-edit-trigger"><i class="fa-regular fa-folder-open"></i> Xem hồ sơ</button>
        <button type="button" class="btn-card-action"><i class="fa-regular fa-calendar-check"></i> Lịch sử dịch vụ</button>
        <button type="button" class="btn-card-more"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
    `;

    petCard
      .querySelector(".btn-edit-trigger")
      .addEventListener("click", () => openModalForEdit(pet));
    petGrid.appendChild(petCard);
  });

  const addCard = document.createElement("div");
  addCard.className = "add-pet-trigger-card";
  addCard.innerHTML = `
    <div class="add-circle-icon"><i class="fa-solid fa-plus"></i></div>
    <span class="add-trigger-text">Thêm Bé Cưng</span>
  `;
  addCard.addEventListener("click", () => openModalForAdd());
  petGrid.appendChild(addCard);
}

/**
 * ➕ Thêm Thú Cưng
 */
async function submitAddPet(token) {
  const payload = getPetFormData();

  try {
    const response = await fetch(`${API_BASE_URL}/customer/pets/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Thêm bé cưng thất bại!"),
        "error",
      );
      return;
    }

    showPetToast(result.message || "🎉 Thêm bé cưng thành công!", "success");
    closeAndReloadModal(token);
  } catch (error) {
    console.error("Lỗi thêm pet:", error);
    showPetToast("Mất kết nối tới máy chủ!", "error");
  }
}

/**
 * ✏️ Cập nhật Thú Cưng
 */
async function submitUpdatePet(token) {
  if (!currentEditingPetId) return;

  const payload = getPetFormData();

  try {
    const response = await fetch(
      `${API_BASE_URL}/customer/pets/${currentEditingPetId}/update`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(getApiErrorMessage(result, "Cập nhật thất bại!"), "error");
      return;
    }

    showPetToast(
      result.message || "🎉 Cập nhật thông tin bé cưng thành công!",
      "success",
    );
    closeAndReloadModal(token);
  } catch (error) {
    console.error("Lỗi cập nhật pet:", error);
    showPetToast("Mất kết nối tới máy chủ!", "error");
  }
}

/**
 * 🗑️ Xóa Thú Cưng
 */
async function submitDeletePet(token) {
  if (!currentEditingPetId) return;
  if (!confirm("Bạn có chắc chắn muốn xóa thông tin bé cưng này?")) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/customer/pets/${currentEditingPetId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    const result = await readApiResponse(response);

    if (!response.ok || result.status !== true) {
      showPetToast(
        getApiErrorMessage(result, "Không thể xóa bé cưng!"),
        "error",
      );
      return;
    }

    showPetToast(result.message || "🗑️ Đã xóa bé cưng!", "success");
    closeAndReloadModal(token);
  } catch (error) {
    console.error("Lỗi xóa pet:", error);
    showPetToast("Lỗi kết nối khi xóa dữ liệu!", "error");
  }
}

function getPetFormData() {
  return {
    petCode: document.getElementById("modalPetCode").value.trim(),
    petName: document.getElementById("modalPetName").value.trim(),
    species: document.getElementById("modalSpecies").value || null,
    breed: document.getElementById("modalBreed").value.trim() || null,
    age: parseInt(document.getElementById("modalPetAge").value) || null,
    weight: parseFloat(document.getElementById("modalWeight").value) || null,
    gender: document.getElementById("modalPetGender").value || null,
    avatar: uploadedPetAvatarPath || null,
    healthNote: document.getElementById("modalHealthNote").value.trim() || null,
  };
}

/**
 * ➕ Mở Modal Thêm mới: Tự sinh mã PET-A00x dựa theo danh sách hiện có
 */
function openModalForAdd() {
  isEditMode = false;
  currentEditingPetId = null;
  originalPetData = null;
  uploadedPetAvatarPath = null;

  document.querySelector(".modal-header h3").innerText = "Thêm Bé Cưng Mới";
  const btnDelete = document.getElementById("btnModalDelete");
  if (btnDelete) btnDelete.style.display = "none";

  document.getElementById("formAddPet").reset();
  document.getElementById("modalPetAvatar").src = DEFAULT_PET_SVG;

  // Hiển thị ngay lập tức mã tự sinh theo chuẩn PET-A001, PET-A002...
  document.getElementById("modalPetCode").value =
    generateNextPetCode(globalPetList);

  document.getElementById("petModal").classList.add("active");
}

function openModalForEdit(pet) {
  isEditMode = true;
  currentEditingPetId = pet.petId;
  uploadedPetAvatarPath = pet.avatar || null;
  originalPetData = JSON.parse(JSON.stringify(pet));

  document.querySelector(".modal-header h3").innerText =
    `Cập nhật: ${pet.petName || "Bé Cưng"}`;
  fillPetForm(pet);
  renderDeleteButton();

  document.getElementById("petModal").classList.add("active");
}

function fillPetForm(pet) {
  document.getElementById("modalPetCode").value = pet.petCode || "Chưa cấp mã";
  document.getElementById("modalPetName").value = pet.petName || "";
  document.getElementById("modalSpecies").value = pet.species || "";
  document.getElementById("modalBreed").value = pet.breed || "";
  document.getElementById("modalPetAge").value =
    pet.age !== null ? pet.age : "";
  document.getElementById("modalWeight").value =
    pet.weight !== null ? pet.weight : "";
  document.getElementById("modalPetGender").value = pet.gender || "";
  document.getElementById("modalHealthNote").value = pet.healthNote || "";
  document.getElementById("modalPetAvatar").src = pet.avatar
    ? getImageUrl(pet.avatar)
    : DEFAULT_PET_SVG;
}

function renderDeleteButton() {
  let btnDelete = document.getElementById("btnModalDelete");
  if (!btnDelete) {
    btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.id = "btnModalDelete";
    btnDelete.className = "modal-btn-secondary";
    btnDelete.style.backgroundColor = "#ff4d4f";
    btnDelete.style.color = "#ffffff";
    btnDelete.innerText = "Xóa Bé Cưng";

    const modalActions = document.querySelector(".modal-actions");
    if (modalActions)
      modalActions.insertBefore(btnDelete, modalActions.firstChild);
  }
  btnDelete.style.display = "block";
}

function closeAndReloadModal(token) {
  document.getElementById("petModal").classList.remove("active");
  fetchMyPets(token);
}

function initModalActions(token) {
  const modal = document.getElementById("petModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const resetBtn = document.getElementById("btnModalReset");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (isEditMode && originalPetData) {
        fillPetForm(originalPetData);
        uploadedPetAvatarPath = originalPetData.avatar || null;
      } else {
        document.getElementById("formAddPet").reset();
        document.getElementById("modalPetAvatar").src = DEFAULT_PET_SVG;
        document.getElementById("modalPetCode").value =
          generateNextPetCode(globalPetList);
        uploadedPetAvatarPath = null;
      }
    });
  }

  const modalActions = document.querySelector(".modal-actions");
  if (modalActions) {
    modalActions.addEventListener("click", function (e) {
      if (e.target && e.target.id === "btnModalDelete") {
        submitDeletePet(token);
      }
    });
  }
}

function formatPetAge(ageInMonths) {
  const months = parseInt(ageInMonths);
  if (isNaN(months) || months <= 0) return "Mới sinh";
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} tuổi ${remMonths} tháng` : `${years} tuổi`;
}

async function readApiResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
  }
}

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
  if (!path || path.trim() === "") return DEFAULT_PET_SVG;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  )
    return path;
  return `http://localhost:8000/${path.startsWith("/") ? path.slice(1) : path}`;
}

function showPetToast(message, type = "success") {
  let container = document.getElementById("pet-toast-container");
  if (!container && window.parent && window.parent.document) {
    container = window.parent.document.getElementById("pet-toast-container");
  }
  if (!container) {
    container = document.createElement("div");
    container.id = "pet-toast-container";
    container.style.cssText =
      "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `pet-toast ${type}`;
  toast.style.cssText = `padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; background: ${
    type === "success" ? "#52c41a" : "#ff4d4f"
  }`;
  toast.innerHTML = `<span>${type === "success" ? "🎉" : "❌"}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
