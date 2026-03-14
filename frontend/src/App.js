import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';

const API_BASE_URL = 'http://localhost:8000';

function App() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [error, setError] = useState('');

    // Fetch all trips
    const fetchTrips = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/trips/`);
            setTrips(response.data);
        } catch (err) {
            setError('Failed to fetch trips. Make sure the API is running on localhost:8000');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    // Add new trip
    const handleAddTrip = async (tripName, date) => {
        try {
            setError('');
            const params = { trip_name: tripName };
            if (date) params.date_str = date;
            
            await axios.post(`${API_BASE_URL}/trips/`, null, { params });
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add trip');
            console.error(err);
        }
    };

    // Update trip
    const handleUpdateTrip = async (tripName, date) => {
        try {
            setError('');
            const params = { trip_name: tripName };
            if (date) params.date_str = date;
            
            await axios.put(`${API_BASE_URL}/trips/${editingTrip.trip_name}`, null, { params });
            await fetchTrips();
            setEditingTrip(null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update trip');
            console.error(err);
        }
    };

    // Delete trip
    const handleDeleteTrip = async (tripName) => {
        if (!window.confirm(`Are you sure you want to delete "${tripName}"?`)) return;
        
        try {
            setError('');
            await axios.delete(`${API_BASE_URL}/trips/${tripName}`);
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete trip');
            console.error(err);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>🌍 Trip Manager</h1>
                <p>Manage your trips</p>
            </header>
            
            <div className="container">
                {error && <div className="error-message">{error}</div>}
                
                <div className="content">
                    <div className="form-section">
                        <h2>{editingTrip ? 'Edit Trip' : 'Add New Trip'}</h2>
                        <TripForm 
                            onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
                            initialTrip={editingTrip}
                            onCancel={() => setEditingTrip(null)}
                        />
                    </div>

                    <div className="list-section">
                        <h2>Your Trips</h2>
                        {loading ? (
                            <p className="loading">Loading trips...</p>
                        ) : trips.length === 0 ? (
                            <p className="empty-state">No trips yet. Add one to get started!</p>
                        ) : (
                            <TripList 
                                trips={trips}
                                onDelete={handleDeleteTrip}
                                onEdit={setEditingTrip}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
