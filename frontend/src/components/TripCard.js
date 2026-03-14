import React from 'react';
import './TripCard.css';

function TripCard({ trip, onDelete, onEdit }) {
    const hasDate = trip.date && trip.date !== 'None';

    return (
        <div className="trip-card">
            <div className="trip-info">
                <h3>{trip.trip_name}</h3>
                {hasDate && <p className="trip-date">📅 {trip.date}</p>}
            </div>
            <div className="trip-actions">
                <button 
                    className="btn-action btn-edit"
                    onClick={() => onEdit(trip)}
                    title="Edit trip"
                >
                    ✏️
                </button>
                <button 
                    className="btn-action btn-delete"
                    onClick={() => onDelete(trip.trip_name)}
                    title="Delete trip"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

export default TripCard;
