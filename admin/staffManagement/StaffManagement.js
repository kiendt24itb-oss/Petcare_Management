// ==========================================================================
// I. DỮ LIỆU MẪU NHÂN VIÊN
// ==========================================================================
const employees = [
  {
    code: "NV-A001",
    name: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "Quản lý",
    roleClass: "role-manager",
    phone: "0987 654 321",
    email: "an.nguyen@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "15/03/2023",
    cccd: "036098001234",
    address: "Cầu Giấy, Hà Nội",
    shiftSalary: 300000,
    shiftType: "Ca sáng",
    schedulePattern: "all",
  },
  {
    code: "NV-A002",
    name: "Trần Thị Bích Ngọc",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "Nhân viên Spa",
    roleClass: "role-spa",
    phone: "0977 123 456",
    email: "ngoc.tran@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "21/06/2022",
    cccd: "036098005678",
    address: "Đống Đa, Hà Nội",
    shiftSalary: 250000,
    shiftType: "Ca chiều",
    schedulePattern: "weekdays",
  },
  {
    code: "NV-A003",
    name: "Lê Minh Hoàng",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "Bác sĩ thú y",
    roleClass: "role-doctor",
    phone: "0933 789 412",
    email: "hoang.le@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "10/01/2023",
    cccd: "036098009999",
    address: "Thanh Xuân, Hà Nội",
    shiftSalary: 400000,
    shiftType: "Ca sáng",
    schedulePattern: "all",
  },
  {
    code: "NV-A004",
    name: "Phạm Thùy Linh",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "Nhân viên khách sạn",
    roleClass: "role-hotel",
    phone: "0912 345 678",
    email: "linh.pham@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "05/05/2023",
    cccd: "036098008888",
    address: "Hai Bà Trưng, Hà Nội",
    shiftSalary: 220000,
    shiftType: "Ca tối",
    schedulePattern: "weekends",
  },
  {
    code: "NV-A005",
    name: "Đỗ Quốc Trung",
    avatar: "https://i.pravatar.cc/150?img=13",
    role: "Kỹ thuật viên",
    roleClass: "role-tech",
    phone: "0898 765 123",
    email: "trung.do@petcare.vn",
    status: "Nghỉ tạm thời",
    statusClass: "status-leave",
    startDate: "18/11/2022",
    cccd: "036098007777",
    address: "Ba Đình, Hà Nội",
    shiftSalary: 280000,
    shiftType: "Ca sáng",
    schedulePattern: "weekdays",
  },
  {
    code: "NV-A006",
    name: "Vũ Thị Mai",
    avatar: "https://i.pravatar.cc/150?img=10",
    role: "Nhân viên Spa",
    roleClass: "role-spa",
    phone: "0888 234 567",
    email: "mai.vu@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "12/04/2021",
    cccd: "036098006666",
    address: "Tây Hồ, Hà Nội",
    shiftSalary: 250000,
    shiftType: "Ca chiều",
    schedulePattern: "all",
  },
  {
    code: "NV-A007",
    name: "Bùi Anh Dũng",
    avatar: "https://i.pravatar.cc/150?img=8",
    role: "Nhân viên khách sạn",
    roleClass: "role-hotel",
    phone: "0909 987 654",
    email: "dung.bui@petcare.vn",
    status: "Nghỉ tạm thời",
    statusClass: "status-leave",
    startDate: "30/08/2024",
    cccd: "036098005555",
    address: "Hoàn Kiếm, Hà Nội",
    shiftSalary: 220000,
    shiftType: "Ca tối",
    schedulePattern: "weekdays",
  },
  {
    code: "NV-A008",
    name: "Huỳnh Ngọc Hà",
    avatar: "https://i.pravatar.cc/150?img=16",
    role: "Lễ tân",
    roleClass: "role-reception",
    phone: "0938 456 789",
    email: "ha.huynh@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "22/02/2021",
    cccd: "036098004444",
    address: "Long Biên, Hà Nội",
    shiftSalary: 230000,
    shiftType: "Ca sáng",
    schedulePattern: "all",
  },
  {
    code: "NV-A009",
    name: "Trịnh Tấn Phát",
    avatar: "https://i.pravatar.cc/150?img=15",
    role: "Bác sĩ thú y",
    roleClass: "role-doctor",
    phone: "0901 234 567",
    email: "phat.trinh@petcare.vn",
    status: "Đang làm việc",
    statusClass: "status-working",
    startDate: "14/09/2023",
    cccd: "036098003333",
    address: "Nam Từ Liêm, Hà Nội",
    shiftSalary: 420000,
    shiftType: "Ca chiều",
    schedulePattern: "weekdays",
  },
  {
    code: "NV-A010",
    name: "Hoàng Mai Phương",
    avatar: "https://i.pravatar.cc/150?img=20",
    role: "Lễ tân",
    roleClass: "role-reception",
    phone: "0945 678 910",
    email: "phuong.hoang@petcare.vn",
    status: "Nghỉ tạm thời",
    statusClass: "status-leave",
    startDate: "01/12/2023",
    cccd: "036098002222",
    address: "Hà Đông, Hà Nội",
    shiftSalary: 230000,
    shiftType: "Ca sáng",
    schedulePattern: "all",
  },
];

