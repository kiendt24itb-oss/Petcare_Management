// HotelService.js
document.addEventListener("DOMContentLoaded", () => {
  // Demo data for Rooms list
  const roomData = [
    {
      id: 1,
      name: "Phòng Standard",
      area: "~2m²",
      capacity: "Tối đa 2 bé",
      price: "200.000đ",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Phòng Deluxe",
      area: "~3m²",
      capacity: "Tối đa 3 bé",
      price: "300.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Phòng VIP",
      area: "~4m²",
      capacity: "Tối đa 4 bé",
      price: "450.000đ",
      image:
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Suite Gia Đình",
      area: "~6m²",
      capacity: "Tối đa 6 bé",
      price: "600.000đ",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Phòng View Vườn",
      area: "~3m²",
      capacity: "Tối đa 3 bé",
      price: "350.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      name: "Phòng Premium",
      area: "~5m²",
      capacity: "Tối đa 5 bé",
      price: "550.000đ",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      name: "Phòng Standard",
      area: "~2m²",
      capacity: "Tối đa 2 bé",
      price: "200.000đ",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      name: "Phòng Deluxe",
      area: "~3m²",
      capacity: "Tối đa 3 bé",
      price: "300.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 9,
      name: "Phòng VIP",
      area: "~4m²",
      capacity: "Tối đa 4 bé",
      price: "450.000đ",
      image:
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 10,
      name: "Suite Gia Đình",
      area: "~6m²",
      capacity: "Tối đa 6 bé",
      price: "600.000đ",
      image:
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 11,
      name: "Phòng View Vườn",
      area: "~3m²",
      capacity: "Tối đa 3 bé",
      price: "350.000đ",
      image:
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 12,
      name: "Phòng Premium",
      area: "~5m²",
      capacity: "Tối đa 5 bé",
      price: "550.000đ",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    },
  ];

  // Function to render rooms list
  const renderRooms = (rooms) => {
    const roomsGrid = document.getElementById("roomsGrid");
    if (!roomsGrid) return;

    roomsGrid.innerHTML = rooms
      .map(
        (room) => `
            <div class="room-card" data-id="${room.id}">
                <div class="room-img-wrapper">
                    <img src="${room.image}" alt="${room.name}" class="room-img">
                </div>
                <div class="room-body">
                    <h4 class="room-name">${room.name}</h4>
                    <div class="room-specs">
                        <span class="spec-item"><i class="fa-solid fa-box"></i> ${room.area}</span>
                        <span class="spec-item"><i class="fa-solid fa-user-group"></i> ${room.capacity}</span>
                    </div>
                    <div class="room-price">
                        ${room.price} <span>/ đêm</span>
                    </div>
                    <button class="btn-detail btn-room-detail" data-id="${room.id}">
                        <i class="fa-regular fa-calendar-check"></i> Xem chi tiết
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  };

  // Initial Render
  renderRooms(roomData);

  // Reserved event listener placeholders
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-room-detail")) {
      const roomId = e.target.closest(".btn-room-detail").dataset.id;
      console.log(`Xem chi tiết phòng ID: ${roomId}`);
    }

    if (e.target.closest(".btn-booking")) {
      console.log("Sự kiện click Đặt lịch ngay (chờ xử lý)");
    }
  });
});
