import React, { useState, useEffect } from 'react';
import './TripForm.css';

function TripForm({ onSubmit, initialTrip, onCancel }) {
    const [tripName, setTripName] = useState('');
    const [date, setDate] = useState('');
    const [selectedOldDate, setSelectedOldDate] = useState('');

    useEffect(() => {
        if (initialTrip) {
            setTripName(initialTrip.trip_name);

            // If editing and trip has multiple dates, don't preselect a date
            // User must pick which date to edit from the dropdown
            if (initialTrip.isEditing) {
                setDate('');
                setSelectedOldDate('');
            } else {
                // Adding a new trip prefilled with a name (e.g. from recommendations)
                setDate('');
            }
        } else {
            setTripName('');
            setDate('');
            setSelectedOldDate('');
        }
    }, [initialTrip]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tripName.trim()) {
            alert('Please enter a trip name');
            return;
        }
        // Pass selectedOldDate so backend knows which date entry to update
        onSubmit(tripName, date, selectedOldDate);
        setTripName('');
        setDate('');
        setSelectedOldDate('');
    };

    const handleCancel = () => {
        setTripName('');
        setDate('');
        setSelectedOldDate('')
        onCancel();
    };

    const isEditing = initialTrip?.isEditing;
    const hasDates = initialTrip?.dates && initialTrip.dates.length > 0;

    return (
        <form className="trip-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="tripName">Trip Name *</label>
                <input
                    id="tripName"
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g., Paris, Tokyo, New York"
                />
            </div>

            {/* Show date picker dropdown when editing a trip with multiple dates */}
            {isEditing && hasDates && (
                <div className="form-group">
                    <label htmlFor="oldDate">Select Date to Edit *</label>
                    <select
                        id="oldDate"
                        value={selectedOldDate}
                        onChange={(e) => setSelectedOldDate(e.target.value)}
                    >
                        <option value="">-- Select a date --</option>
                        {initialTrip.dates.map((d, index) => (
                            <option key={index} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                    {isEditing ? '✏️ Update Trip' : '➕ Add Trip'}
                </button>
                {initialTrip && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                    >
                        ✕ Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default TripForm;