// CẤU HÌNH PHÂN TRANG & BIẾN TOÀN CỤC
let currentPage = 1;
const itemsPerPage = 5;
let filteredData = [...employees];
let editingEmpCode = null; // null: Thêm mới, khác null: Xem/Sửa
let deletingEmpCode = null; // Mã NV đang chọn xóa
let currentUploadedAvatar = "https://i.pravatar.cc/150?img=12"; // Lưu base64 hoặc url ảnh hiện tại

// Trả về class hiển thị badge tương ứng cho chức vụ
function getRoleClass(role) {
  switch (role) {
    case "Quản lý":
      return "role-manager";
    case "Nhân viên Spa":
      return "role-spa";
    case "Bác sĩ thú y":
      return "role-doctor";
    case "Nhân viên khách sạn":
      return "role-hotel";
    case "Kỹ thuật viên":
      return "role-tech";
    case "Lễ tân":
      return "role-reception";
    default:
      return "role-unassigned";
  }
}

// Trả về class trạng thái làm việc
function getStatusClass(status) {
  switch (status) {
    case "Đang làm việc":
      return "status-working";
    case "Nghỉ tạm thời":
      return "status-leave";
    default:
      return "status-working";
  }
}

// ==========================================================================
// II. RENDER GIAO DIỆN BẢNG & PHÂN TRANG
// ==========================================================================
function renderTable(data) {
  const tableBody = document.getElementById("employeeTableBody");
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = data.slice(start, end);

  if (paginatedItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: #94a3b8;">Không tìm thấy nhân viên phù hợp</td></tr>`;
    return;
  }

  paginatedItems.forEach((emp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="emp-code">${emp.code}</td>
      <td>
        <div class="emp-profile">
          <img src="${emp.avatar || "https://i.pravatar.cc/150?img=12"}" alt="${emp.name}" class="avatar">
          <span>${emp.name}</span>
        </div>
      </td>
      <td><span class="role-badge ${emp.roleClass || getRoleClass(emp.role)}">${emp.role || "Chưa được gán"}</span></td>
      <td class="phone-cell"><i class="fa-solid fa-phone"></i>${emp.phone}</td>
      <td class="email-cell"><i class="fa-solid fa-envelope"></i>${emp.email}</td>
      <td>
        <span class="status-badge ${emp.statusClass || getStatusClass(emp.status)}">
          <span class="status-dot"></span>
          ${emp.status}
        </span>
      </td>
      <td><i class="fa-regular fa-calendar" style="color: #ff7a45; margin-right: 6px;"></i>${emp.startDate}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" title="Xem & Sửa thông tin" onclick="openEditModal('${emp.code}')"><i class="fa-regular fa-eye"></i></button>
          <button class="btn-icon btn-schedule" title="Lịch làm việc"><i class="fa-regular fa-calendar-check"></i></button>
          <button class="btn-icon btn-delete" title="Xóa" onclick="openDeleteModal('${emp.code}')"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Cập nhật thẻ thống kê
function updateStats(data) {
  document.getElementById("total-count").textContent = data.length;
  document.getElementById("working-count").textContent = data.filter(
    (e) => e.status === "Đang làm việc",
  ).length;
  document.getElementById("late-count").textContent = data.filter(
    (e) => e.status === "Nghỉ tạm thời",
  ).length;
  document.getElementById("absent-count").textContent = 0;
}

// Render các nút phân trang
function renderPagination(totalItems) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return;

  // 1. Nút Lùi (Prev)
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

  // 2. Tính toán danh sách các trang cần hiển thị
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

  // 3. Render số trang & chèn dấu "..."
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

  // 4. Nút Tiến (Next)
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
  renderTable(filteredData);
  renderPagination(filteredData.length);
}

// Bắt sự kiện lọc theo chức vụ
document.getElementById("roleFilter").addEventListener("change", (e) => {
  const selectedRole = e.target.value;
  if (selectedRole === "all") {
    filteredData = [...employees];
  } else {
    filteredData = employees.filter((emp) => emp.role === selectedRole);
  }
  currentPage = 1;
  updateStats(filteredData);
  updateUI();
});

// ==========================================================================
// III. LỰA CHỌN CA LÀM & TẦN SUẤT LÀM VIỆC (TOGGLE LOGIC)
// ==========================================================================

// 1. TOGGLE CHO CA LÀM VIỆC (Ấn lần 1: chọn, Ấn lần 2: hủy chọn)
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

// 2. TOGGLE CHO TẦN SUẤT LÀM VIỆC
const scheduleRadios = document.querySelectorAll(
  'input[name="schedulePattern"]',
);
const daysCheckboxGroup = document.getElementById("daysCheckboxGroup");

scheduleRadios.forEach((radio) => {
  radio.addEventListener("click", function () {
    if (this.wasChecked) {
      // Hủy chọn nếu bấm lần 2
      this.checked = false;
      this.wasChecked = false;
      daysCheckboxGroup.style.display = "none";
    } else {
      // Bấm chọn
      scheduleRadios.forEach((r) => (r.wasChecked = false));
      this.wasChecked = true;

      if (this.value === "custom") {
        daysCheckboxGroup.style.display = "flex";
      } else {
        daysCheckboxGroup.style.display = "none";
      }
    }
  });
});

// ==========================================================================
// IV. XỬ LÝ QUẢN LÝ MODAL (THÊM / SỬA / XÓA)
// ==========================================================================
const empModal = document.getElementById("employeeModal");
const deleteModal = document.getElementById("deleteModal");
const empForm = document.getElementById("employeeForm");
const avatarPreview = document.getElementById("avatarPreview");
const localAvatarInput = document.getElementById("localAvatarInput");

// Xử lý tải ảnh từ máy tính (Base64)
localAvatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const base64Url = event.target.result;
      currentUploadedAvatar = base64Url;
      avatarPreview.src = base64Url;
    };
    reader.readAsDataURL(file);
  }
});

