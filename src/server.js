const express = require('express');
const path = require('path');
const { all, get, runSql } = require('./database');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const handleError = (res, err) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
};

app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await all('SELECT * FROM hotels ORDER BY id DESC');
    res.json(hotels);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/hotels', async (req, res) => {
  const { name, address, city, phone, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Hotel name is required.' });
  }

  try {
    const result = await runSql(
      'INSERT INTO hotels (name, address, city, phone, description) VALUES (?, ?, ?, ?, ?)',
      [name, address || '', city || '', phone || '', description || '']
    );
    const hotel = await get('SELECT * FROM hotels WHERE id = ?', [result.id]);
    res.status(201).json(hotel);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/hotels/:hotelId/rooms', async (req, res) => {
  const hotelId = Number(req.params.hotelId);
  const { checkIn, checkOut } = req.query;

  try {
    let sql = 'SELECT * FROM rooms WHERE hotel_id = ? ORDER BY id DESC';
    let params = [hotelId];

    if (checkIn && checkOut) {
      sql = `
        SELECT * FROM rooms
        WHERE hotel_id = ?
          AND id NOT IN (
            SELECT room_id FROM reservations
            WHERE hotel_id = ?
              AND status = 'booked'
              AND NOT (check_out <= ? OR check_in >= ?)
          )
        ORDER BY id DESC
      `;
      params = [hotelId, hotelId, checkIn, checkOut];
    }

    const rooms = await all(sql, params);
    res.json(rooms);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/hotels/:hotelId/rooms', async (req, res) => {
  const hotelId = Number(req.params.hotelId);
  const { number, type, price } = req.body;

  if (!number) {
    return res.status(400).json({ error: 'Room number is required.' });
  }

  try {
    const result = await runSql(
      'INSERT INTO rooms (hotel_id, number, type, price) VALUES (?, ?, ?, ?)',
      [hotelId, number, type || '', Number(price) || 0]
    );
    const room = await get('SELECT * FROM rooms WHERE id = ?', [result.id]);
    res.status(201).json(room);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/reservations', async (req, res) => {
  const { hotelId } = req.query;
  try {
    const query = `
      SELECT r.*, h.name AS hotel_name, rm.number AS room_number, rm.type AS room_type
      FROM reservations r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN rooms rm ON r.room_id = rm.id
      ${hotelId ? 'WHERE r.hotel_id = ?' : ''}
      ORDER BY r.created_at DESC
    `;
    const params = hotelId ? [hotelId] : [];
    const reservations = await all(query, params);
    res.json(reservations);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/reservations', async (req, res) => {
  const { hotel_id, room_id, guest_name, guest_email, check_in, check_out } = req.body;

  if (!hotel_id || !room_id || !guest_name || !check_in || !check_out) {
    return res.status(400).json({ error: 'Hotel, room, guest name, check-in, and check-out are required.' });
  }

  if (new Date(check_in) >= new Date(check_out)) {
    return res.status(400).json({ error: 'Check-out must be after check-in.' });
  }

  try {
    const conflict = await get(
      `SELECT 1 FROM reservations
       WHERE room_id = ?
         AND status = 'booked'
         AND NOT (check_out <= ? OR check_in >= ?)
       LIMIT 1`,
      [room_id, check_in, check_out]
    );

    if (conflict) {
      return res.status(409).json({ error: 'Room is not available for the selected dates.' });
    }

    const result = await runSql(
      `INSERT INTO reservations (hotel_id, room_id, guest_name, guest_email, check_in, check_out)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hotel_id, room_id, guest_name, guest_email || '', check_in, check_out]
    );

    const reservation = await get('SELECT * FROM reservations WHERE id = ?', [result.id]);
    res.status(201).json(reservation);
  } catch (err) {
    handleError(res, err);
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  const reservationId = Number(req.params.id);

  try {
    const result = await runSql(
      `UPDATE reservations SET status = 'cancelled' WHERE id = ?`,
      [reservationId]
    );
    if (!result.changes) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Hotel Management server listening on http://localhost:${PORT}`);
});
