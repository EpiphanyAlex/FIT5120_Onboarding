from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import xmltodict
import json
import time
import traceback
import logging

from models.city import City
from mock_data import MOCK_UV_DATA
from city_mapping import (
    get_all_city_info,
    get_city_info_by_id,
    get_city_info_by_short_name,
    find_city_info_by_name
)
from recommandation import recommend_uv

app = Flask(__name__)
CORS(app)

# ---------------------------------------
# Config: 5-minute cache
# ---------------------------------------
class Config:
    UV_DATA_URL = "https://uvdata.arpansa.gov.au/xml/uvvalues.xml"
    UV_DATA_CACHE_TIME = 300  # 300 seconds = 5 minutes

# Global variables for caching
uv_data_cache = {
    'data': None,
    'timestamp': 0,
    'raw_xml': None
}

# Logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/api/recommend_uv', methods=['GET'])
def get_recommendation():
    skin_type = request.args.get('skin_type', default='1')
    try:
        summary = recommend_uv(skin_type)
        return jsonify({"recommendation": summary})
    except Exception as e:
        logger.error(f"Error generating recommendation: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def get_uv_data():
    """
    Fetch UV data from ARPANSA (XML), but only once every 5 minutes.
    If we already fetched data in the last 5 minutes, return the cached copy.
    """
    current_time = time.time()

    # Check if we have data cached and it's still "fresh" (< 5 minutes old)
    if uv_data_cache['data'] and (current_time - uv_data_cache['timestamp']) < Config.UV_DATA_CACHE_TIME:
        return uv_data_cache['data']
    
    # Otherwise, fetch from ARPANSA
    try:
        print(f"Fetching fresh data from: {Config.UV_DATA_URL}")
        response = requests.get(Config.UV_DATA_URL)
        response.raise_for_status()

        xml_content = response.text
        xml_content = response.content.decode('utf-8-sig', errors='replace')
        data = xmltodict.parse(xml_content)

        data = xmltodict.parse(xml_content)

        # Update cache with new data and timestamp
        uv_data_cache['data'] = data
        uv_data_cache['timestamp'] = current_time
        uv_data_cache['raw_xml'] = xml_content

        print("Successfully fetched and parsed ARPANSA UV data.")

        return data
    except Exception as e:
        logger.error(f"Error getting UV data: {traceback.format_exc()}")
        # If we have old data cached, return that instead of failing
        if uv_data_cache['data']:
            print("Returning expired cache because ARPANSA fetch failed.")
            return uv_data_cache['data']
        # Otherwise, fallback to mock data
        print("Using mock UV data (no cached data available).")
        return MOCK_UV_DATA

def find_city_uv_index(city_name):
    """Find UV index for a specific city using the cached or freshly fetched ARPANSA data."""
    uv_data = get_uv_data()
    if not uv_data:
        print("Unable to get UV data (none returned).")
        return None

    try:
        print(f"Looking for UV index for city '{city_name}'")
        city_info = find_city_info_by_name(city_name)
        city_id = city_info["id"] if city_info else None
        short_name = city_info["short_name"] if city_info else None

        locations = uv_data.get('stations', {}).get('location', [])
        if not isinstance(locations, list):
            locations = [locations]

        print(f"Found {len(locations)} station(s) in the ARPANSA feed.")

        # 1) Exact match by city_id
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

        # 2) Match by short_name
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

        # 3) Fuzzy matching: city_name in location_id
        for location in locations:
            location_id = location.get('@id', '')
            if city_name.lower() in location_id.lower() or location_id.lower() in city_name.lower():
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
    """No DB in use, so just return a placeholder message."""
    return jsonify({"message": "City database is not available."})

@app.route('/api/cities/search', methods=['GET'])
def search_cities():
    """No DB in use, so just return a placeholder message."""
    name = request.args.get('name', '')
    if not name:
        return jsonify([])
    return jsonify({"message": "City search is not available without a database."})

@app.route('/api/uv-index', methods=['GET'])
def get_uv_index():
    """
    Get entire UV index data from ARPANSA feed, returning a list of locations.
    Each location has fields like city, uv_index, time, date, etc.
    """
    try:
        uv_data = get_uv_data()
        if not uv_data:
            return jsonify({'error': 'Unable to get UV data'}), 500

        locations = uv_data.get('stations', {}).get('location', [])
        if not isinstance(locations, list):
            locations = [locations]

        print(f"Found {len(locations)} location records in ARPANSA feed.")
        
        
        result = []
        for location in locations:
            try:
                city_id = location.get('@id', '')
                short_name = location.get('name', '')
                # Attempt city info from mapping
                city_info = get_city_info_by_id(city_id)
                if not city_info and short_name:
                    city_info = get_city_info_by_short_name(short_name)
                if not city_info:
                    city_info = {
                        "id": city_id,
                        "name": city_id or "Unknown City",
                        "short_name": short_name,
                        "state": "Unknown",
                        "latitude": 0,
                        "longitude": 0
                    }

                uv_value = float(location.get('index', 0))
                time_value = location.get('time', '')
                date_value = location.get('date', '')
                status_value = location.get('status', '')

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
                print(f"Error processing location: {e}, data: {location}")
                continue

        print(f"Successfully processed {len(result)} location record(s).")
        return jsonify(result)
    except Exception as e:
        print(f"Error getting UV index: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/uv-index/postcode/<postcode>', methods=['GET'])
def get_uv_index_by_postcode(postcode):
    """No DB in use, so can't do a real postcode lookup."""
    return jsonify({"message": "UV index by postcode is not available without a city database."})

@app.route('/api/uv-index/coordinates', methods=['GET'])
def get_uv_index_by_coordinates():
    """Get UV index for the nearest city by lat/lng coords."""
    try:
        try:
            latitude = float(request.args.get('lat'))
            longitude = float(request.args.get('lng'))
        except:
            return jsonify({'error': 'Invalid coordinates'}), 400

        uv_data = get_uv_data()
        if not uv_data:
            return jsonify({'error': 'Unable to get UV data'}), 500

        all_cities = get_all_city_info()
        closest_city = None
        min_distance = float('inf')

        for city_info in all_cities:
            try:
                city_lat = city_info['latitude']
                city_lng = city_info['longitude']
                distance = ((latitude - city_lat) ** 2 + (longitude - city_lng) ** 2) ** 0.5
                if distance < min_distance:
                    min_distance = distance
                    closest_city = city_info
            except:
                continue

        if not closest_city:
            return jsonify({'error': 'No nearby city found'}), 404

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
            return jsonify({'error': f"No UV index data found for {closest_city['name']}"}), 404

        return jsonify(uv_info)
    except Exception as e:
        print(f"Error getting UV index by coordinates: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Preload UV data at startup (this will fetch once)
    try:
        print("Preloading UV data at application startup...")
        get_uv_data()
    except Exception as e:
        print(f"Failed to preload UV data: {e}")
    
    app.run(debug=True)