// Chuyển Tab trong Modal
const tabBtns = document.querySelectorAll(".tab-btn");
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Mở Modal Thêm Mới Nhân Viên
document.getElementById("btnOpenAddModal").addEventListener("click", () => {
  editingEmpCode = null;
  document.getElementById("modalTitle").innerHTML =
    `<i class="fa-solid fa-user-plus"></i> Thêm nhân viên mới`;
  document.getElementById("empCode").disabled = false;
  empForm.reset();

  // Reset Ca làm việc về trạng thái chưa chọn
  shiftRadios.forEach((r) => {
    r.checked = false;
    r.wasChecked = false;
  });

  // Reset Tần suất làm việc về trạng thái chưa chọn
  scheduleRadios.forEach((r) => {
    r.checked = false;
    r.wasChecked = false;
  });

  currentUploadedAvatar = "https://i.pravatar.cc/150?img=12";
  avatarPreview.src = currentUploadedAvatar;
  daysCheckboxGroup.style.display = "none";

  // Reset Tab về mặc định Tab 1
  tabBtns[0].click();

  // Tạo Mã NV tự động
  const nextNum = employees.length + 1;
  document.getElementById("empCode").value =
    `NV-A${nextNum < 100 ? (nextNum < 10 ? "00" + nextNum : "0" + nextNum) : nextNum}`;

  empModal.classList.add("active");
});

// Mở Modal Xem & Chỉnh Sửa Nhân Viên
function openEditModal(code) {
  const emp = employees.find((e) => e.code === code);
  if (!emp) return;

  editingEmpCode = code;
  document.getElementById("modalTitle").innerHTML =
    `<i class="fa-regular fa-eye"></i> Thông tin & Chỉnh sửa NV`;

  // Đổ dữ liệu vào Form
  document.getElementById("empCode").value = emp.code;
  document.getElementById("empCode").disabled = true; // Khóa không cho sửa Mã NV
  document.getElementById("empName").value = emp.name;
  document.getElementById("empRole").value = emp.role || "Chưa được gán";
  document.getElementById("empPhone").value = emp.phone;
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empCccd").value = emp.cccd || "";
  document.getElementById("empAddress").value = emp.address || "";
  document.getElementById("empShiftSalary").value = emp.shiftSalary || "";
  document.getElementById("empStatus").value = emp.status;

  currentUploadedAvatar = emp.avatar || "https://i.pravatar.cc/150?img=12";
  avatarPreview.src = currentUploadedAvatar;

  // Set trạng thái Ca làm việc đã lưu
  shiftRadios.forEach((r) => {
    if (emp.shiftType && r.value === emp.shiftType) {
      r.checked = true;
      r.wasChecked = true;
    } else {
      r.checked = false;
      r.wasChecked = false;
    }
  });

  // Set trạng thái Tần suất làm việc đã lưu
  scheduleRadios.forEach((r) => {
    if (emp.schedulePattern && r.value === emp.schedulePattern) {
      r.checked = true;
      r.wasChecked = true;
      daysCheckboxGroup.style.display =
        emp.schedulePattern === "custom" ? "flex" : "none";
    } else {
      r.checked = false;
      r.wasChecked = false;
    }
  });

  // Reset Tab về mặc định Tab 1 khi mở
  tabBtns[0].click();

  empModal.classList.add("active");
}

