const SERVER_HOST = "http://localhost/petcare_management_v2_api";
const BASE_URL = `${SERVER_HOST}/index.php/api`;

const DEFAULT_PET_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmMWViIiByeD0iNTAiLz4KICA8ZyBmaWxsPSIjZmY3YTQ1Ij4KICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTgiIHI9IjE2Ii8+CiAgICA8Y2lyY2xlIGN4PSI5MCIgY3k9IjM4IiByPSI3Ii8+CiAgICA8cGF0aCBkPSJNNTAsNDQgQzQ1LDQ0IDQxLDQ4IDQxLDUzIEM0MSw6MCA1OSw6MCA1OSw1MyBDNTksNDggNTUsNDQgNTAsNDQgWiIvPgogICAgPGNpcmNsZSBjeD0iMjgiIGN5PSI0NiIgcj0iMTAiLz4KICAgIDxjaXJjbGUgY3g9IjcyIiBjeT0iNDYiIHI9IjEwIi8+CiAgICA8Y2lyY2xlIGN4PSIzNCIgY3k9IjI4IiByPSI4Ii8+CiAgICA8Y2lyY2xlIGN4PSI2NiIgY3k9IjI4IiByPSI4Ii8+CiAgPC9nPgo8L3N2Zz4=";

let isEditMode = false;
let currentEditingPetId = null;
let originalPetData = null;
let selectedAvatarFile = null;

document.addEventListener("DOMContentLoaded", function () {
  let token = localStorage.getItem("petcare_token");
  if (!token && window.parent && window.parent.localStorage) {
    token = window.parent.localStorage.getItem("petcare_token");
  }

  if (!token || token === "null" || token.trim() === "") {
    showPetToast("Phiên làm việc hết hạn. Vui lòng đăng nhập lại!", "error");
    return;
  }

  fetchMyPets(token);

  const btnTopAddPet = document.getElementById("btnTopAddPet");
  if (btnTopAddPet) {
    btnTopAddPet.addEventListener("click", () => openModalForAdd(token));
  }

  const inputModalAvatar = document.getElementById("inputModalAvatar");
  if (inputModalAvatar) {
    inputModalAvatar.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showPetToast("Vui lòng chọn tệp hình ảnh hợp lệ!", "error");
        return;
      }

      selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById("modalPetAvatar").src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

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

async function fetchMyPets(token) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get("customerId");

    let requestUrl = `${BASE_URL}/pet/my-pets`;
    if (customerId) requestUrl += `?customerId=${customerId}`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (response.ok && result.status === true) {
      renderPetGrid(result.data || [], token);
    } else {
      showPetToast(result.message || "Không thể tải danh sách!", "error");
    }
  } catch (error) {
    console.error(error);
    showPetToast("Lỗi kết nối máy chủ!", "error");
  }
}

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

    // Chỉ render đúng 4 trường theo đúng giao diện
    petCard.innerHTML = `
      <div class="card-main-body">
        <div class="card-img-wrapper">
          <img src="${avatarUrl}" alt="${pet.petName}" class="card-img" onerror="this.src='${DEFAULT_PET_SVG}'" />
        </div>
        <div class="card-info-box">
          <div class="card-top-row">
            <h3 class="card-pet-name"><i class="fa-solid fa-paw icon-species"></i> Bé ${pet.petName || "Chưa tên"}</h3>
            <span class="card-badge-status">Đang hoạt động</span>
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
  addCard.addEventListener("click", () => openModalForAdd(token));
  petGrid.appendChild(addCard);
}

function formatPetAge(ageInMonths) {
  const months = parseInt(ageInMonths);
  if (isNaN(months) || months <= 0) return "Mới sinh";
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} tuổi ${remMonths} tháng` : `${years} tuổi`;
}

