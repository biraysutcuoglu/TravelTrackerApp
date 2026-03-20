import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import Login from './components/Login';
import Signup from './components/Signup';

const API_BASE_URL = 'http://localhost:8000';

function App() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', or 'trips'
    const [username, setUsername] = useState('');

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (token && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
            setCurrentView('trips');
        }
    }, []);

    // Add Authorization header to axios requests
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Fetch all trips
    const fetchTrips = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/trips/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTrips(response.data);
        } catch (err) {
            setError('Failed to fetch trips. Make sure the API is running on localhost:8000');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && currentView === 'trips') {
            fetchTrips();
        }
    }, [isLoggedIn, currentView]);

    // Add new trip
    const handleAddTrip = async (tripName, date) => {
        try {
            setError('');
            const params = { trip_name: tripName };
            if (date) params.date_str = date;
            
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/trips/`, null, { 
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
            
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/trips/${editingTrip.trip_name}`, null, { 
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/trips/${tripName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete trip');
            console.error(err);
        }
    };

    // Handle login success
    const handleLoginSuccess = () => {
        const storedUsername = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUsername(storedUsername);
        setIsLoggedIn(true);
        setCurrentView('trips');
    };

    // Handle signup success
    const handleSignupSuccess = () => {
        setCurrentView('login');
        setError('Account created successfully! Please log in.');
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setCurrentView('login');
        setTrips([]);
        setEditingTrip(null);
    };

    // Switch between login and signup
    const handleSwitchToSignup = () => {
        setCurrentView('signup');
        setError('');
    };

    const handleSwitchToLogin = () => {
        setCurrentView('login');
        setError('');
    };

    // If not logged in, show login/signup screens
    if (!isLoggedIn) {
        return (
            <div className="App">
                {currentView === 'login' ? (
                    <Login 
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToSignup={handleSwitchToSignup}
                    />
                ) : (
                    <Signup 
                        onSignupSuccess={handleSignupSuccess}
                        onSwitchToLogin={handleSwitchToLogin}
                    />
                )}
                {error && <div className="error-banner">{error}</div>}
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-content">
                    <h1>🌍 Trip Manager</h1>
                    <div className="user-info">
                        <span className="username">Welcome, {username}!</span>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
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
