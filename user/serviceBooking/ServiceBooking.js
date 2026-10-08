document.addEventListener("DOMContentLoaded", () => {
  // Lấy token từ URL trang hiện tại
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token") || localStorage.getItem("petcare_token");

  // Tìm tất cả các nút Xem chi tiết
  const detailButtons = document.querySelectorAll(".btn-detail");

  detailButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceType = btn.getAttribute("data-service");
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
      let targetUrl = "";

      switch (serviceType) {
        case "hotel":
          targetUrl = `../hotelService/HotelService.html${tokenQuery}`;
          break;
        case "health":
          targetUrl = `../healthService/HealthService.html${tokenQuery}`;
          break;
        case "spa":
          targetUrl = `../spaService/SpaService.html${tokenQuery}`;
          break;
        default:
          console.warn(`Dịch vụ chưa được hỗ trợ: ${serviceType}`);
          return;
      }

      window.location.href = targetUrl;
    });
  });

  // Nút "Đặt lịch ngay"
  const bookingButtons = document.querySelectorAll(".btn-booking");
  bookingButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Đặt lịch dịch vụ ngay");
    });
  });
});
