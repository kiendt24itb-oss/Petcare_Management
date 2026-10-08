/**
 * 📦 FILE: ProductManagement.js
 * Quản lý danh sách sản phẩm, danh mục và biến động tồn kho dành cho Admin/Staff
 * Đồng bộ API Back-end PHP XAMPP & JWT
 */

// 🌐 Cấu hình địa chỉ Server PHP XAMPP
const SERVER_HOST = "http://localhost/petcare_management_v2_api";
const BASE_URL = `${SERVER_HOST}/index.php/api`;

// Dữ liệu & Cấu hình Phân trang
let products = [];
let categories = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 5;

let selectedCategoryId = "all";
let selectedStatus = "all";

document.addEventListener("DOMContentLoaded", function () {
  // 🔑 Lấy JWT Token
  const token = getToken();

  if (!token) {
    showToast("Phiên làm việc hết hạn hoặc chưa đăng nhập!", "error");
    return;
  }

  // Khởi tạo dữ liệu
  initData(token);

  // Lắng nghe sự kiện lọc theo Trạng thái
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function (e) {
      selectedStatus = e.target.value;
      applyFilters();
    });
  }

  // Nút Xuất Excel
  const btnExport = document.getElementById("btnExportExcel");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      showToast("Tính năng xuất Excel đang được phát triển!", "error");
    });
  }

  // 1. MỞ / ĐÓNG MODAL THÊM / SỬA SẢN PHẨM
  const btnOpenAddProduct = document.getElementById("btnOpenAddProductModal");
  const btnCloseProductModal = document.getElementById("btnCloseProductModal");
  const btnCancelProductModal = document.getElementById(
    "btnCancelProductModal",
  );
  const productForm = document.getElementById("productForm");
  const prodImageFile = document.getElementById("prodImageFile");

  if (btnOpenAddProduct) {
    btnOpenAddProduct.addEventListener("click", () => openProductModal());
  }
  if (btnCloseProductModal) {
    btnCloseProductModal.addEventListener("click", closeProductModal);
  }
  if (btnCancelProductModal) {
    btnCancelProductModal.addEventListener("click", closeProductModal);
  }
  if (productForm) {
    productForm.addEventListener("submit", (e) => submitProductForm(e, token));
  }

  // Xem trước ảnh khi chọn file
  if (prodImageFile) {
    prodImageFile.addEventListener("change", function () {
      const file = this.files[0];
      const previewContainer = document.getElementById("imagePreviewContainer");
      const previewImg = document.getElementById("imagePreview");
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImg.src = e.target.result;
          previewContainer.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = "none";
      }
    });
  }

  // 2. MỞ / ĐÓNG MODAL NHẬP HÀNG
  const btnOpenImport = document.getElementById("btnOpenImportModal");
  const btnCloseImportModal = document.getElementById("btnCloseImportModal");
  const btnCancelImportModal = document.getElementById("btnCancelImportModal");
  const importInventoryForm = document.getElementById("importInventoryForm");
  const importProductId = document.getElementById("importProductId");

  if (btnOpenImport) {
    btnOpenImport.addEventListener("click", openImportModal);
  }
  if (btnCloseImportModal) {
    btnCloseImportModal.addEventListener("click", closeImportModal);
  }
  if (btnCancelImportModal) {
    btnCancelImportModal.addEventListener("click", closeImportModal);
  }
  if (importInventoryForm) {
    importInventoryForm.addEventListener("submit", (e) =>
      submitImportForm(e, token),
    );
  }

  // TỰ ĐỘNG HIỂN THỊ ĐƠN VỊ TÍNH KHI CHỌN SẢN PHẨM NHẬP HÀNG
  if (importProductId) {
    importProductId.addEventListener("change", function () {
      const selectedId = this.value;
      const unitDisplay = document.getElementById("importUnitDisplay");
      if (selectedId) {
        const prod = products.find((p) => p.productId == selectedId);
        if (prod && prod.unit) {
          unitDisplay.textContent = `(Đơn vị: ${prod.unit})`;
        } else {
          unitDisplay.textContent = "";
        }
      } else {
        unitDisplay.textContent = "";
      }
    });
  }
});

/**
 * 🔑 Helper lấy JWT Token
 */
function getToken() {
  let token = localStorage.getItem("petcare_token");
  if (!token && window.parent && window.parent.localStorage) {
    token = window.parent.localStorage.getItem("petcare_token");
  }
  return token && token !== "null" && token !== "undefined" ? token : null;
}

/**
 * 🚀 Khởi tạo và tải dữ liệu từ Backend PHP API
 */