async function openModalForAdd(token) {
  isEditMode = false;
  currentEditingPetId = null;
  originalPetData = null;
  selectedAvatarFile = null;

  document.querySelector(".modal-header h3").innerText = "Thêm Bé Cưng Mới";
  const btnDelete = document.getElementById("btnModalDelete");
  if (btnDelete) btnDelete.style.display = "none";

  document.getElementById("formAddPet").reset();
  document.getElementById("modalPetAvatar").src = DEFAULT_PET_SVG;
  document.getElementById("modalPetCode").value = "Đang lấy mã...";

  try {
    const res = await fetch(`${BASE_URL}/pet/next-code`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (res.ok && result.status === true) {
      document.getElementById("modalPetCode").value = result.data;
    } else {
      document.getElementById("modalPetCode").value = "Tự sinh...";
    }
  } catch (err) {
    document.getElementById("modalPetCode").value = "Tự sinh...";
  }

  document.getElementById("petModal").classList.add("active");
}

function openModalForEdit(pet) {
  isEditMode = true;
  currentEditingPetId = pet.petId;
  selectedAvatarFile = null;
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

async function submitAddPet(token) {
  const formData = getFormFormData();
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get("customerId");
  if (customerId) formData.append("customerId", customerId);

  try {
    const response = await fetch(`${BASE_URL}/pet/add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await response.json();
    if (response.ok && result.status === true) {
      showPetToast("🎉 Thêm bé cưng thành công!", "success");
      closeAndReloadModal(token);
    } else {
      showPetToast(result.message || "Thêm thất bại!", "error");
    }
  } catch (error) {
    showPetToast("Mất kết nối máy chủ!", "error");
  }
}

async function submitUpdatePet(token) {
  const formData = getFormFormData();
  formData.append("petId", String(currentEditingPetId));

  try {
    const response = await fetch(`${BASE_URL}/pet/update`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await response.json();
    if (response.ok && result.status === true) {
      showPetToast("🎉 Cập nhật thành công!", "success");
      closeAndReloadModal(token);
    } else {
      showPetToast(result.message || "Cập nhật thất bại!", "error");
    }
  } catch (error) {
    showPetToast("Mất kết nối máy chủ!", "error");
  }
}

async function submitDeletePet(token) {
  if (!currentEditingPetId) return;
  if (!confirm("Bạn có chắc chắn muốn xóa bé cưng này?")) return;

  try {
    const response = await fetch(
      `${BASE_URL}/pet/delete?id=${currentEditingPetId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const result = await response.json();
    if (response.ok && result.status === true) {
      showPetToast("🗑️ Đã xóa thông tin bé cưng!", "success");
      closeAndReloadModal(token);
    } else {
      showPetToast(result.message || "Không thể xóa!", "error");
    }
  } catch (error) {
    showPetToast("Lỗi kết nối xóa dữ liệu!", "error");
  }
}

function getFormFormData() {
  const formData = new FormData();
  formData.append(
    "petName",
    document.getElementById("modalPetName").value.trim(),
  );
  formData.append("species", document.getElementById("modalSpecies").value);
  formData.append("breed", document.getElementById("modalBreed").value.trim());
  formData.append("age", document.getElementById("modalPetAge").value || "");
  formData.append("weight", document.getElementById("modalWeight").value || "");
  formData.append("gender", document.getElementById("modalPetGender").value);
  formData.append(
    "healthNote",
    document.getElementById("modalHealthNote").value.trim(),
  );

  if (selectedAvatarFile) formData.append("avatar_file", selectedAvatarFile);
  return formData;
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
        selectedAvatarFile = null;
      } else {
        document.getElementById("formAddPet").reset();
        document.getElementById("modalPetAvatar").src = DEFAULT_PET_SVG;
        selectedAvatarFile = null;
        openModalForAdd(token);
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

function getImageUrl(path) {
  if (!path || path.trim() === "") return DEFAULT_PET_SVG;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:image/")
  )
    return path;
  return SERVER_HOST + (path.startsWith("/") ? path : "/" + path);
}

function showPetToast(message, type = "success") {
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
  toast.style.cssText = `padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; background: ${type === "success" ? "#52c41a" : "#ff4d4f"}`;
  toast.innerHTML = `<span>${type === "success" ? "🎉" : "❌"}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
