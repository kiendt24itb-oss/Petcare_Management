// SpaService.js
document.addEventListener("DOMContentLoaded", () => {
  // Demo data for Pet Spa Services
  const spaServicesData = [
    {
      id: 1,
      name: "Tắm Thư Giãn",
      desc: "Tắm sạch, sấy khô và chải lông giúp bé thơm mát, nhẹ nhàng thư giãn.",
      duration: "45 – 60 phút",
      price: "200.000đ",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Cắt Tỉa Lông",
      desc: "Cắt tỉa lông chuyên nghiệp, tạo kiểu theo yêu cầu, phù hợp với từng giống.",
      duration: "60 – 90 phút",
      price: "300.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Dưỡng Lông Cao Cấp",
      desc: "Dưỡng lông chuyên sâu giúp lông mượt mà, bóng đẹp và chắc khỏe.",
      duration: "60 phút",
      price: "350.000đ",
      image:
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Vệ Sinh Tai & Mắt",
      desc: "Vệ sinh tai, mắt nhẹ nhàng, loại bỏ bụi bẩn và ngăn ngừa viêm nhiễm.",
      duration: "20 – 30 phút",
      price: "100.000đ",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Cắt Móng",
      desc: "Cắt móng an toàn, không gây đau, giúp bé di chuyển thoải mái hơn.",
      duration: "15 – 20 phút",
      price: "80.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      name: "Spa Thư Giãn Toàn Diện",
      desc: "Combo tắm, cắt tỉa, dưỡng lông, vệ sinh toàn diện – bé đẹp từ đầu đến chân.",
      duration: "90 – 120 phút",
      price: "600.000đ",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      name: "Tắm Thư Giãn",
      desc: "Tắm sạch, sấy khô và chải lông giúp bé thơm mát, nhẹ nhàng thư giãn.",
      duration: "45 – 60 phút",
      price: "200.000đ",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      name: "Cắt Tỉa Lông",
      desc: "Cắt tỉa lông chuyên nghiệp, tạo kiểu theo yêu cầu, phù hợp với từng giống.",
      duration: "60 – 90 phút",
      price: "300.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 9,
      name: "Dưỡng Lông Cao Cấp",
      desc: "Dưỡng lông chuyên sâu giúp lông mượt mà, bóng đẹp và chắc khỏe.",
      duration: "60 phút",
      price: "350.000đ",
      image:
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 10,
      name: "Vệ Sinh Tai & Mắt",
      desc: "Vệ sinh tai, mắt nhẹ nhàng, loại bỏ bụi bẩn và ngăn ngừa viêm nhiễm.",
      duration: "20 – 30 phút",
      price: "100.000đ",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 11,
      name: "Cắt Móng",
      desc: "Cắt móng an toàn, không gây đau, giúp bé di chuyển thoải mái hơn.",
      duration: "15 – 20 phút",
      price: "80.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 12,
      name: "Spa Thư Giãn Toàn Diện",
      desc: "Combo tắm, cắt tỉa, dưỡng lông, vệ sinh toàn diện – bé đẹp từ đầu đến chân.",
      duration: "90 – 120 phút",
      price: "600.000đ",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    },
  ];

  // Function to render Spa services list
  const renderSpaServices = (services) => {
    const spaServicesGrid = document.getElementById("spaServicesGrid");
    if (!spaServicesGrid) return;

    spaServicesGrid.innerHTML = services
      .map(
        (service) => `
            <div class="service-card" data-id="${service.id}">
                <div class="service-img-wrapper">
                    <img src="${service.image}" alt="${service.name}" class="service-img">
                </div>
                <div class="service-body">
                    <h4 class="service-name">${service.name}</h4>
                    <p class="service-desc">${service.desc}</p>
                    <div class="service-duration">
                        <i class="fa-regular fa-clock"></i> ${service.duration}
                    </div>
                    <div class="service-price">
                        ${service.price}
                    </div>
                    <button class="btn-detail btn-spa-detail" data-id="${service.id}">
                        <i class="fa-regular fa-calendar-check"></i> Xem chi tiết
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  };

  // Initial Render
  renderSpaServices(spaServicesData);

  // Reserved event listener placeholders
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-spa-detail")) {
      const serviceId = e.target.closest(".btn-spa-detail").dataset.id;
      console.log(`Xem chi tiết dịch vụ Spa ID: ${serviceId}`);
    }

    if (e.target.closest(".btn-booking")) {
      console.log("Sự kiện click Đặt lịch Spa ngay");
    }
  });
});