async function initData(token) {
  await fetchCategories(token);
  await fetchProducts(token);
}

/**
 * 📂 Gọi API lấy danh sách Danh mục sản phẩm
 */
async function fetchCategories(token) {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      categories = result.data || [];
      renderCategorySidebar();
      populateCategoryDropdown();
    } else {
      showToast(result.message || "Không thể tải danh mục!", "error");
    }
  } catch (error) {
    console.error("Lỗi tải danh mục:", error);
    showToast("Không thể kết nối đến máy chủ API!", "error");
  }
}

/**
 * 📦 Gọi API lấy danh sách tất cả Sản phẩm
 */
async function fetchProducts(token) {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      products = result.data || [];
      applyFilters();
      updateSidebarCounts();
    } else {
      showToast(result.message || "Không thể tải danh sách sản phẩm!", "error");
    }
  } catch (error) {
    console.error("Lỗi tải sản phẩm:", error);
    showToast("Lỗi kết nối máy chủ khi lấy sản phẩm!", "error");
  }
}

/**
 * 🎨 Render Danh sách Danh mục lên Sidebar
 */
function renderCategorySidebar() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  categoryList.innerHTML = `
    <li class="category-item ${selectedCategoryId === "all" ? "active" : ""}" data-category-id="all">
      <span><i class="fa-solid fa-border-all"></i> Tất cả sản phẩm</span>
      <span class="count" id="cat-count-all">0</span>
    </li>
  `;

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = `category-item ${selectedCategoryId == cat.categoryId ? "active" : ""}`;
    li.dataset.categoryId = cat.categoryId;
    li.innerHTML = `
      <span><i class="fa-solid fa-folder"></i> ${cat.categoryName}</span>
      <span class="count" id="cat-count-${cat.categoryId}">0</span>
    `;
    categoryList.appendChild(li);
  });

  document.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".category-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      selectedCategoryId = this.dataset.categoryId;
      applyFilters();
    });
  });
}

/**
 * 📥 Đổ danh mục vào Select-Option
 */
function populateCategoryDropdown() {
  const select = document.getElementById("prodCategoryId");
  if (!select) return;

  select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.categoryId;
    opt.textContent = cat.categoryName;
    select.appendChild(opt);
  });
}

/**
 * 🔢 Cập nhật số lượng đếm sản phẩm
 */
function updateSidebarCounts() {
  const allCountElem = document.getElementById("cat-count-all");
  if (allCountElem) allCountElem.textContent = products.length;

  categories.forEach((cat) => {
    const countElem = document.getElementById(`cat-count-${cat.categoryId}`);
    if (countElem) {
      const count = products.filter(
        (p) => p.categoryId == cat.categoryId,
      ).length;
      countElem.textContent = count;
    }
  });
}

/**
 * 🖼️ Chuẩn hóa đường dẫn Ảnh
 */
function getImageUrl(path) {
  const defaultImg =
    "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100";
  if (!path || path.trim() === "") return defaultImg;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  return SERVER_HOST + path;
}

/**
 * 🏷️ Trạng thái Tồn kho
 */
function getProductStatus(stock, minStock) {
  if (stock <= 0) return "Hết hàng";
  if (stock <= minStock) return "Sắp hết";
  return "Còn hàng";
}

function getStatusBadge(status) {
  if (status === "Còn hàng")
    return `<span class="badge-status normal">Còn hàng</span>`;
  if (status === "Sắp hết")
    return `<span class="badge-status low">Sắp hết</span>`;
  return `<span class="badge-status out">Hết hàng</span>`;
}

function getStockClass(status) {
  if (status === "Còn hàng") return "normal";
  if (status === "Sắp hết") return "low";
  return "out";
}

/**
 * 📊 Cập nhật các thẻ Thống kê
 */
function updateStats() {
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, p) => sum + (parseInt(p.stockQuantity) || 0),
    0,
  );

  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((p) => {
    const stock = parseInt(p.stockQuantity) || 0;
    const minStock = parseInt(p.minStockQuantity) || 5;
    const status = getProductStatus(stock, minStock);

    if (status === "Sắp hết") lowStockCount++;
    if (status === "Hết hàng") outOfStockCount++;
  });

  document.getElementById("total-products").textContent =
    totalProducts.toLocaleString();
  document.getElementById("total-stock").textContent =
    totalStock.toLocaleString();
  document.getElementById("low-stock").textContent = lowStockCount;
  document.getElementById("out-of-stock").textContent = outOfStockCount;
}

/**
 * 🔍 Lọc Dữ Liệu
 */
