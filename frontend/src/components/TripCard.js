import React from 'react';
import './TripCard.css';

function TripCard({ trip, onDelete, onEdit }) {
    const hasDates = trip.dates && trip.dates.length > 0;

    return (
        <div className="trip-card">
            <div className="trip-info">
                <h3>{trip.trip_name}</h3>
                {hasDates && (
                    <div className="trip-dates">
                        {trip.dates.map((date, index) => (
                            <div key={index} className="trip-date-row">
                                <p className="trip-date">📅 {date}</p>
                                {/* delete specific date */}
                                <button
                                    className="btn-action btn-delete-date"
                                    onClick={() => onDelete(trip.trip_name, date)}
                                    title="Delete this date"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="trip-actions">
                <button 
                    className="btn-action btn-edit"
                    onClick={() => onEdit(trip)}
                    title="Edit trip"
                >
                    ✏️
                </button>
                {/* delete entire trip */}
                <button 
                    className="btn-action btn-delete"
                    onClick={() => onDelete(trip.trip_name, null)}
                    title="Delete entire trip"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

export default TripCard;