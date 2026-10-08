/**
 * =============================================================================
 * 🛠️ FILE: attendance_station.js
 * ARCHITECTURE: Giữ nguyên logic cốt lõi, cập nhật hiển thị đồng bộ cấu trúc
 * danh sách điểm danh và tiến trình thanh đếm ngược cho Light Mode.
 * =============================================================================
 */

const demoCheckinPayloads = [
  "PC_SECURE_TOKEN_A7B94X_SHIFT_MORNING",
  "PC_SECURE_TOKEN_C2D18Y_SHIFT_AFTERNOON",
  "PC_SECURE_TOKEN_E5F23Z_SHIFT_NIGHT",
  "PC_SECURE_TOKEN_M8N11P_FLEXIBLE_TIME",
  "PC_SECURE_TOKEN_K4Q99V_EMERGENCY_OP",
];

const mockActivityData = [
  { name: "Nguyễn Văn A", time: "07:30" },
  { name: "Trần Văn B", time: "07:35" },
  { name: "Lê Văn C", time: "07:38" },
  { name: "Phạm Minh Mẫn", time: "08:02" },
  { name: "Hoàng Thị Loan", time: "08:15" },
];

const SYSTEM_CONFIG = {
  TOTAL_LIFETIME_SECONDS: 60,
  API_QR_GENERATOR:
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=",
};

let currentTimerSecondsLeft = SYSTEM_CONFIG.TOTAL_LIFETIME_SECONDS;
let countdownTimerInterval = null;
let lastUsedDemoIndex = -1;

const DOM = {
  qrImage: document.getElementById("qrTargetImage"),
  expiredOverlay: document.getElementById("expiredScreenOverlay"),
  skeletonLoader: document.getElementById("skeletonLoadingFrame"),
  progressBarFill: document.getElementById("countdownProgressBarFill"),
  textSeconds: document.getElementById("numericalTimerSeconds"),
  btnRefresh: document.getElementById("btnActionRefreshQR"),
  liveClock: document.getElementById("kioskLiveClock"),
  liveDate: document.getElementById("kioskLiveDate"),
  fallbackCode: document.getElementById("fallbackNumericalCode"),
  activityFeed: document.getElementById("kioskActivityFeed"),
};

function getRandomDemoString() {
  let newIndex = Math.floor(Math.random() * demoCheckinPayloads.length);
  while (newIndex === lastUsedDemoIndex) {
    newIndex = Math.floor(Math.random() * demoCheckinPayloads.length);
  }
  lastUsedDemoIndex = newIndex;
  return demoCheckinPayloads[newIndex] + "_" + Date.now();
}

function generateFallbackSixDigitCode() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  if (DOM.fallbackCode) {
    DOM.fallbackCode.innerText = randomNum;
  }
}

function generateCheckinQRCode() {
  clearInterval(countdownTimerInterval);
  currentTimerSecondsLeft = SYSTEM_CONFIG.TOTAL_LIFETIME_SECONDS;

  DOM.expiredOverlay.classList.remove("active");
  DOM.skeletonLoader.classList.add("active");
  DOM.qrImage.style.filter = "none";
  DOM.qrImage.style.opacity = "1";

  DOM.textSeconds.innerText = currentTimerSecondsLeft;
  DOM.progressBarFill.style.transition = "none";
  DOM.progressBarFill.style.width = "100%";
  DOM.progressBarFill.style.background =
    "linear-gradient(90deg, #ff7a45, #ffa480)";

  generateFallbackSixDigitCode();

  const secureDataString = getRandomDemoString();
  DOM.qrImage.src = `${SYSTEM_CONFIG.API_QR_GENERATOR}${encodeURIComponent(secureDataString)}`;

  DOM.qrImage.onload = function () {
    DOM.skeletonLoader.classList.remove("active");
    setTimeout(() => {
      if (DOM.progressBarFill) {
        DOM.progressBarFill.style.transition =
          "width 1s linear, background-color 0.3s ease";
      }
    }, 50);
    startTimerCountdown();
  };
}

function startTimerCountdown() {
  countdownTimerInterval = setInterval(() => {
    currentTimerSecondsLeft--;
    DOM.textSeconds.innerText = currentTimerSecondsLeft;

    const widthPercentage =
      (currentTimerSecondsLeft / SYSTEM_CONFIG.TOTAL_LIFETIME_SECONDS) * 100;
    DOM.progressBarFill.style.width = `${widthPercentage}%`;

    // Khi sắp hết hạn, đổi sang thanh đỏ cảnh báo rõ nét trên nền trắng
    if (currentTimerSecondsLeft <= 10) {
      DOM.progressBarFill.style.background = "#ef4444";
    }

    if (currentTimerSecondsLeft <= 0) {
      clearInterval(countdownTimerInterval);
      handleQRCodeExpiration();
    }
  }, 1000);
}

function handleQRCodeExpiration() {
  DOM.qrImage.style.filter = "blur(4px)";
  DOM.qrImage.style.opacity = "0.1";
  DOM.expiredOverlay.classList.add("active");
  DOM.textSeconds.innerText = "0";
  if (DOM.fallbackCode) {
    DOM.fallbackCode.innerText = "------";
  }
}

function runKioskLiveClock() {
  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  setInterval(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    if (DOM.liveClock) {
      DOM.liveClock.innerText = `${hours}:${minutes}:${seconds}`;
    }

    const dayName = daysOfWeek[now.getDay()];
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    if (DOM.liveDate) {
      DOM.liveDate.innerText = `${dayName}, ${day}/${month}/${year}`;
    }
  }, 1000);
}

function getShortNameAvatar(fullName) {
  const parts = fullName.trim().split(" ");
  const lastName = parts[parts.length - 1];
  return lastName ? lastName.charAt(0).toUpperCase() : "P";
}

function renderMockActivityFeed() {
  if (!DOM.activityFeed) return;
  DOM.activityFeed.innerHTML = "";

  mockActivityData.forEach((item) => {
    const avatarLetter = getShortNameAvatar(item.name);
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      <div class="feed-left">
        <div class="feed-avatar">${avatarLetter}</div>
        <div class="feed-details">
          <span class="feed-name">${item.name}</span>
          <span class="feed-status-meta">✓ Thành công</span>
        </div>
      </div>
      <span class="feed-time">${item.time}</span>
    `;
    DOM.activityFeed.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (DOM.btnRefresh) {
    DOM.btnRefresh.addEventListener("click", generateCheckinQRCode);
  }

  runKioskLiveClock();
  renderMockActivityFeed();
  generateCheckinQRCode();
});
