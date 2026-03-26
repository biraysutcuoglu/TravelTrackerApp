# 📝 Test Template Guide

I've created `test_template.py` with test stubs for you to fill in!

## How to Use the Template

1. Open `test_template.py`
2. Each `pass` statement is where you write your test code
3. Follow the TODO comments for what to test
4. Look at the `TestExample` class to see a complete example

## Key Testing Patterns

### Pattern 1: Mock the Database
```python
@patch('main.db')
def test_something(self, mock_db):
    # Mock returns a list of trips
    mock_db.get_all_trips.return_value = [('Paris', date(2026, 3, 15))]
    
    # Make API request
    response = client.get('/trips/')
    
    # Assert response
    assert response.status_code == 200
```

### Pattern 2: Make API Requests
```python
# GET request
response = client.get('/trips/')

# POST request
response = client.post('/trips/?trip_name=Paris&date_str=15.03.2026')

# PUT request
response = client.put('/trips/Paris?trip_name=Paris&date_str=20.05.2026')

# DELETE request
response = client.delete('/trips/Paris')
```

### Pattern 3: Check Status Codes
```python
assert response.status_code == 200      # Success
assert response.status_code == 400      # Bad request
assert response.status_code == 404      # Not found
```

### Pattern 4: Check Response Content
```python
data = response.json()
assert data['trip_name'] == 'Paris'
assert data['date'] == '2026-03-15'
assert len(data) == 2
```

### Pattern 5: Test Exceptions (for validate_date_format)
```python
from fastapi import HTTPException

def test_invalid_date():
    with pytest.raises(HTTPException) as exc_info:
        validate_date_format('invalid-date')
    
    assert exc_info.value.status_code == 400
    assert 'Invalid date format' in exc_info.value.detail
```

### Pattern 6: Verify Mock Was Called
```python
# Was it called at all?
mock_db.insert_to_db.assert_called_once()

# Was it called with specific arguments?
mock_db.delete_trip_by_name.assert_called_with('Paris')

# How many times was it called?
assert mock_db.insert_to_db.call_count == 1
```

## Running Your Tests

```bash
# Run all tests
pytest test_template.py -v

# Run one test class
pytest test_template.py::TestGetAllTrips -v

# Run one test
pytest test_template.py::TestGetAllTrips::test_get_all_trips_with_data -v

# See coverage
pytest test_template.py --cov=main
```

## What Each Test Should Do

### TestGetAllTrips
- Should handle empty list
- Should handle list with multiple trips 

### TestGetTripByName
- Should return trip when it exists
- Should return error when it doesn't exist

### TestCreateTrip
- Should create trip with valid date
- Should create trip without date
- Should reject invalid date format
- Should reject impossible date (like Feb 31)
- Should capitalize trip name

### TestUpdateTrip
- Should update existing trip
- Should create if doesn't exist
- Should reject invalid date

### TestDeleteTrip
- Should delete existing trip
- Should fail if trip not found

### TestValidateDateFormat
- Should accept valid dates
- Should accept None
- Should reject wrong format
- Should reject impossible dates

## Tips

✅ Fill in one test at a time
✅ Run that test to make sure it passes
✅ Then move to the next one
✅ The TODO comments guide you on what to test

Good luck! 🚀
