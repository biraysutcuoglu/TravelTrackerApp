import React from 'react';
import TripCard from './TripCard';
import './TripList.css';

function TripList({ trips, onDelete, onEdit, onPlanItinerary }) {
    return (
        <div className="trip-list">
            {trips.map((trip, index) => (
                <TripCard
                    key={trip.trip_name}
                    trip={trip}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onPlanItinerary={onPlanItinerary}
                />
            ))}
        </div>
    );
}

export default TripList;
