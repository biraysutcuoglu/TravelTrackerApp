"""
Test Template for FastAPI Trips Application

This file contains test stubs and templates.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from datetime import date
from main import app, validate_date_format


# Create a TestClient for making requests to the API
client = TestClient(app)

class TestExample:
    """Example test class to show you the pattern"""
    
    @patch('main.db')
    def test_get_all_trips_empty(self, mock_db):
        """
        Test that getting all trips returns empty list
        """
        # Arrange: Set up the mock
        mock_db.get_all_trips.return_value = []
        
        # Act: Make the request
        response = client.get('/trips/')
        
        # Assert: Check the result
        assert response.status_code == 200
        assert response.json() == []

class TestGetAllTrips:
    """Tests for GET /trips/ endpoint"""
    
    @patch('main.db')
    def test_get_all_trips_with_data(self, mock_db):
        """
        Test fetching all trips when database has trips
        """
        mock_db.get_all_trips.return_value = [('Paris', date(2026, 3, 15)), ('Tokyo', date(2026, 5, 20))]
        
        response = client.get('/trips/')
        trips = response.json()

        assert response.status_code == 200
        assert len(trips) == 2
        assert trips[0]['trip_name'] == 'Paris'
        assert trips[0]['date'] == '2026-03-15'
        assert trips[1]['trip_name'] == 'Tokyo'

class TestGetTripByName:
    """Tests for GET /trips/{trip_name} endpoint"""
    
    @patch('main.db')
    def test_get_existing_trip(self, mock_db):
        """
        Test fetching a trip that exists
        """
        mock_db.get_trip_by_name.return_value = ('Paris', date(2026, 3, 15))
        response = client.get('/trips/Paris')
        trip = response.json()
        
        assert response.status_code == 200
        assert trip['trip_name'] == 'Paris'
        assert trip['date'] == '2026-03-15'
    
    @patch('main.db')
    def test_get_nonexistent_trip(self, mock_db):
        """
        Test fetching a trip that doesn't exist
        """
        mock_db.get_trip_by_name.return_value = None
        response = client.get('/trips/Nonexistent')
        assert response.status_code == 404
        assert 'trip not found' in response.json()['detail']

class TestCreateTrip:
    """Tests for POST /trips/ endpoint"""
    
    @patch('main.db')
    def test_create_trip_with_valid_date(self, mock_db):
        """
        Test creating a trip with a valid date
        """
        mock_db.insert_to_db.return_value = None
        
        response = client.post('/trips/?trip_name=Paris&date_str=15.03.2026')
        trip = response.json()
        
        assert response.status_code == 200
        assert trip['trip_name'] == 'Paris'
        assert trip['date'] == '15.03.2026'
        
        mock_db.insert_to_db.assert_called_once()
        call_args = mock_db.insert_to_db.call_args
        assert call_args[0][0] == 'Paris'
        assert call_args[0][1] == date(2026, 3,15)
    
    @patch('main.db')
    def test_create_trip_without_date(self, mock_db):
        """
        Test creating a trip without a date (optional)
        """
        mock_db.insert_to_db.return_value = None
        response = client.post('/trips/?trip_name=tokyo')
        trip = response.json()
        
        assert response.status_code == 200
        assert trip['trip_name'] == 'Tokyo'
        mock_db.insert_to_db.assert_called_once()
        call_args = mock_db.insert_to_db.call_args
        assert call_args[0][0] == 'Tokyo'
        assert call_args[0][1] == None
    
    @patch('main.db')
    def test_create_trip_invalid_date_format(self, mock_db):
        """
        Test creating a trip with invalid date format
        """
        
        mock_db.insert_to_db.return_value = None
        response = client.post('/trips/?trip_name=NewYork&date_str=2026-03-15')
        
        assert response.status_code == 400
        # substring check 
        assert 'Invalid date' in response.json()['detail'] 
    
    @patch('main.db')
    def test_create_trip_nonexistent_date(self, mock_db):
        """
        Test creating a trip with a date that doesn't exist (e.g., Feb 31)
        """
        response = client.post('/trips/?trip_name=Ankara&date_str=31.02.2026')
        assert response.status_code == 400
        assert 'Invalid date' in response.json()['detail']
    
    @patch('main.db')
    def test_create_trip_name_capitalized(self, mock_db):
        """
        Test that trip names are automatically capitalized
        """
        response = client.post('/trips/?trip_name=paris')
        trip = response.json()
        assert trip['trip_name'] == 'Paris'

class TestUpdateTrip:
    """Tests for PUT /trips/{trip_name} endpoint"""
    
    @patch('main.db')
    def test_update_existing_trip(self, mock_db):
        """
        Test updating an existing trip
        
        TODO: You should:
        1. Mock db.get_all_trips to return [('Paris', date(2026, 3, 15))]
        2. Make PUT request to /trips/Paris with new date
        3. Assert status code 200
        4. Verify db.insert_to_db was called
        """
        mock_db.get_all_trips.return_value = [('Paris', date(2026, 3, 15))]
        response = client.put('/trips/Paris?trip_name=Paris&date_str=13.07.2025')
        
        assert response.status_code == 200
        mock_db.insert_to_db.assert_called_once()
        
        call_args = mock_db.insert_to_db.call_args
        assert call_args[0][0] == 'Paris'
        assert call_args[0][1] == date(2025, 7, 13)
    
    @patch('main.db')
    def test_update_trip_creates_if_not_exists(self, mock_db):
        """
        Test that PUT creates trip if it doesn't exist
        
        TODO: You should:
        1. Mock db.get_all_trips to return [] (empty)
        2. Make PUT request to /trips/NewTrip with date
        3. Assert status code 200
        4. Verify db.insert_to_db was called
        """
        pass
    
    @patch('main.db')
    def test_update_trip_invalid_date(self, mock_db):
        """
        Test updating a trip with invalid date
        
        TODO: You should:
        1. Mock db.get_all_trips appropriately
        2. Make PUT request with invalid date format
        3. Assert status code 400
        """
        pass


# ============================================================================
# TODO: Test DELETE /trips/{trip_name} (Delete trip)
# ============================================================================

class TestDeleteTrip:
    """Tests for DELETE /trips/{trip_name} endpoint"""
    
    @patch('main.db')
    def test_delete_existing_trip(self, mock_db):
        """
        Test deleting a trip that exists
        
        TODO: You should:
        1. Mock db.delete_trip_by_name to return 1 (1 row deleted)
        2. Make DELETE request to /trips/Paris
        3. Assert status code 200
        4. Assert response message says 'deleted'
        5. Verify db.delete_trip_by_name was called with 'Paris'
        """
        pass
    
    @patch('main.db')
    def test_delete_nonexistent_trip(self, mock_db):
        """
        Test deleting a trip that doesn't exist
        
        TODO: You should:
        1. Mock db.delete_trip_by_name to return 0 (0 rows deleted)
        2. Make DELETE request to /trips/Nonexistent
        3. Assert status code 404
        4. Assert error message says 'not found'
        """
        pass


# ============================================================================
# TODO: Test validate_date_format function
# ============================================================================

class TestValidateDateFormat:
    """Tests for the validate_date_format helper function"""
    
    def test_validate_valid_date(self):
        """
        Test that valid dates pass validation
        
        TODO: You should:
        1. Call validate_date_format('15.03.2026')
        2. Assert it doesn't raise an exception
        3. Try other valid dates like '01.01.2000' and '31.12.2099'
        """
        pass
    
    def test_validate_none_date(self):
        """
        Test that None (no date) passes validation
        
        TODO: You should:
        1. Call validate_date_format(None)
        2. Assert it doesn't raise an exception
        """
        pass
    
    def test_validate_wrong_format(self):
        """
        Test that wrong date format raises HTTPException
        
        TODO: You should:
        1. Use pytest.raises(HTTPException) to catch the exception
        2. Call validate_date_format('2026-03-15') (wrong format)
        3. Assert the exception status code is 400
        4. Assert the error message contains 'Invalid date format'
        """
        pass
    
    def test_validate_impossible_date(self):
        """
        Test that impossible dates raise HTTPException
        
        TODO: You should:
        1. Use pytest.raises(HTTPException)
        2. Call validate_date_format('31.02.2026')
        3. Assert status code 400
        4. Assert error message contains 'Invalid date'
        """
        pass


# ============================================================================
# TODO: Test Edge Cases
# ============================================================================

class TestEdgeCases:
    """Tests for edge cases and unusual inputs"""
    
    @patch('main.db')
    def test_trip_with_special_characters(self, mock_db):
        """
        Test creating a trip with special characters
        
        TODO: You should test trip names with:
        - Spaces: 'New York'
        - Numbers: 'Trip2026'
        - Hyphens: 'New-York'
        """
        pass
    
    @patch('main.db')
    def test_very_long_trip_name(self, mock_db):
        """
        Test creating a trip with a very long name
        
        TODO: You should:
        1. Create a trip name with 100+ characters
        2. Make POST request
        3. Assert it works (or fails gracefully)
        """
        pass
    
    @patch('main.db')  
    def test_trip_name_empty_string(self, mock_db):
        """
        Test creating a trip with empty name
        
        TODO: You should:
        1. Make POST request with trip_name=''
        2. Assert it fails appropriately
        """
        pass


# ============================================================================
# BONUS: Integration Tests (Test multiple operations together)
# ============================================================================

class TestIntegration:
    """Tests that combine multiple operations"""
    
    @patch('main.db')
    def test_create_list_and_delete_trip(self, mock_db):
        """
        Test the full workflow: create, list, delete
        
        TODO: You should:
        1. Create a trip with POST
        2. Get all trips with GET
        3. Delete the trip with DELETE
        4. Verify each step worked
        """
        pass
