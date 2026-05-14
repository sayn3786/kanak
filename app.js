const rooms = [
    {
        name: "AC Double Bed Room",
        price: 1700,
        image: "images/rooms/deluxe-room.jfif",
        description: "Comfortable double-bed room with air conditioning, attached bath and sitting space.",
        tags: ["2 guests", "AC", "Double bed", "Sitting area"]
    },
    {
        name: "Non-AC Double Bed Room",
        price: 1300,
        image: "images/rooms/standard-room.jfif",
        description: "Neat double-bed room for short stays, family stopovers and budget-friendly booking.",
        tags: ["2 guests", "Non-AC", "Double bed", "Attached bath"]
    },
    {
        name: "Super Deluxe Room",
        price: 2000,
        image: "images/rooms/suite-room.jfif",
        description: "Spacious premium room with AC comfort, double bed and extra seating for a more relaxed stay.",
        tags: ["2 guests", "AC", "Double bed", "Premium space"]
    }
];

const galleryImages = [
    ["images/Image1.jpg", "Decorated hotel entrance"],
    ["images/Image2.jpg", "Banquet and event setup"],
    ["images/Image3.jpg", "Hotel decoration view"],
    ["images/Image4.jpg", "Hotel hall and celebration space"],
    ["images/Image5.jpg", "Kanak Resident hotel area"],
    ["images/Image6.jpg", "Hotel service area"],
    ["images/Image7.jpg", "Event venue photo"],
    ["images/Image8.jpg", "Hotel property photo"],
    ["images/rooms/deluxe-room.jfif", "AC double bed room"],
    ["images/rooms/standard-room.jfif", "Non-AC double bed room"],
    ["images/rooms/suite-room.jfif", "Super Deluxe room"],
    ["images/rooms/room-bed-detail.jfif", "Room bed and linen"],
    ["images/rooms/room-sitting-area.jfif", "Room sitting area"],
    ["images/rooms/suite-lounge.jfif", "Suite lounge seating"],
    ["images/rooms/attached-bath.jfif", "Attached bathroom with geyser"],
    ["images/Kanak.jpg", "Hotel front view"]
];

const storageKey = "kanakHotelBookings";
const roomGrid = document.getElementById("roomGrid");
const galleryGrid = document.getElementById("galleryGrid");
const bookingForm = document.getElementById("bookingForm");
const roomType = document.getElementById("roomType");
const guests = document.getElementById("guests");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const guestName = document.getElementById("guestName");
const guestPhone = document.getElementById("guestPhone");
const notes = document.getElementById("notes");
const bookingSummary = document.getElementById("bookingSummary");
const bookingList = document.getElementById("bookingList");
const clearBookings = document.getElementById("clearBookings");
const navLinks = document.getElementById("navLinks");
const menuToggle = document.querySelector(".menu-toggle");
const imageDialog = document.getElementById("imageDialog");
const dialogImage = document.getElementById("dialogImage");
const closeDialog = document.getElementById("closeDialog");

function formatMoney(value) {
    return `Rs ${value.toLocaleString("en-IN")}`;
}

function todayIso() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split("T")[0];
}

function getRoom(roomName) {
    return rooms.find((room) => room.name === roomName) || rooms[0];
}

function getNights() {
    if (!checkIn.value || !checkOut.value) {
        return 0;
    }

    const start = new Date(checkIn.value);
    const end = new Date(checkOut.value);
    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
}

function getBookings() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveBookings(bookings) {
    localStorage.setItem(storageKey, JSON.stringify(bookings));
}

function renderRooms() {
    roomGrid.innerHTML = rooms.map((room) => `
        <article class="room-card">
            <img src="${room.image}" alt="${room.name} at Kanak Resident and Hotel">
            <div class="room-body">
                <h3>${room.name}</h3>
                <p>${room.description}</p>
                <div class="room-meta">
                    ${room.tags.map((tag) => `<span>${tag}</span>`).join("")}
                </div>
                <div class="price">${formatMoney(room.price)} <small>/ night</small></div>
                <button type="button" data-room="${room.name}">Book this room</button>
            </div>
        </article>
    `).join("");
}

