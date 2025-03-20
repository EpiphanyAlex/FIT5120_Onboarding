from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import xmltodict
import json
import time
import traceback
from database import Database
from models.city import City
from config import Config
from mock_data import MOCK_UV_DATA
from city_mapping import CITY_MAPPING, get_all_city_info, get_city_info_by_id, get_city_info_by_short_name, find_city_info_by_name

app = Flask(__name__)
CORS(app)

# Global variables
db = Database()
uv_data_cache = {
    'data': None,
    'timestamp': 0,
    'raw_xml': None
}

# Enable detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_uv_data():
    """Get UV data with caching"""
    current_time = time.time()
    
    # If cache is valid, return cached data
    if uv_data_cache['data'] and current_time - uv_data_cache['timestamp'] < Config.UV_DATA_CACHE_TIME:
        return uv_data_cache['data']
    
    try:
        # Get XML data
        print("Getting UV data from:", Config.UV_DATA_URL)
        response = requests.get(Config.UV_DATA_URL)
        response.raise_for_status()
        
        # Save raw XML content
        xml_content = response.text
        
        # Log first 500 characters of XML content for debugging
        logger.debug(f"XML response content (first 500 chars): {xml_content[:500]}...")
        
        # Convert XML to Python dictionary
        data = xmltodict.parse(xml_content)
        
        print("Successfully parsed XML data")
        logger.debug(f"Parsed data structure: {json.dumps(data, indent=2)[:500]}...")
        
        # Update cache
        uv_data_cache['data'] = data
        uv_data_cache['timestamp'] = current_time
        uv_data_cache['raw_xml'] = xml_content
        
        return data
    except Exception as e:
        print(f"Error getting UV data: {e}")
        logger.error(f"Error getting UV data: {traceback.format_exc()}")
        
        # If cache exists, return expired cache
        if uv_data_cache['data']:
            return uv_data_cache['data']
            
        # If no cache, use mock data
        print("Using mock UV data...")
        return MOCK_UV_DATA

def find_city_uv_index(city_name):
    """Find UV index for a specific city in UV data"""
    uv_data = get_uv_data()
    if not uv_data:
        print("Unable to get UV data")
        return None
    
    try:
        # Print debug info
        print(f"Looking for UV index for city '{city_name}'")
        
        # Try to find city mapping by name first
        city_info = find_city_info_by_name(city_name)
        city_id = city_info["id"] if city_info else None
        short_name = city_info["short_name"] if city_info else None
        
        # Get all locations
        locations = uv_data.get('stations', {}).get('location', [])
        if not isinstance(locations, list):
            locations = [locations]
            
        print(f"Found {len(locations)} stations")
        
        # First try to find exact match by city_id
        if city_id:
            for location in locations:
                if location.get('@id', '') == city_id:
                    try:
                        uv_value = float(location.get('index', 0))
                        
                        return {
                            'city': city_info['name'],
                            'city_id': city_id,
                            'short_name': short_name,
                            'state': city_info['state'],
                            'uv_index': uv_value,
                            'time': location.get('time', ''),
                            'date': location.get('date', ''),
                            'latitude': city_info['latitude'],
                            'longitude': city_info['longitude'],
                            'status': location.get('status', '')
                        }
                    except (ValueError, TypeError) as e:
                        print(f"Error parsing UV value: {e}")
                        continue
        
        # Then try to find by short_name
        if short_name:
            for location in locations:
                if location.get('name', '').lower() == short_name.lower():
                    try:
                        uv_value = float(location.get('index', 0))
                        
                        return {
                            'city': city_info['name'],
                            'city_id': city_id,
                            'short_name': short_name,
                            'state': city_info['state'],
                            'uv_index': uv_value,
                            'time': location.get('time', ''),
                            'date': location.get('date', ''),
                            'latitude': city_info['latitude'],
                            'longitude': city_info['longitude'],
                            'status': location.get('status', '')
                        }
                    except (ValueError, TypeError) as e:
                        print(f"Error parsing UV value: {e}")
                        continue
        
        # Finally try fuzzy matching
        for location in locations:
            location_id = location.get('@id', '')
            if city_name.lower() in location_id.lower() or location_id.lower() in city_name.lower():
                # Get city info
                match_city_info = get_city_info_by_id(location_id)
                if not match_city_info:
                    continue
                
                try:
                    uv_value = float(location.get('index', 0))
                    
                    return {
                        'city': match_city_info['name'],
                        'city_id': location_id,
                        'short_name': location.get('name', ''),
                        'state': match_city_info['state'],
                        'uv_index': uv_value,
                        'time': location.get('time', ''),
                        'date': location.get('date', ''),
                        'latitude': match_city_info['latitude'],
                        'longitude': match_city_info['longitude'],
                        'status': location.get('status', '')
                    }
                except (ValueError, TypeError) as e:
                    print(f"Error parsing UV value: {e}")
                    continue
        
        print(f"No match found for city '{city_name}'")
        return None
    except Exception as e:
        print(f"Error finding city UV index: {e}")
        return None