// Đóng Modal Thêm/Sửa
function closeEmpModal() {
  empModal.classList.remove("active");
}
document
  .getElementById("btnCloseEmpModal")
  .addEventListener("click", closeEmpModal);
document
  .getElementById("btnCancelEmpModal")
  .addEventListener("click", closeEmpModal);

// Submit Form Thêm / Sửa Nhân Viên
empForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const code = document.getElementById("empCode").value.trim();
  const name = document.getElementById("empName").value.trim();
  const role = document.getElementById("empRole").value;
  const phone = document.getElementById("empPhone").value.trim();
  const email = document.getElementById("empEmail").value.trim();
  const cccd = document.getElementById("empCccd").value.trim();
  const address = document.getElementById("empAddress").value.trim();
  const shiftSalary = document.getElementById("empShiftSalary").value;
  const status = document.getElementById("empStatus").value;
  const avatar = currentUploadedAvatar;

  const shiftType =
    document.querySelector('input[name="shiftType"]:checked')?.value || "";
  const schedulePattern =
    document.querySelector('input[name="schedulePattern"]:checked')?.value ||
    "";

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  if (editingEmpCode) {
    // Cập nhật nhân viên hiện tại
    const index = employees.findIndex((e) => e.code === editingEmpCode);
    if (index !== -1) {
      employees[index] = {
        ...employees[index],
        name,
        role,
        roleClass: getRoleClass(role),
        phone,
        email,
        cccd,
        address,
        shiftSalary,
        status,
        statusClass: getStatusClass(status),
        avatar,
        shiftType,
        schedulePattern,
      };
    }
  } else {
    // Thêm nhân viên mới
    const newEmp = {
      code,
      name,
      avatar,
      role,
      roleClass: getRoleClass(role),
      phone,
      email,
      status,
      statusClass: getStatusClass(status),
      startDate: formattedDate,
      cccd,
      address,
      shiftSalary,
      shiftType,
      schedulePattern,
    };
    employees.unshift(newEmp);
  }

  // Cập nhật Filter và giao diện
  const currentRoleFilter = document.getElementById("roleFilter").value;
  if (currentRoleFilter === "all") {
    filteredData = [...employees];
  } else {
    filteredData = employees.filter((emp) => emp.role === currentRoleFilter);
  }

  updateStats(employees);
  updateUI();
  closeEmpModal();
});

// Xử lý Modal Xóa
function openDeleteModal(code) {
  const emp = employees.find((e) => e.code === code);
  if (!emp) return;

  deletingEmpCode = code;
  document.getElementById("deleteEmpName").textContent = emp.name;
  document.getElementById("deleteEmpCode").textContent = emp.code;
  deleteModal.classList.add("active");
}

function closeDeleteModal() {
  deleteModal.classList.remove("active");
  deletingEmpCode = null;
}

document
  .getElementById("btnCloseDeleteModal")
  .addEventListener("click", closeDeleteModal);
document
  .getElementById("btnCancelDelete")
  .addEventListener("click", closeDeleteModal);

document.getElementById("btnConfirmDelete").addEventListener("click", () => {
  if (!deletingEmpCode) return;

  const index = employees.findIndex((e) => e.code === deletingEmpCode);
  if (index !== -1) {
    employees.splice(index, 1);
  }

  const currentRoleFilter = document.getElementById("roleFilter").value;
  if (currentRoleFilter === "all") {
    filteredData = [...employees];
  } else {
    filteredData = employees.filter((emp) => emp.role === currentRoleFilter);
  }

  updateStats(employees);
  updateUI();
  closeDeleteModal();
});

// Khởi chạy ứng dụng ban đầu
document.addEventListener("DOMContentLoaded", () => {
  updateStats(employees);
  updateUI();
});
