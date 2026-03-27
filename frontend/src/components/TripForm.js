import React, { useState, useEffect } from 'react';
import './TripForm.css';

function TripForm({ onSubmit, initialTrip, onCancel }) {
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [destination, setDestinationName] = useState('');
    const [selectedOldStartDate, setSelectedOldStartDate] = useState('');
    const [selectedOldEndDate, setSelectedOldEndDate] = useState('');

    useEffect(() => {
        if (initialTrip) {
            setTripName(initialTrip.trip_name || '');
            setDestinationName(initialTrip.destination || '');

            if (initialTrip.isEditing) {
                setStartDate('');
                setEndDate('');
                setSelectedOldStartDate('');
                setSelectedOldEndDate('');
            }
        } else {
            setTripName('');
            setStartDate('');
            setEndDate('');
            setDestinationName('');
            setSelectedOldStartDate('');
            setSelectedOldEndDate('');
        }
    }, [initialTrip]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tripName.trim()) {
            alert('Please enter a trip name');
            return;
        }
        // Pass selectedOldDate so backend knows which date entry to update
        onSubmit(tripName, startDate, endDate, destination, selectedOldStartDate, selectedOldEndDate);
        setTripName('');
        setStartDate('');
        setSelectedOldStartDate('');
    };

    const handleCancel = () => {
        setTripName('');
        setStartDate('');
        setEndDate('');
        setSelectedOldStartDate('');
        setSelectedOldEndDate('');
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
                        id="oldStartDate"
                        value={selectedOldStartDate}
                        onChange={(e) => setSelectedOldStartDate(e.target.value)}
                    >
                        <option value="">-- Select a date --</option>
                        {initialTrip.dates.map((d, index) => (
                            <option key={index} value={d}>{d}</option>
                        ))}
                    </select>
                    <select
                        id="oldEndDate"
                        value={selectedOldEndDate}
                        onChange={(e) => setSelectedOldEndDate(e.target.value)}
                    >
                        <option value="">-- Select a date --</option>
                        {initialTrip.dates.map((d, index) => (
                            <option key={index} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="end_date">End Date</label>
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