function applyFilters() {
  filteredData = products.filter((p) => {
    const stock = parseInt(p.stockQuantity) || 0;
    const minStock = parseInt(p.minStockQuantity) || 5;
    const calcStatus = getProductStatus(stock, minStock);

    const matchCategory =
      selectedCategoryId === "all" || p.categoryId == selectedCategoryId;
    const matchStatus =
      selectedStatus === "all" || calcStatus === selectedStatus;

    return matchCategory && matchStatus;
  });

  currentPage = 1;
  updateStats();
  updateUI();
}

/**
 * 📋 Render dữ liệu vào Bảng HTML
 */
function renderTable(data) {
  const tbody = document.getElementById("productTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = data.slice(start, end);

  if (paginatedItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">Không tìm thấy sản phẩm phù hợp</td></tr>`;
    return;
  }

  paginatedItems.forEach((p) => {
    const stock = parseInt(p.stockQuantity) || 0;
    const minStock = parseInt(p.minStockQuantity) || 5;
    const status = getProductStatus(stock, minStock);
    const price = parseFloat(p.salePrice) || 0;
    const unitText = p.unit ? ` (${p.unit})` : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="product-item-cell">
          <img src="${getImageUrl(p.imageUrl)}" class="product-img" alt="${p.productName}">
          <div>
            <div class="product-info-name">${p.productName || "Chưa đặt tên"}</div>
            <div class="product-code">Mã SP: ${p.productCode || "Tự tạo khi lưu"}</div>
          </div>
        </div>
      </td>
      <td><span class="category-tag">${p.categoryName || "Khác"}</span></td>
      <td><strong>${price.toLocaleString("vi-VN")}đ</strong></td>
      <td><span class="stock-count ${getStockClass(status)}">${stock}${unitText}</span></td>
      <td>${getStatusBadge(status)}</td>
      <td style="text-align: center;">
        <div class="action-btns">
          <button class="btn-icon btn-edit" onclick="handleEditProduct(${p.productId})" title="Sửa sản phẩm">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="btn-icon btn-delete" onclick="handleDeleteProduct(${p.productId})" title="Xóa sản phẩm">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 📄 Render Phân Trang
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

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("div");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.textContent = i;
    pageItem.onclick = () => {
      currentPage = i;
      updateUI();
    };
    paginationContainer.appendChild(pageItem);
  }

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
 * 🔄 Cập nhật UI
 */
function updateUI() {
  renderTable(filteredData);
  renderPagination(filteredData.length);
}

/**
 * 📦 MODAL THÊM / SỬA SẢN PHẨM
 */
function openProductModal(productData = null) {
  const form = document.getElementById("productForm");
  if (form) form.reset();

  const titleElem = document.getElementById("productModalTitle");
  const editIdElem = document.getElementById("prodEditId");
  const existingImageElem = document.getElementById("existingImageUrl");
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");

  if (productData) {
    // Chế độ CHỈNH SỬA
    titleElem.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Cập nhật sản phẩm (${productData.productCode || ""})`;
    editIdElem.value = productData.productId;
    existingImageElem.value = productData.imageUrl || "";

    document.getElementById("prodName").value = productData.productName || "";
    document.getElementById("prodCategoryId").value =
      productData.categoryId || "";
    document.getElementById("prodUnit").value = productData.unit || "";
    document.getElementById("prodCostPrice").value = productData.costPrice || 0;
    document.getElementById("prodSalePrice").value = productData.salePrice || 0;
    document.getElementById("prodStock").value = productData.stockQuantity || 0;
    document.getElementById("prodMinStock").value =
      productData.minStockQuantity || 5;
    document.getElementById("prodDescription").value =
      productData.description || "";

    if (productData.imageUrl) {
      previewImg.src = getImageUrl(productData.imageUrl);
      previewContainer.style.display = "block";
    } else {
      previewContainer.style.display = "none";
    }
  } else {
    // Chế độ THÊM MỚI (Mã SP tự gen phía Backend)
    titleElem.innerHTML = `<i class="fa-solid fa-box-open"></i> Thêm sản phẩm mới`;
    editIdElem.value = "";
    existingImageElem.value = "";
    previewContainer.style.display = "none";
  }

  document.getElementById("productModal").classList.remove("hidden");
}

function closeProductModal() {
  document.getElementById("productModal").classList.add("hidden");
}

/**
 * Helper chuyển file ảnh chọn từ máy tính sang Base64
 */
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 🚀 Submit Thêm/Sửa sản phẩm
 */
async function submitProductForm(e, token) {
  e.preventDefault();

  const editId = document.getElementById("prodEditId").value;
  const isEdit = !!editId;

  // Xử lý File Ảnh
  const fileInput = document.getElementById("prodImageFile");
  let imageUrl = document.getElementById("existingImageUrl").value;

  if (fileInput.files && fileInput.files[0]) {
    try {
      imageUrl = await convertFileToBase64(fileInput.files[0]);
    } catch (err) {
      showToast("Không thể đọc file ảnh chọn lên!", "error");
      return;
    }
  }

  // Khớp chính xác tên thuộc tính với ProductService.php
  const payload = {
    categoryId: Number(document.getElementById("prodCategoryId").value),
    productName: document.getElementById("prodName").value.trim(),
    unit: document.getElementById("prodUnit").value.trim(),
    costPrice: Number(document.getElementById("prodCostPrice").value) || 0,
    salePrice: Number(document.getElementById("prodSalePrice").value) || 0,
    stockQuantity: Number(document.getElementById("prodStock").value) || 0,
    minStockQuantity:
      Number(document.getElementById("prodMinStock").value) || 5,
    imageUrl: imageUrl,
    description: document.getElementById("prodDescription").value.trim(),
    status: "ACTIVE",
  };

  const url = isEdit
    ? `${BASE_URL}/admin/products/${editId}`
    : `${BASE_URL}/admin/products`;
  const method = isEdit ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      showToast(
        result.message ||
          (isEdit
            ? "Cập nhật sản phẩm thành công!"
            : "Thêm sản phẩm thành công!"),
        "success",
      );
      closeProductModal();
      await fetchProducts(token);
    } else {
      showToast(result.message || "Không thể lưu sản phẩm!", "error");
    }
  } catch (err) {
    console.error("Lỗi lưu sản phẩm:", err);
    showToast("Lỗi kết nối máy chủ!", "error");
  }
}

/**
 * 🚚 MODAL NHẬP HÀNG
 */
function openImportModal() {
  const select = document.getElementById("importProductId");
  select.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';

  products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.productId;
    opt.textContent = `${p.productName} (Mã: ${p.productCode || "SP"} - Tồn: ${p.stockQuantity || 0} ${p.unit || ""})`;
    select.appendChild(opt);
  });

  document.getElementById("importUnitDisplay").textContent = "";
  const form = document.getElementById("importInventoryForm");
  if (form) form.reset();
  document.getElementById("importInventoryModal").classList.remove("hidden");
}

function closeImportModal() {
  document.getElementById("importInventoryModal").classList.add("hidden");
}

/**
 * 🚀 Submit Nhập hàng tồn kho
 */
async function submitImportForm(e, token) {
  e.preventDefault();
  const productId = Number(document.getElementById("importProductId").value);
  const quantity = Number(document.getElementById("importQuantity").value);
  const unitPriceVal = document.getElementById("importUnitPrice").value;
  const note = document.getElementById("importNote").value.trim();

  if (!productId || quantity <= 0) {
    showToast("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!", "error");
    return;
  }

  const payload = {
    productId: productId,
    transactionType: "IMPORT",
    quantity: quantity,
    note: note,
  };

  if (unitPriceVal !== "" && !isNaN(unitPriceVal)) {
    payload.unitPrice = Number(unitPriceVal);
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/inventory/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      showToast(result.message || "Nhập hàng thành công!", "success");
      closeImportModal();
      await fetchProducts(token);
    } else {
      showToast(result.message || "Không thể nhập hàng!", "error");
    }
  } catch (err) {
    console.error("Lỗi nhập hàng:", err);
    showToast("Lỗi kết nối máy chủ!", "error");
  }
}

/**
 * ✏️ Thao tác Sửa Sản phẩm
 */
function handleEditProduct(productId) {
  const product = products.find((p) => p.productId == productId);
  if (product) {
    openProductModal(product);
  } else {
    showToast("Không tìm thấy thông tin sản phẩm!", "error");
  }
}

/**
 * 🗑️ Thao tác Xóa Sản phẩm
 */
async function handleDeleteProduct(productId) {
  const token = getToken();
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

  try {
    const response = await fetch(`${BASE_URL}/admin/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      showToast(result.message || "Đã xóa sản phẩm thành công!", "success");
      await fetchProducts(token);
    } else {
      showToast(result.message || "Không thể xóa sản phẩm!", "error");
    }
  } catch (err) {
    console.error("Lỗi xóa sản phẩm:", err);
    showToast("Lỗi kết nối máy chủ khi xóa sản phẩm!", "error");
  }
}

/**
 * 🍿 Bắn Toast Thông báo
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
