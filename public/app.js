const state = {
  hotels: [],
  selectedHotel: null,
  rooms: [],
  reservations: [],
};

const hotelForm = document.getElementById('hotel-form');
const hotelName = document.getElementById('hotel-name');
const hotelAddress = document.getElementById('hotel-address');
const hotelCity = document.getElementById('hotel-city');
const hotelPhone = document.getElementById('hotel-phone');
const hotelDescription = document.getElementById('hotel-description');
const hotelsList = document.getElementById('hotels-list');
const roomHeader = document.getElementById('room-header');
const roomForm = document.getElementById('room-form');
const roomNumber = document.getElementById('room-number');
const roomType = document.getElementById('room-type');
const roomPrice = document.getElementById('room-price');
const roomsList = document.getElementById('rooms-list');
const reservationForm = document.getElementById('reservation-form');
const reservationHotel = document.getElementById('reservation-hotel');
const reservationRoom = document.getElementById('reservation-room');
const guestName = document.getElementById('guest-name');
const guestEmail = document.getElementById('guest-email');
const checkIn = document.getElementById('check-in');
const checkOut = document.getElementById('check-out');
const reservationsList = document.getElementById('reservations-list');

async function fetchHotels() {
  const response = await fetch('/api/hotels');
  state.hotels = await response.json();
  renderHotels();
  renderHotelOptions();
}

async function fetchRooms(hotelId = null) {
  if (!hotelId) return;
  const response = await fetch(`/api/hotels/${hotelId}/rooms`);
  state.rooms = await response.json();
  renderRooms();
}

async function fetchReservations() {
  const response = await fetch('/api/reservations');
  state.reservations = await response.json();
  renderReservations();
}

function renderHotels() {
  hotelsList.innerHTML = '';
  state.hotels.forEach((hotel) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <strong>${hotel.name}</strong>
        <button class="choose-button">Select</button>
      </div>
      <p>${hotel.address || 'No address'} ${hotel.city ? `· ${hotel.city}` : ''}</p>
      <p>${hotel.phone || 'No phone'}</p>
      <p>${hotel.description || 'No description'}</p>
    `;
    card.querySelector('.choose-button').addEventListener('click', () => {
      state.selectedHotel = hotel;
      renderHotelSelection();
      fetchRooms(hotel.id);
    });
    hotelsList.appendChild(card);
  });
}

function renderHotelSelection() {
  if (!state.selectedHotel) {
    roomHeader.textContent = 'Select a hotel to manage rooms.';
    roomForm.classList.add('hidden');
  } else {
    roomHeader.textContent = `Rooms for ${state.selectedHotel.name}`;
    roomForm.classList.remove('hidden');
  }
}

function renderHotelOptions() {
  reservationHotel.innerHTML = '<option value="">Choose hotel</option>';
  state.hotels.forEach((hotel) => {
    const option = document.createElement('option');
    option.value = hotel.id;
    option.textContent = hotel.name;
    reservationHotel.appendChild(option);
  });
  populateRoomOptions();
}

function renderRooms() {
  roomsList.innerHTML = '';
  if (!state.rooms.length) {
    roomsList.innerHTML = '<p>No rooms available for this hotel yet.</p>';
    return;
  }

  state.rooms.forEach((room) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <strong>Room ${room.number}</strong>
        <span>${room.type || 'Standard'}</span>
      </div>
      <p>Price: $${room.price.toFixed(2)}</p>
      <p>Status: ${room.status}</p>
    `;
    roomsList.appendChild(card);
  });
  populateRoomOptions();
}

function renderReservations() {
  reservationsList.innerHTML = '';
  if (!state.reservations.length) {
    reservationsList.innerHTML = '<p>No reservations yet.</p>';
    return;
  }

  state.reservations.forEach((reservation) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <strong>${reservation.guest_name}</strong>
        <button class="cancel-button">Cancel</button>
      </div>
      <p>${reservation.hotel_name} · Room ${reservation.room_number} (${reservation.room_type || 'Standard'})</p>
      <p>${reservation.check_in} → ${reservation.check_out}</p>
      <p>Status: ${reservation.status}</p>
    `;
    card.querySelector('.cancel-button').addEventListener('click', async () => {
      await fetch(`/api/reservations/${reservation.id}`, { method: 'DELETE' });
      await fetchReservations();
    });
    reservationsList.appendChild(card);
  });
}

function populateRoomOptions() {
  const selectedHotelId = reservationHotel.value;
  reservationRoom.innerHTML = '<option value="">Choose room</option>';
  if (!selectedHotelId) return;

  const rooms = state.rooms.filter((room) => room.hotel_id === Number(selectedHotelId));
  rooms.forEach((room) => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `Room ${room.number} — ${room.type || 'Standard'} ($${room.price.toFixed(2)})`;
    reservationRoom.appendChild(option);
  });
}

hotelForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    name: hotelName.value.trim(),
    address: hotelAddress.value.trim(),
    city: hotelCity.value.trim(),
    phone: hotelPhone.value.trim(),
    description: hotelDescription.value.trim(),
  };

  await fetch('/api/hotels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  hotelForm.reset();
  await fetchHotels();
});

roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.selectedHotel) return;

  const payload = {
    number: roomNumber.value.trim(),
    type: roomType.value.trim(),
    price: roomPrice.value === '' ? 0 : Number(roomPrice.value),
  };

  await fetch(`/api/hotels/${state.selectedHotel.id}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  roomForm.reset();
  await fetchRooms(state.selectedHotel.id);
});

reservationHotel.addEventListener('change', async () => {
  const hotelId = Number(reservationHotel.value);
  if (!hotelId) {
    reservationRoom.innerHTML = '<option value="">Choose room</option>';
    return;
  }

  const response = await fetch(`/api/hotels/${hotelId}/rooms`);
  state.rooms = await response.json();
  populateRoomOptions();
});

reservationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    hotel_id: Number(reservationHotel.value),
    room_id: Number(reservationRoom.value),
    guest_name: guestName.value.trim(),
    guest_email: guestEmail.value.trim(),
    check_in: checkIn.value,
    check_out: checkOut.value,
  };

  await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  reservationForm.reset();
  await fetchReservations();
});

(async function initialize() {
  await fetchHotels();
  await fetchReservations();
})();
