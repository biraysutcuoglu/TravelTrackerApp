import React, { useState, useEffect } from 'react';
import './TripForm.css';

function TripForm({ onSubmit, initialTrip, onCancel }) {
    const [tripName, setTripName] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (initialTrip) {
            setTripName(initialTrip.trip_name);
            // Convert YYYY-MM-DD to DD.MM.YYYY for display
            if (initialTrip.date && initialTrip.date !== 'None') {
                const dateParts = initialTrip.date.split('-');
                setDate(`${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`);
            } else {
                setDate('');
            }
        } else {
            setTripName('');
            setDate('');
        }
    }, [initialTrip]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tripName.trim()) {
            alert('Please enter a trip name');
            return;
        }
        onSubmit(tripName, date);
        setTripName('');
        setDate('');
    };

    const handleCancel = () => {
        setTripName('');
        setDate('');
        onCancel();
    };

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

            <div className="form-group">
                <label htmlFor="date">Date (DD.MM.YYYY)</label>
                <input
                    id="date"
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g., 15.03.2026"
                />
            </div>

            <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                    {initialTrip?.isEditing? '✏️ Update Trip' : '➕ Add Trip'}
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
