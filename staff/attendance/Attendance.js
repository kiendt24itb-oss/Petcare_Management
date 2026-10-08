document.addEventListener("DOMContentLoaded", function () {
  // Mã test cấu hình đúng 123456
  const TEST_PIN = "123456";

  // 1. Khởi chạy Đồng hồ & Ngày thực
  startRealTimeClock();

  // 2. Tương tác nhập ô PIN & Kiểm tra mã test linh hoạt
  initPinInputs(TEST_PIN);

  // 3. Tương tác click chọn ngày trên Lịch
  initCalendarSelection();
});

/**
 * Hàm cập nhật giờ & ngày thời gian thực
 */
function startRealTimeClock() {
  const clockEl = document.getElementById("liveClock");
  const alertTimeEl = document.getElementById("alertTime");
  const dateEl = document.getElementById("liveDate");

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const timeString = `${hours}:${minutes}:${seconds}`;

    if (clockEl) clockEl.innerText = timeString;
    if (alertTimeEl && alertTimeEl.innerText !== "--:--:--") {
      alertTimeEl.innerText = timeString;
    }

    if (dateEl) {
      const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const dayName = days[now.getDay()];
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      dateEl.innerText = `${dayName}, ${dd}/${mm}/${yyyy}`;
    }
  }

  update();
  setInterval(update, 1000);
}

/**
 * Xử lý UX nhập mã linh hoạt:
 * - Mới vào: Ô trống, báo "Vui lòng nhập mã"
 * - Nhập sai hoặc chưa xong: Báo "Mã không hợp lệ!"
 * - Nhập đúng 123456: Hiện "Hệ thống xác nhận: Điểm danh thành công!"
 */
function initPinInputs(correctPin) {
  const inputs = document.querySelectorAll(".pin-box");
  const alertBox = document.getElementById("checkinAlert");
  const alertTitle = document.getElementById("alertTitle");
  const alertMsg = document.getElementById("alertMsg");
  const alertIcon = document.getElementById("alertIcon");
  const alertTime = document.getElementById("alertTime");

  inputs.forEach((input, index) => {
    // Tự động chuyển ô tiếp theo khi nhập số
    input.addEventListener("input", function (e) {
      const val = e.target.value;

      // Chỉ cho nhập số
      if (!/^\d*$/.test(val)) {
        this.value = "";
        return;
      }

      if (val.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      checkEnteredPin();
    });

    // Bấm Backspace để lùi ô
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !this.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  function checkEnteredPin() {
    let currentPin = "";
    inputs.forEach((input) => (currentPin += input.value));

    // Trường hợp 1: Chưa nhập gì
    if (currentPin.length === 0) {
      inputs.forEach((input) => input.classList.remove("error"));
      alertBox.className = "success-alert idle-state";
      alertIcon.innerHTML = '<i class="fa-solid fa-key"></i>';
      alertTitle.innerText = "Vui lòng nhập mã";
      alertMsg.innerText = "Nhập đủ 6 chữ số mã điểm danh";
      alertTime.innerText = "--:--:--";
      return;
    }

    // Trường hợp 2: Đã nhập đủ 6 số và Đúng mã test (123456)
    if (currentPin.length === 6 && currentPin === correctPin) {
      inputs.forEach((input) => input.classList.remove("error"));
      alertBox.className = "success-alert success-state";
      alertIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
      alertTitle.innerText = "Hệ thống xác nhận";
      alertMsg.innerText = "Điểm danh thành công!";

      const now = new Date();
      alertTime.innerText = now.toTimeString().split(" ")[0];
      return;
    }

    // Trường hợp 3: Nhập sai mã hoặc đang nhập dở/không đúng mã
    if (currentPin.length === 6 && currentPin !== correctPin) {
      inputs.forEach((input) => input.classList.add("error"));
      alertBox.className = "success-alert error-state";
      alertIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      alertTitle.innerText = "Không thành công";
      alertMsg.innerText = "Mã không hợp lệ!";
      alertTime.innerText = "--:--:--";
    }
  }
}

/**
 * Tương tác click chọn ngày trên lịch
 */
function initCalendarSelection() {
  const dayElements = document.querySelectorAll(".cal-day:not(.other-month)");
  const selectedDateTitle = document.getElementById("selectedDateTitle");

  dayElements.forEach((day) => {
    day.addEventListener("click", function () {
      dayElements.forEach((d) => d.classList.remove("selected-day"));
      this.classList.add("selected-day");

      const dayNum = this.querySelector(".day-num")?.innerText || "";
      if (selectedDateTitle && dayNum) {
        selectedDateTitle.innerText = `Chi tiết ngày ${dayNum.padStart(2, "0")}/07/2025`;
      }
    });
  });
}
