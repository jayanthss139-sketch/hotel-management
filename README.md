# Hotel Management System

A simple hotel management system with:

- Node.js + Express backend
- SQLite database
- Plain JavaScript frontend
- Hotel, room, and reservation management

## Features

- Create hotels
- Add rooms to a hotel
- Create reservations
- Cancel reservations
- View current hotels, rooms, and bookings

## Get Started

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm start
```

Open your browser at `http://localhost:4000`.

## Project Structure

- `src/server.js` - Express API server
- `src/database.js` - SQLite database setup and helper functions
- `public/` - Static frontend files
- `public/index.html` - UI for hotel management
- `public/app.js` - Frontend logic
- `public/styles.css` - Basic styling

## API Endpoints

- `GET /api/hotels` - List all hotels
- `POST /api/hotels` - Create a hotel
- `GET /api/hotels/:hotelId/rooms` - List rooms for a hotel
- `POST /api/hotels/:hotelId/rooms` - Add a room to a hotel
- `GET /api/reservations` - List reservations
- `POST /api/reservations` - Create a reservation
- `DELETE /api/reservations/:id` - Cancel a reservation

## Notes

The SQLite database file is created at the project root as `hotel-management.db`. It is ignored by Git via `.gitignore`.