@app.route('/api/cities', methods=['GET'])
def get_cities():
    """Get all cities"""
    try:
        cities = db.get_all_cities()
        return jsonify([City.from_db_row(city).to_dict() for city in cities])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cities/search', methods=['GET'])
def search_cities():
    """Search cities"""
    name = request.args.get('name', '')
    if not name:
        return jsonify([])
    
    try:
        cities = db.find_cities_by_name(name)
        return jsonify([City.from_db_row(city).to_dict() for city in cities])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/uv-index', methods=['GET'])
def get_uv_index():
    """Get UV index data"""
    try:
        uv_data = get_uv_data()
        if not uv_data:
            return jsonify({'error': 'Unable to get UV data'}), 500
        
        # Extract UV index for all locations
        locations = uv_data.get('stations', {}).get('location', [])
        if not isinstance(locations, list):
            locations = [locations]
        
        print(f"Found {len(locations)} location records")
        
        result = []
        for location in locations:
            try:
                # Get city ID and short name
                city_id = location.get('@id', '')
                short_name = location.get('name', '')
                
                # Get city info from mapping
                city_info = get_city_info_by_id(city_id)
                
                if not city_info:
                    print(f"City ID '{city_id}' has no mapping, trying to find by short name...")
                    # Try to find by short name
                    if short_name:
                        city_info = get_city_info_by_short_name(short_name)
                    
                    # If still not found, create basic info
                    if not city_info:
                        print(f"Cannot find city info, using basic info: {city_id}, {short_name}")
                        city_info = {
                            "id": city_id,
                            "name": city_id or "Unknown City",
                            "short_name": short_name,
                            "state": "Unknown",
                            "latitude": 0,
                            "longitude": 0
                        }
                
                # Get UV index value
                uv_value = 0
                try:
                    uv_value = float(location.get('index', 0))
                except (ValueError, TypeError) as e:
                    print(f"Error parsing UV index value: {e}")
                    continue
                
                # Get time, date and status
                time_value = location.get('time', '')
                date_value = location.get('date', '')
                status_value = location.get('status', '')
                
                # Skip if status is not OK (optional)
                if status_value and status_value.lower() != 'ok':
                    print(f"City {city_id} status is not OK: {status_value}")
                    # You can choose to skip or continue based on requirements
                    # continue
                
                # Add to result list
                result.append({
                    'city': city_info['name'],
                    'city_id': city_id,
                    'short_name': short_name,
                    'state': city_info['state'],
                    'uv_index': uv_value,
                    'time': time_value,
                    'date': date_value,
                    'latitude': city_info['latitude'],
                    'longitude': city_info['longitude'],
                    'status': status_value
                })
            except Exception as e:
                # Skip data with unexpected format
                print(f"Error processing location: {e}, data: {location}")
                continue
        
        print(f"Successfully processed {len(result)} location data")
        return jsonify(result)
    except Exception as e:
        print(f"Error getting UV index: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/uv-index/postcode/<postcode>', methods=['GET'])
def get_uv_index_by_postcode(postcode):
    """Get UV index by postcode"""
    try:
        city = db.get_city_by_postcode(postcode)
        if not city:
            return jsonify({'error': f'No city found for postcode {postcode}'}), 404
        
        city_obj = City.from_db_row(city)
        
        # Query real-time UV data
        uv_data = get_uv_data()
        if not uv_data:
            return jsonify({'error': 'Unable to get UV data'}), 500
        
        # Get city name - handle Melbourne and Sydney suburbs
        city_name = city_obj.name
        main_city = city_name
        
        # If city name contains Melbourne or Sydney suburbs, use main city name
        if "Melbourne" in city_name or city_obj.state == "VIC" and city_obj.postcode.startswith("3"):
            main_city = "Melbourne"
        elif "Sydney" in city_name or city_obj.state == "NSW" and city_obj.postcode.startswith("20"):
            main_city = "Sydney"
        
        # Find UV index
        locations = uv_data.get('stations', {}).get('location', [])
        if not isinstance(locations, list):
            locations = [locations]
        
        # Try to find by city ID
        uv_info = None
        for location in locations:
            if location.get('@id', '') == main_city:
                # Get city info
                city_info = get_city_info_by_id(main_city)
                if not city_info:
                    continue
                
                try:
                    uv_value = float(location.get('index', 0))
                except (ValueError, TypeError):
                    continue
                
                uv_info = {
                    'city': city_info['name'],
                    'city_id': main_city,
                    'state': city_info['state'],
                    'uv_index': uv_value,
                    'time': location.get('time', ''),
                    'date': location.get('date', ''),
                    'latitude': city_info['latitude'],
                    'longitude': city_info['longitude']
                }
                break
        
        if not uv_info:
            return jsonify({
                'city': city_obj.to_dict(),
                'uv_index': None,
                'message': f'No UV index data found for {main_city}'
            })
        
        return jsonify({
            'city': city_obj.to_dict(),
            'uv_index': uv_info,
            'original_query': {
                'postcode': postcode
            }
        })
    except Exception as e:
        print(f"Error getting UV index by postcode: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/uv-index/coordinates', methods=['GET'])
def get_uv_index_by_coordinates():
    """Get UV index for nearest city by coordinates"""
    try:
        try:
            latitude = float(request.args.get('lat'))
            longitude = float(request.args.get('lng'))
        except:
            return jsonify({'error': 'Invalid coordinates'}), 400
        
        # Get real-time UV data
        uv_data = get_uv_data()
        if not uv_data:
            return jsonify({'error': 'Unable to get UV data'}), 500
        
        # Get all city info
        all_cities = get_all_city_info()
        
        # Find nearest city
        closest_city = None
        min_distance = float('inf')
        
        for city_info in all_cities:
            try:
                city_lat = city_info['latitude']
                city_lng = city_info['longitude']
                
                # Calculate simple Euclidean distance (not exact Earth distance, but sufficient to find nearest station)
                distance = ((latitude - city_lat) ** 2 + (longitude - city_lng) ** 2) ** 0.5
                
                if distance < min_distance:
                    min_distance = distance
                    closest_city = city_info
            except:
                continue
        
        if not closest_city:
            return jsonify({'error': 'No nearby city found'}), 404
        
        # Find corresponding UV index data
        locations = uv_data.get('stations', {}).get('location', [])
        if not isinstance(locations, list):
            locations = [locations]
        
        uv_info = None
        for location in locations:
            if location.get('@id', '') == closest_city['id']:
                try:
                    uv_value = float(location.get('index', 0))
                except (ValueError, TypeError):
                    continue
                
                uv_info = {
                    'city': closest_city['name'],
                    'city_id': closest_city['id'],
                    'state': closest_city['state'],
                    'uv_index': uv_value,
                    'time': location.get('time', ''),
                    'date': location.get('date', ''),
                    'latitude': closest_city['latitude'],
                    'longitude': closest_city['longitude'],
                    'distance': min_distance
                }
                break
        
        if not uv_info:
            return jsonify({'error': f'No UV index data found for {closest_city["name"]}'}), 404
        
        return jsonify(uv_info)
    except Exception as e:
        print(f"Error getting UV index by coordinates: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Preload data at startup to check XML structure
    try:
        print("Preloading UV data at application startup...")
        get_uv_data()
    except Exception as e:
        print(f"Failed to preload UV data: {e}")
    
    app.run(debug=True) 