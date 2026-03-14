# Trip Manager - React Frontend

A modern React GUI for managing your trips with the FastAPI backend.

## Features

- 🌍 View all trips
- ➕ Add new trips with optional dates
- ✏️ Edit existing trips
- 🗑️ Delete trips
- 📅 Date validation (DD.MM.YYYY format)
- 💅 Beautiful, responsive UI

## Setup Instructions

### Prerequisites
- Node.js 14+ and npm installed
- FastAPI backend running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

Start the React development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

Create an optimized production build:
```bash
npm build
```

## How to Use

1. **Add a Trip**: Enter a trip name and optional date in the form on the left, then click "Add Trip"
2. **Edit a Trip**: Click the ✏️ button on any trip card to edit it
3. **Delete a Trip**: Click the 🗑️ button to remove a trip
4. **Date Format**: Use DD.MM.YYYY format (e.g., 15.03.2026)

## API Endpoints Used

- `GET /trips/` - Fetch all trips
- `POST /trips/` - Create a new trip
- `PUT /trips/{trip_name}` - Update a trip
- `DELETE /trips/{trip_name}` - Delete a trip

## Notes

- Make sure your FastAPI backend is running before starting the React app
- The frontend uses CORS to communicate with the backend
- If you get CORS errors, ensure your FastAPI app has the proper CORS middleware configured