function renderRoomOptions() {
    roomType.innerHTML = rooms.map((room) => `
        <option value="${room.name}">${room.name} - ${formatMoney(room.price)}/night</option>
    `).join("");
}

function renderGallery() {
    galleryGrid.innerHTML = galleryImages.map(([src, alt]) => `
        <button type="button" data-image="${src}" data-alt="${alt}" aria-label="Open ${alt}">
            <img src="${src}" alt="${alt}">
        </button>
    `).join("");
}

function updateSummary() {
    const nights = getNights();
    const room = getRoom(roomType.value);

    if (!nights) {
        bookingSummary.textContent = "Select valid check-in and check-out dates to see the booking summary.";
        return;
    }

    const total = nights * room.price;
    bookingSummary.textContent = `${room.name} for ${guests.value} guest(s), ${nights} night(s). Estimated room total: ${formatMoney(total)}.`;
}

function renderBookings() {
    const bookings = getBookings();

    if (!bookings.length) {
        bookingList.innerHTML = "<p>No saved booking requests yet.</p>";
        return;
    }

    bookingList.innerHTML = bookings
        .slice()
        .reverse()
        .map((booking) => `
            <div class="booking-item">
                <strong>${booking.room}</strong><br>
                ${booking.name} | ${booking.phone}<br>
                ${booking.checkIn} to ${booking.checkOut} | ${booking.guests} guest(s)<br>
                Estimated: ${formatMoney(booking.total)}
            </div>
        `)
        .join("");
}

function buildWhatsappMessage(booking) {
    return [
        "Hello Kanak Resident and Hotel, I want to book a room.",
        `Room: ${booking.room}`,
        `Name: ${booking.name}`,
        `Phone: ${booking.phone}`,
        `Guests: ${booking.guests}`,
        `Check-in: ${booking.checkIn}`,
        `Check-out: ${booking.checkOut}`,
        `Nights: ${booking.nights}`,
        `Estimated total: ${formatMoney(booking.total)}`,
        booking.notes ? `Special request: ${booking.notes}` : ""
    ].filter(Boolean).join("\n");
}

function selectRoom(roomName) {
    roomType.value = roomName;
    updateSummary();
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function setupEvents() {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });

    roomGrid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-room]");
        if (button) {
            selectRoom(button.dataset.room);
        }
    });

    galleryGrid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-image]");
        if (!button) {
            return;
        }

        dialogImage.src = button.dataset.image;
        dialogImage.alt = button.dataset.alt;
        imageDialog.showModal();
    });

    closeDialog.addEventListener("click", () => imageDialog.close());

    [roomType, guests, checkIn, checkOut].forEach((field) => {
        field.addEventListener("input", updateSummary);
    });

    checkIn.addEventListener("input", () => {
        checkOut.min = checkIn.value || todayIso();
    });

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const nights = getNights();

        if (!nights) {
            bookingSummary.textContent = "Check-out date must be after check-in date.";
            return;
        }

        const room = getRoom(roomType.value);
        const booking = {
            id: Date.now(),
            room: room.name,
            guests: guests.value,
            checkIn: checkIn.value,
            checkOut: checkOut.value,
            name: guestName.value.trim(),
            phone: guestPhone.value.trim(),
            notes: notes.value.trim(),
            nights,
            total: nights * room.price
        };

        const bookings = getBookings();
        bookings.push(booking);
        saveBookings(bookings);
        renderBookings();
        updateSummary();

        const whatsappUrl = `https://wa.me/919142350427?text=${encodeURIComponent(buildWhatsappMessage(booking))}`;
        window.open(whatsappUrl, "_blank", "noopener");
    });

    clearBookings.addEventListener("click", () => {
        saveBookings([]);
        renderBookings();
    });
}

function setupReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function init() {
    renderRooms();
    renderRoomOptions();
    renderGallery();
    setupEvents();
    setupReveals();

    checkIn.min = todayIso();
    checkOut.min = todayIso();
    updateSummary();
    renderBookings();
}

init();
