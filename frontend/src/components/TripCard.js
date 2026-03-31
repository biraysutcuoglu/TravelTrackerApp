import React from 'react';
import './TripCard.css';

function TripCard({ trip, onDelete, onEdit, onPlanItinerary }) {
    const hasEntries = trip.entries && trip.entries.length > 0;

    const computeDays = (start, end) => {
        if (!start || !end) return null;
        const s = new Date(start);
        const e = new Date(end);
        const msPerDay = 24 * 60 * 60 * 1000;
        const diff = Math.round((e - s) / msPerDay) + 1; // inclusive
        return diff > 0 ? diff : null;
    };

    return (
        <div className="trip-card">
            <div className="trip-info">
                <div className="trip-header">
                    <h3>{trip.trip_name}</h3>
                    <button
                        className="btn-action btn-delete"
                        onClick={() => onDelete(trip.trip_name, null)}
                        title="Delete entire trip"
                    >
                        🗑️
                    </button>
                </div>
                {hasEntries && (
                    <div className="trip-dates">
                        {trip.entries.map((entry, index) => (
                            <div key={index} className="trip-date-row">
                                <div className="trip-entry-info">
                                    <p className="trip-destination">📍 {entry.destination}</p>
                                    <p className="trip-date">📅 {entry.start_date} → {entry.end_date}</p>
                                </div>
                                <div className="entry-actions">
                                    <button
                                        className="btn-action btn-edit"
                                        onClick={() => onEdit(trip.trip_name, entry)}
                                        title="Edit this entry"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-action btn-delete-date"
                                        onClick={() => onDelete(trip.trip_name, entry)}
                                        title="Delete this entry"
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        className="btn-action btn-plan-itinerary"
                                        onClick={() => onPlanItinerary(trip.trip_name, entry, computeDays(entry.start_date, entry.end_date))}
                                        title="Plan itinerary"
                                    >
                                        🗒️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TripCard;