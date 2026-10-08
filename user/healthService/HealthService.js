// HealthService.js
document.addEventListener("DOMContentLoaded", () => {
  // Demo data for Pet Health Services
  const healthServicesData = [
    {
      id: 1,
      name: "Khám Tổng Quát",
      desc: "Kiểm tra sức khỏe tổng thể, phát hiện sớm các vấn đề tiềm ẩn.",
      price: "200.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Khám Chuyên Sâu",
      desc: "Khám chuyên khoa theo từng hệ cơ quan, chẩn đoán chuyên sâu.",
      price: "350.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Xét Nghiệm Máu",
      desc: "Xét nghiệm máu tổng quát, đánh giá chức năng cơ quan và phát hiện bệnh lý.",
      price: "250.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Siêu Âm",
      desc: "Siêu âm ổ bụng, tim, thai... hỗ trợ chẩn đoán chính xác.",
      price: "300.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Tiêm Phòng",
      desc: "Tiêm phòng đầy đủ các loại vắc-xin theo độ tuổi và nhu cầu.",
      price: "150.000đ",
      unit: "/ mũi",
      image:
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      name: "Điều Trị Nội Trú",
      desc: "Chăm sóc và theo dõi 24/7 với phác đồ điều trị hiệu quả.",
      price: "400.000đ",
      unit: "/ ngày",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      name: "Khám Tổng Quát",
      desc: "Kiểm tra sức khỏe tổng thể, phát hiện sớm các vấn đề tiềm ẩn.",
      price: "200.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      name: "Khám Chuyên Sâu",
      desc: "Khám chuyên khoa theo từng hệ cơ quan, chẩn đoán chuyên sâu.",
      price: "350.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 9,
      name: "Xét Nghiệm Máu",
      desc: "Xét nghiệm máu tổng quát, đánh giá chức năng cơ quan và phát hiện bệnh lý.",
      price: "250.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 10,
      name: "Siêu Âm",
      desc: "Siêu âm ổ bụng, tim, thai... hỗ trợ chẩn đoán chính xác.",
      price: "300.000đ",
      unit: "/ lượt",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 11,
      name: "Tiêm Phòng",
      desc: "Tiêm phòng đầy đủ các loại vắc-xin theo độ tuổi và nhu cầu.",
      price: "150.000đ",
      unit: "/ mũi",
      image:
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 12,
      name: "Điều Trị Nội Trú",
      desc: "Chăm sóc và theo dõi 24/7 với phác đồ điều trị hiệu quả.",
      price: "400.000đ",
      unit: "/ ngày",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    },
  ];

  // Function to render health services list
  const renderServices = (services) => {
    const servicesGrid = document.getElementById("servicesGrid");
    if (!servicesGrid) return;

    servicesGrid.innerHTML = services
      .map(
        (service) => `
            <div class="service-card" data-id="${service.id}">
                <div class="service-img-wrapper">
                    <img src="${service.image}" alt="${service.name}" class="service-img">
                </div>
                <div class="service-body">
                    <h4 class="service-name">${service.name}</h4>
                    <p class="service-desc">${service.desc}</p>
                    <div class="service-price">
                        ${service.price} <span>${service.unit}</span>
                    </div>
                    <button class="btn-detail btn-service-detail" data-id="${service.id}">
                        <i class="fa-regular fa-hospital"></i> Xem chi tiết
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  };

  // Initial Render
  renderServices(healthServicesData);

  // Reserved event listener placeholders
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-service-detail")) {
      const serviceId = e.target.closest(".btn-service-detail").dataset.id;
      console.log(`Xem chi tiết dịch vụ Health ID: ${serviceId}`);
    }

    if (e.target.closest(".btn-booking")) {
      console.log("Sự kiện click Đặt lịch khám ngay");
    }
  });
});