import React from 'react';
import './TripCard.css';

function TripCard({ trip, onDelete, onEdit }) {
    const hasEntries = trip.entries && trip.entries.length > 0;

    return (
        <div className="trip-card">
            <div className="trip-info">
                <div className="trip-header">
                    <h3>{trip.trip_name}</h3>
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
                            onClick={() => onDelete(trip.trip_name, null, null)}
                            title="Delete entire trip"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                {hasEntries && (
                    <div className="trip-dates">
                        {trip.entries.map((entry, index) => (
                            <div key={index} className="trip-date-row">
                                <div className="trip-entry-info">
                                    <p className="trip-destination">📍 {entry.destination}</p>
                                    <p className="trip-date">📅 {entry.start_date} → {entry.end_date}</p>
                                </div>
                                <button
                                    className="btn-action btn-delete-date"
                                    onClick={() => onDelete(trip.trip_name, entry.start_date, entry.end_date)}
                                    title="Delete this date"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TripCard;