import React, { useState, useEffect } from 'react';
import './TripForm.css';

function TripForm({ onSubmit, initialTrip, onCancel }) {
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [destination, setDestinationName] = useState('');

    useEffect(() => {
        if (initialTrip) {
            setTripName(initialTrip.trip_name || '');
            setDestinationName(initialTrip.destination || '');
            // pre-fill with the entry's existing dates
            setStartDate(initialTrip.start_date || '');
            setEndDate(initialTrip.end_date || '');
        } else {
            setTripName('');
            setStartDate('');
            setEndDate('');
            setDestinationName('');
        }
    }, [initialTrip]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tripName.trim()) {
            alert('Please enter a trip name');
            return;
        }
        onSubmit(tripName, startDate, endDate, destination);
        setTripName('');
        setStartDate('');
        setEndDate('');
        setDestinationName('');
    };

    const handleCancel = () => {
        setTripName('');
        setStartDate('');
        setEndDate('');
        setDestinationName('');
        onCancel();
    };

    const isEditing = initialTrip?.isEditing;

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
                <label htmlFor="startDate">Start Date</label>
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                    id="destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestinationName(e.target.value)}
                    placeholder="e.g., Paris, Tokyo, New York"
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