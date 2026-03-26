import React from 'react';
import './RecommendationsPage.css';

function RecommendationsPage({ recommendations, username, onBack, onLogout, onPlanTrip }) {
    return (
        <div className="App">
            <header className="App-header">
                <div className="header-content">
                    <h1>Trip Manager</h1>
                    <div className="user-info">
                        <span className="username">Welcome, {username}!</span>
                        <button className="btn-logout" onClick={onLogout}>Logout</button>
                    </div>
                </div>
                <p>Destination Recommendations</p>
            </header>

            <div className="container">
                <button className="btn-back" onClick={onBack}>
                    ← Back to Trips
                </button>

                <h2 className="recs-page-title">✈️ Recommended Destinations</h2>

                <div className="recommendations-grid">
                    {recommendations.map((rec, index) => (
                        <div key={index} className="recommendation-card">
                            <h3>📍 {rec.city}, {rec.country}</h3>
                            <p>{rec.reason}</p>
                            <p className="best-time">🗓️ Best time to visit: {rec.best_time}</p>
                            <button
                                className="btn-plan-trip"
                                onClick={() => onPlanTrip(rec.city)}>
                                ✈️ Plan a Trip
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RecommendationsPage;