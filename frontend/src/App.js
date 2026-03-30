import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import Login from './components/Login';
import Signup from './components/Signup';
import RecommendationsPage from './components/RecommendationsPage';

const API_BASE_URL = 'http://localhost:8000';

function App() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', or 'trips'
    const [username, setUsername] = useState('');
    const [recommendations, setRecommendations] = useState([]); 
    const [loadingRecs, setLoadingRecs] = useState(false);    
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [prefilledTrip, setPrefilledTrip] = useState(null);

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
    const handleAddTrip = async (tripName, startDate, endDate, destination) => {
        try {
            setError('');
            const params = { trip_name: tripName };
            if (startDate) params.start_date_str = startDate;
            if (endDate) params.end_date_str = endDate;
            if (destination) params.destination = destination;
            
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
    const handleUpdateTrip = async (tripName, newStartDate, newEndDate, newDestination) => {
        try {
            setError('');
            const params = {
                old_start_date_str: editingTrip.start_date || null,
                old_end_date_str: editingTrip.end_date || null,
                new_start_date_str: newStartDate || null,
                new_end_date_str: newEndDate || null,
                destination: newDestination || null
            };

            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/trips/${tripName}`, null, {
                params,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchTrips();
            setEditingTrip(null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update trip');
            console.error(err);
        }
    };

    // Delete trip
    const handleDeleteTrip = async (tripName, entry) => {
        // Determine if deleting specific record or entire trip
        const isDeletingRecord = entry && entry.destination;

        const message = isDeletingRecord 
            ? `Delete ${entry.start_date} - ${entry.end_date} to ${entry.destination}"?` 
            : `Delete all dates for "${tripName}"?`;
        
        if (!window.confirm(message)) return;
        
        try {
            setError('');
            const token = localStorage.getItem('token');
            let url = `${API_BASE_URL}/trips/${tripName}`;
            let params = {};

            // if deleting a specific record
            if(isDeletingRecord){
                url += '/record';
                params = {
                    destination: entry.destination,
                    start_date: entry.start_date, 
                    end_date: entry.end_date
                };
            }
            
            await axios.delete(url, {
                params,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete trip');
            console.error(err);
        }
    };

    const fetchRecommendations = async () => {
        setLoadingRecs(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/recommendations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRecommendations(response.data);
            setShowRecommendations(true);
        } catch (err) {
            setError('Failed to fetch recommendations');
            console.error(err);
        } finally {
            setLoadingRecs(false);
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
        setRecommendations([]);
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

    if (showRecommendations) {
        return (
            <RecommendationsPage
                recommendations={recommendations}
                username={username}
                onBack={() => setShowRecommendations(false)}
                onLogout={handleLogout}
                onPlanTrip={(city) => {
                    setShowRecommendations(false);
                    setPrefilledTrip({ trip_name: city, date: '' });
                }}
            />
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-content">
                    <h1>Trip Manager</h1>
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
                            initialTrip={editingTrip || prefilledTrip}
                            onCancel={() => {
                                setEditingTrip(null);
                                setPrefilledTrip(null);
                            }}
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
                                onEdit={(tripName, entry) => setEditingTrip({
                                    trip_name: tripName,
                                    ...entry,
                                    isEditing: true
                                })}
                            />
                        )}
                    </div>

                    <div className="recommendations-section">
                        <button
                            onClick={fetchRecommendations}
                            disabled={loadingRecs}
                            className="btn-recommendations">
                            {loadingRecs ? '⏳ Loading...' : '✈️ Get Destination Recommendations'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
