/**
 * =============================================================================
 * PetCare Management System - Dashboard Module (Multi-Color Spectrum Beat Visualizer)
 * =============================================================================
 */

// =========================================================================
// 1. CẤU HÌNH & HẰNG SỐ
// =========================================================================
const SERVER_HOST = "http://localhost/petcare_management_v2_api";
const API_BASE_URL = `${SERVER_HOST}/index.php`;

const DEFAULT_SVG_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmE3YzQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWNmZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjE4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LDc1IEMyNSw1OCA3NSw1OCA3NSw3NSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const ICONS = {
  overview: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  service: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  profile: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  pet: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5S6 12.83 6 12s-.67-1.5-1.5-1.5zm15 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-7.5-6C9.57 4.5 7.5 6.57 7.5 9c0 1.94.88 3.68 2.26 4.84l-1.01 3.51 2.37-1.37c.29.02.58.02.88.02 2.43 0 4.5-2.07 4.5-4.5 0-2.43-2.07-4.5-4.5-4.5z"/></svg>`,
  booking: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>`,
  attendance: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  staff: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  room: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>`,
  product: `<svg class="menu-icon" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4 0 10 8 4 8-4ZM12 4.15l6.08 3.04L12 10.23 5.92 7.19ZM5 8.81l6 3v7.38l-6-3Zm8 10.38v-7.38l6-3v7.38Z"/></svg>`,
};

// =========================================================================
// 2. DOM CACHE
// =========================================================================
const DOM = {
  sidebar: document.getElementById("sidebar"),
  btnToggleSidebar: document.getElementById("btnToggleSidebar"),
  avatar: document.getElementById("userAvatar"),
  profileName: document.getElementById("userProfileName"),
  userRoleBadge: document.getElementById("userRoleBadge"),
  btnLogout: document.getElementById("btnLogout"),
  btnChangePassword: document.getElementById("btnChangePassword"),
  topbarSearch: document.getElementById("topbarSearch"),
  topbarSearchContainer: document.getElementById("topbarSearchContainer"),
  cosmicPortalWrapper: document.getElementById("cosmicPortalWrapper"),
  customerNotiBell: document.getElementById("customerNotiBell"),
  notiBellBtn: document.getElementById("notiBellBtn"),
  notiDropdown: document.getElementById("notiDropdown"),
  notiCount: document.getElementById("notiCount"),
  notiBodyList: document.getElementById("notiBodyList"),
  dynamicMenu: document.getElementById("dynamicMenu"),
  mainFrame: document.getElementById("mainFrame"),
};

// =========================================================================
// 3. HELPER FUNCTIONS
// =========================================================================
function isValidValue(value) {
  if (value === null || value === undefined) return false;
  const stringValue = String(value).trim();
  return !(
    stringValue === "" ||
    stringValue.toLowerCase() === "null" ||
    stringValue.toLowerCase() === "undefined"
  );
}

