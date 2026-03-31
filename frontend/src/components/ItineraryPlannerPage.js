import React, { useState } from 'react';
import axios from 'axios';
import './RecommendationsPage.css';
import './ItineraryPlannerPage.css';

function ItineraryPlannerPage({ tripName, entry, username, onBack, onLogout, initialDays }) {
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [keyword, setKeyword] = useState('Adventure'); // fixed default
  const [days, setDays] = useState(
    initialDays != null ? String(initialDays) : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { days, budget, currency, keyword });
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

    const token = localStorage.getItem('token');

    const payload = {
      trip_name: tripName,
      destination: entry?.destination,
      days: days ? parseInt(days, 10) : null,
      budget: budget ? parseFloat(budget) : null,
      currency,
      keyword,
    };

    axios.post(`${API_BASE_URL}/itinerary`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      console.log('Itinerary response:', res.data);
    })
    .catch(err => {
      console.error('Itinerary error:', err.response || err);
      alert('Failed to create itinerary. See console for details.');
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Trip Manager</h1>
          <div className="user-info">
            <span className="username">Welcome, {username}!</span>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
        <p>Itinerary Planner</p>
      </header>

      <div className="container">
        <button className="btn-back" onClick={onBack}>
          ← Back to Trips
        </button>

        <div className="itinerary-form-section">
          <h2>Plan Your Itinerary</h2>

          {tripName && (
            <p>
              Trip: <strong>{tripName}</strong> to{' '}
              <strong>{entry?.destination}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="itinerary-form">

            {/* Number of Days */}
            <div className="form-group">
              <label htmlFor="days">Number of Days</label>
              <input
                type="number"
                id="days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="Enter number of days"
                min="1"
                max={initialDays}
                step="1"
              />
            </div>

            {/* Budget */}
            <div className="form-group">
              <label htmlFor="budget">Budget</label>
              <div className="budget-input-group">
                <input
                  type="number"
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter budget amount"
                  step="0.01"
                  min="0"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            {/* Travel Keyword */}
            <div className="form-group">
              <label htmlFor="travelKeyword">Travel Keyword</label>
              <select
                id="travelKeyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              >
                <option value="Adventure">Adventure</option>
                <option value="WellnessRelaxation">Wellness & Relaxation</option>
                <option value="CulturalEducational">Cultural & Educational</option>
                <option value="Niche">Niche</option>
              </select>
            </div>

            <button type="submit" className="btn-submit">
              Create Itinerary with AI
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ItineraryPlannerPage;