function getImageUrl(path) {
  if (!isValidValue(path)) return DEFAULT_SVG_AVATAR;
  const cleanPath = String(path).trim();
  if (/^(http:\/\/|https:\/\/|data:image)/i.test(cleanPath)) return cleanPath;
  const relativePath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${SERVER_HOST}${relativePath}`;
}

function setUserAvatar(path) {
  if (DOM.avatar) DOM.avatar.src = getImageUrl(path);
}

function setUserName(name) {
  const finalName = isValidValue(name) ? String(name).trim() : "Người dùng";
  if (DOM.profileName) DOM.profileName.innerText = finalName;
  localStorage.setItem("petcare_username", finalName);
}

function saveAvatarCache(path) {
  if (isValidValue(path)) {
    localStorage.setItem("petcare_avatar", String(path).trim());
  } else {
    localStorage.removeItem("petcare_avatar");
  }
}

// =========================================================================
// 4. CORE INITIALIZERS
// =========================================================================
function initDashboard() {
  const token = localStorage.getItem("petcare_token");
  if (!token) {
    alert(
      "🔒 Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập! Vui lòng quay lại.",
    );
    window.location.href = "/index.html";
    return;
  }

  const cacheName = localStorage.getItem("petcare_username");
  const cacheAvatar = localStorage.getItem("petcare_avatar");
  setUserName(cacheName);
  setUserAvatar(cacheAvatar);

  initSidebarToggle();
  initBadge();
  initMenu();
  initSearch();
  initNotification();
  initLogout();
  loadUserProfile();
  setupRealtimeProfileSync();
  initCosmicMusicPlayer();
}

function initSidebarToggle() {
  if (!DOM.btnToggleSidebar || !DOM.sidebar) return;

  DOM.btnToggleSidebar.addEventListener("click", () => {
    DOM.sidebar.classList.toggle("collapsed");
  });
}

function initBadge() {
  if (!DOM.userRoleBadge) return;

  const role = localStorage.getItem("petcare_role");

  const ROLE_CONFIG = {
    ADMIN: {
      icon: `<svg class="role-icon" style="fill:#fa541c" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5-1.1-2.5-2.5S10.6 7 12 7zm0 10.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
      text: "Quản trị viên",
      color: "#fa541c",
    },
    STAFF: {
      icon: `<svg class="role-icon" style="fill:#1890ff" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z"/></svg>`,
      text: "Nhân viên",
      color: "#1890ff",
    },
    CUSTOMER: {
      icon: `<svg class="role-icon" style="fill:#ff7a45" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
      text: "Khách hàng",
      color: "#ff7a45",
    },
  };

  const config = ROLE_CONFIG[role] || ROLE_CONFIG["CUSTOMER"];

  DOM.userRoleBadge.innerHTML = `
    ${config.icon}
    <span class="role-text" style="color: ${config.color}">${config.text}</span>
  `;
}

function initMenu() {
  const token = localStorage.getItem("petcare_token");
  const role = localStorage.getItem("petcare_role");

  const menuData = {
    CUSTOMER: [
      {
        text: "Tổng quan",
        icon: ICONS.overview,
        url: "/user/customerOverview/CustomerOverview.html",
      },
      {
        text: "Dịch vụ PetCare",
        icon: ICONS.service,
        url: "/user/serviceBooking/ServiceBooking.html",
      },
      {
        text: "Thông tin cá nhân",
        icon: ICONS.profile,
        url: "/user/customer/Customer_info.html",
      },
      {
        text: "Thông tin thú cưng",
        icon: ICONS.pet,
        url: "/user/pet/Pet_list.html",
      },
      {
        text: "Đặt lịch dịch vụ",
        icon: ICONS.booking,
        url: "/user/booking/Booking_list.html",
      },
    ],
    STAFF: [
      {
        text: "Tổng quan",
        icon: ICONS.overview,
        url: "/staff/staffOverview/StaffOverview.html",
      },
      {
        text: "Thông tin cá nhân",
        icon: ICONS.profile,
        url: "/staff/staff_profile/Staff_profile.html",
      },
      {
        text: "Chấm công hàng ngày",
        icon: ICONS.attendance,
        url: "/staff/attendance/Attendance.html",
      },
      {
        text: "Xem lịch làm việc",
        icon: ICONS.booking,
        url: "/staff/staff_schedule/Staff_schedule.html",
      },
    ],
    ADMIN: [
      {
        text: "Thống kê tổng quan",
        icon: ICONS.overview,
        url: "/admin/overview/Overview.html",
      },
      {
        text: "Quản lý nhân viên",
        icon: ICONS.staff,
        url: "/admin/staffManagement/StaffManagement.html",
        showSearch: true,
      },
      {
        text: "Quản lý khách hàng",
        icon: ICONS.profile,
        url: "/admin/customerManagement/CustomerManagement.html",
        showSearch: true,
      },
      {
        text: "Quản lý sản phẩm & Kho",
        icon: ICONS.product,
        url: "/admin/productManagement/ProductManagement.html",
        showSearch: true,
      },
      {
        text: "Các gói dịch vụ",
        icon: ICONS.service,
        url: "/admin/serviceManagement/ServiceManagement.html",
      },
      {
        text: "Quản lý vận hành",
        icon: ICONS.booking,
        url: "/admin/operationsMonitor/OperationsMonitor.html",
      },
      {
        text: "Phòng & Vị trí làm việc",
        icon: ICONS.room,
        url: "/admin/roomManagement/RoomManagement.html",
      },
    ],
  };

  if (role === "CUSTOMER") {
    if (DOM.topbarSearchContainer)
      DOM.topbarSearchContainer.style.display = "none";
    if (DOM.cosmicPortalWrapper) DOM.cosmicPortalWrapper.style.display = "none";
    if (DOM.customerNotiBell) {
      DOM.customerNotiBell.style.display = "inline-block";
      initCustomerNotifications(token);
    }
  } else {
    if (DOM.customerNotiBell) DOM.customerNotiBell.style.display = "none";
    if (DOM.cosmicPortalWrapper)
      DOM.cosmicPortalWrapper.style.display = "inline-flex";
    if (DOM.topbarSearchContainer)
      DOM.topbarSearchContainer.style.display = "none";
  }

  if (!DOM.dynamicMenu) return;
  DOM.dynamicMenu.innerHTML = "";

  const userMenu = menuData[role] || menuData["CUSTOMER"];

  userMenu.forEach((item, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    const urlWithToken = `${item.url}?token=${encodeURIComponent(token)}`;
    a.href = urlWithToken;
    a.target = "mainFrame";
    a.innerHTML = `${item.icon}<span class="menu-text">${item.text}</span>`;

    if (index === 0 && DOM.mainFrame) {
      li.classList.add("active");
      DOM.mainFrame.src = urlWithToken;
      if (role === "ADMIN" && DOM.topbarSearchContainer) {
        DOM.topbarSearchContainer.style.display = item.showSearch
          ? "flex"
          : "none";
      }
    }

    a.addEventListener("click", function () {
      document
        .querySelectorAll("#dynamicMenu li")
        .forEach((nav) => nav.classList.remove("active"));
      if (DOM.btnChangePassword)
        DOM.btnChangePassword.parentElement.classList.remove("active");

      li.classList.add("active");

      if (DOM.topbarSearch) DOM.topbarSearch.value = "";

      if (role === "ADMIN" && DOM.topbarSearchContainer) {
        DOM.topbarSearchContainer.style.display = item.showSearch
          ? "flex"
          : "none";
      }
    });

    li.appendChild(a);
    DOM.dynamicMenu.appendChild(li);
  });

  if (DOM.btnChangePassword) {
    DOM.btnChangePassword.href = `/user/change_password/ChangePassword.html?token=${encodeURIComponent(token)}`;
    DOM.btnChangePassword.addEventListener("click", function () {
      document
        .querySelectorAll("#dynamicMenu li")
        .forEach((nav) => nav.classList.remove("active"));
      this.parentElement.classList.add("active");
    });
  }
}

function initSearch() {
  if (!DOM.topbarSearch) return;

  DOM.topbarSearch.addEventListener("input", function () {
    const keyword = this.value.trim();
    if (DOM.mainFrame && DOM.mainFrame.contentWindow) {
      DOM.mainFrame.contentWindow.postMessage(
        { action: "SEARCH_DATA", keyword: keyword },
        "*",
      );
    }
  });
}

function initNotification() {
  if (!DOM.notiBellBtn || !DOM.notiDropdown) return;

  DOM.notiBellBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    DOM.notiDropdown.classList.toggle("open");
  });

  document.addEventListener("click", function () {
    DOM.notiDropdown.classList.remove("open");
  });
}

function initLogout() {
  if (!DOM.btnLogout) return;

  DOM.btnLogout.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("petcare_token");
    localStorage.removeItem("petcare_username");
    localStorage.removeItem("petcare_role");
    localStorage.removeItem("petcare_accountId");
    localStorage.removeItem("petcare_email");
    localStorage.removeItem("petcare_avatar");
    window.location.href = "/index.html";
  });
}

async function initCustomerNotifications(token) {
  if (!DOM.notiBodyList) return;
  DOM.notiBodyList.innerHTML = `<div class="noti-empty-state">Chưa có thông báo lịch hẹn nào.</div>`;
  if (DOM.notiCount) DOM.notiCount.style.display = "none";
}

async function loadUserProfile() {
  const token = localStorage.getItem("petcare_token");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/account/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (!response.ok || !result.status || !result.data) return;

    const user = result.data;
    if (isValidValue(user.fullName)) setUserName(user.fullName);

    if (isValidValue(user.avatar)) {
      setUserAvatar(user.avatar);
      saveAvatarCache(user.avatar);
    } else {
      setUserAvatar(null);
      saveAvatarCache(null);
    }
  } catch (err) {
    console.error("Load Profile Error:", err);
  }
}

function setupRealtimeProfileSync() {
  if (!DOM.mainFrame) return;

  DOM.mainFrame.addEventListener("load", () => {
    try {
      const iframeWindow = DOM.mainFrame.contentWindow;
      if (!iframeWindow) return;

      const iframeDoc = DOM.mainFrame.contentDocument || iframeWindow.document;
      if (!iframeDoc) return;

      const txtFullName = iframeDoc.getElementById("fullName");
      if (!txtFullName) return;

      txtFullName.addEventListener("input", (e) => {
        setUserName(e.target.value.trim());
      });
    } catch (e) {
      console.warn("Real-time Iframe Sync bypass:", e);
    }
  });
}

// =========================================================================
// 5. TRÌNH PHÁT NHẠC MULTI-COLOR SPECTRUM (HÀNG NGÀN MÀU - BẮT BEAT CHUẨN KÍCH THƯỚC)
// =========================================================================
function initCosmicMusicPlayer() {
  const portalBtn = document.getElementById("cosmicPortalWrapper");
  const portalContainer = document.getElementById("cosmicPortalContainer");
  const audioPlayer = document.getElementById("bgAudioPlayer");
  const fileInput = document.getElementById("audioFileInput");

  if (!portalBtn || !portalContainer || !audioPlayer || !fileInput) return;

  let playlist = [];
  let playlistNames = [];
  let currentIndex = 0;
  let clickTimer = null;

  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let animationFrameId = null;

  fileInput.addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    playlist.forEach((url) => URL.revokeObjectURL(url));

    playlist = files.map((file) => URL.createObjectURL(file));
    playlistNames = files.map((file) => file.name);
    currentIndex = 0;

    playTrack(currentIndex);
  });

  function setupAudioContext() {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // Tăng FFT size cho phân tích tần số mịn hơn

      sourceNode = audioCtx.createMediaElementSource(audioPlayer);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTrack(index) {
    if (playlist.length === 0 || !playlist[index]) return;

    setupAudioContext();

    audioPlayer.src = playlist[index];
    audioPlayer
      .play()
      .then(() => {
        startBeatVisualizer();
      })
      .catch((err) => {
        console.warn("Auto Play Blocked:", err);
      });
  }

  audioPlayer.addEventListener("ended", function () {
    if (playlist.length > 0) {
      currentIndex = (currentIndex + 1) % playlist.length;
      playTrack(currentIndex);
    }
  });

  // HÀM BẮT BEAT VỚI HÀNG NGÀN SẮC MÀU HSL TỰ ĐỘNG BIẾN ĐỔI THEO TẦN SỐ
  function startBeatVisualizer() {
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function renderBeat() {
      if (audioPlayer.paused) {
        resetPortalToOriginal();
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      // 1. Tính cường độ Bass (Tần số thấp)
      let bassSum = 0;
      for (let i = 0; i < 6; i++) {
        bassSum += dataArray[i];
      }
      let bassAvg = bassSum / 6; // 0 -> 255

      // 2. Tính cường độ Treble/Mid (Tần số trung & cao)
      let midSum = 0;
      for (let i = 6; i < 20; i++) {
        midSum += dataArray[i];
      }
      let midAvg = midSum / 14;

      // 3. Phóng to thu nhỏ rõ rệt nhưng KHÔNG vượt quá 1.18x (Để không đè tràn Header)
      let scale = 1 + (bassAvg / 255) * 0.18;

      // 4. THUẬT TOÁN HÀNG NGÀN MÀU SẮC (Dựa trên HSL: Hue 0 -> 360)
      // Tự động xoay màu linh hoạt theo giai điệu + nhịp bass
      let dynamicHue = Math.floor((bassAvg * 1.5 + midAvg * 2) % 360);

      let mainColor = `hsl(${dynamicHue}, 100%, 55%)`; // Màu chính cực nét
      let glowColor = `hsl(${dynamicHue}, 100%, 50%)`; // Màu viền sáng
      let coreColor = `hsl(${(dynamicHue + 60) % 360}, 100%, 70%)`; // Lõi màu tương phản rực rỡ

      // 5. Áp dụng Style đồng bộ viền sáng & lõi
      portalContainer.style.transform = `scale(${scale.toFixed(3)})`;
      portalContainer.style.borderColor = mainColor;

      // Viền sáng tỏa xung quanh trùng khít màu viền
      let shadowSpread = Math.floor((bassAvg / 255) * 20) + 10;
      portalContainer.style.boxShadow = `0 0 ${shadowSpread}px ${glowColor}, inset 0 0 12px ${glowColor}`;

      const core = portalContainer.querySelector(".cosmic-core");
      if (core) {
        core.style.background = coreColor;
        core.style.boxShadow = `0 0 12px ${coreColor}, 0 0 25px ${glowColor}`;
      }

      portalBtn.title = `🎵 Đang phát: ${playlistNames[currentIndex] || "Music File"}`;

      animationFrameId = requestAnimationFrame(renderBeat);
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    renderBeat();
  }

  function resetPortalToOriginal() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    portalContainer.style.transform = "scale(1)";
    portalContainer.style.borderColor = "rgba(255, 122, 69, 0.6)";
    portalContainer.style.boxShadow =
      "0 0 12px rgba(255, 122, 69, 0.3), inset 0 0 8px rgba(255, 230, 0, 0.2)";

    const core = portalContainer.querySelector(".cosmic-core");
    if (core) {
      core.style.background = "#fff";
      core.style.boxShadow = "0 0 10px #fff, 0 0 20px #ff7a45";
    }

    if (playlist.length > 0) {
      portalBtn.title =
        "Đã tạm dừng (1 Click để Bật/Tắt | 2 Click chọn File mới)";
    } else {
      portalBtn.title = "1 Click để Bật/Tắt | 2 Click để Chọn File nhạc";
    }
  }

  portalBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (clickTimer === null) {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        if (!audioPlayer.src || playlist.length === 0) {
          fileInput.click();
        } else {
          if (audioPlayer.paused) {
            setupAudioContext();
            audioPlayer.play();
            startBeatVisualizer();
          } else {
            audioPlayer.pause();
            resetPortalToOriginal();
          }
        }
      }, 260);
    }
  });

  portalBtn.addEventListener("dblclick", function (e) {
    e.preventDefault();
    clearTimeout(clickTimer);
    clickTimer = null;
    fileInput.click();
  });
}

document.addEventListener("DOMContentLoaded", initDashboard);
