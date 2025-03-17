"""
City mapping module for UV index website.
Maps city IDs to city information including coordinates.
"""

# City mapping dictionary
# Maps city IDs to city information
CITY_MAPPING = {
    "Adelaide": {
        "id": "Adelaide",
        "name": "Adelaide",
        "short_name": "adl",
        "state": "SA",
        "latitude": -34.9285,
        "longitude": 138.6007
    },
    "Alice Springs": {
        "id": "Alice Springs",
        "name": "Alice Springs",
        "short_name": "ali",
        "state": "NT",
        "latitude": -23.6980,
        "longitude": 133.8807
    },
    "Brisbane": {
        "id": "Brisbane",
        "name": "Brisbane",
        "short_name": "bri",
        "state": "QLD",
        "latitude": -27.4698,
        "longitude": 153.0251
    },
    "Cairns": {
        "id": "Cairns",
        "name": "Cairns",
        "short_name": "cns",
        "state": "QLD",
        "latitude": -16.9186,
        "longitude": 145.7781
    },
    "Canberra": {
        "id": "Canberra",
        "name": "Canberra",
        "short_name": "can",
        "state": "ACT",
        "latitude": -35.2809,
        "longitude": 149.1300
    },
    "Casey": {
        "id": "Casey",
        "name": "Casey",
        "short_name": "cas",
        "state": "Antarctic",
        "latitude": -66.2821,
        "longitude": 110.5284
    },
    "Darwin": {
        "id": "Darwin",
        "name": "Darwin",
        "short_name": "dar",
        "state": "NT",
        "latitude": -12.4634,
        "longitude": 130.8456
    },
    "Davis": {
        "id": "Davis",
        "name": "Davis",
        "short_name": "dav",
        "state": "Antarctic",
        "latitude": -68.5764,
        "longitude": 77.9689
    },
    "Emerald": {
        "id": "Emerald",
        "name": "Emerald",
        "short_name": "emd",
        "state": "QLD",
        "latitude": -23.5275,
        "longitude": 148.1549
    },
    "Gold Coast": {
        "id": "Gold Coast",
        "name": "Gold Coast",
        "short_name": "gco",
        "state": "QLD",
        "latitude": -28.0167,
        "longitude": 153.4000
    },
    "Hobart": {
        "id": "Hobart",
        "name": "Hobart",
        "short_name": "hba",
        "state": "TAS",
        "latitude": -42.8821,
        "longitude": 147.3272
    },
    "Kingston": {
        "id": "Kingston",
        "name": "Kingston",
        "short_name": "kin",
        "state": "Norfolk Island",
        "latitude": -29.0544,
        "longitude": 167.9578
    },
    "Macquarie Island": {
        "id": "Macquarie Island",
        "name": "Macquarie Island",
        "short_name": "mcq",
        "state": "TAS",
        "latitude": -54.6167,
        "longitude": 158.8500
    },
    "Mawson": {
        "id": "Mawson",
        "name": "Mawson",
        "short_name": "maw",
        "state": "Antarctic",
        "latitude": -67.6000,
        "longitude": 62.8833
    },
    "Melbourne": {
        "id": "Melbourne",
        "name": "Melbourne",
        "short_name": "mel",
        "state": "VIC",
        "latitude": -37.8136,
        "longitude": 144.9631
    },
    "Newcastle": {
        "id": "Newcastle",
        "name": "Newcastle",
        "short_name": "new",
        "state": "NSW",
        "latitude": -32.9283,
        "longitude": 151.7817
    },
    "Perth": {
        "id": "Perth",
        "name": "Perth",
        "short_name": "per",
        "state": "WA",
        "latitude": -31.9505,
        "longitude": 115.8605
    },
    "Sydney": {
        "id": "Sydney",
        "name": "Sydney",
        "short_name": "syd",
        "state": "NSW",
        "latitude": -33.8688,
        "longitude": 151.2093
    },
    "Townsville": {
        "id": "Townsville",
        "name": "Townsville",
        "short_name": "tow",
        "state": "QLD",
        "latitude": -19.2590,
        "longitude": 146.8169
    }
}

# Additional mappings for short names and alternate names
SHORT_NAME_MAPPING = {
    "adl": "Adelaide",
    "ali": "Alice Springs",
    "bri": "Brisbane",
    "can": "Canberra",
    "cas": "Casey",
    "dar": "Darwin",
    "dav": "Davis",
    "emd": "Emerald",
    "gco": "Gold Coast",
    "kin": "Kingston",
    "mcq": "Macquarie Island",
    "maw": "Mawson",
    "mel": "Melbourne",
    "new": "Newcastle",
    "per": "Perth",
    "syd": "Sydney",
    "tow": "Townsville"
}

# Alternate name mappings
ALTERNATE_NAME_MAPPING = {
    "goldcoast": "Gold Coast",
    "alicesprings": "Alice Springs",
    "macquarieisland": "Macquarie Island"
}

def get_all_city_info():
    """Get all city information"""
    return list(CITY_MAPPING.values())

def get_city_info_by_id(city_id):
    """Get city information by ID"""
    return CITY_MAPPING.get(city_id)

def get_city_info_by_short_name(short_name):
    """Get city information by short name"""
    if not short_name:
        return None
        
    # Try direct lookup
    city_id = SHORT_NAME_MAPPING.get(short_name.lower())
    if city_id:
        return CITY_MAPPING.get(city_id)
    
    # Try to find in CITY_MAPPING
    for city_id, city_info in CITY_MAPPING.items():
        if city_info.get("short_name", "").lower() == short_name.lower():
            return city_info
    
    return None

def find_city_info_by_name(name):
    """Find city information by name using various matching methods"""
    if not name:
        return None
    
    # Normalize name
    normalized_name = name.lower().replace(" ", "")
    
    # Try direct lookup
    if name in CITY_MAPPING:
        return CITY_MAPPING[name]
    
    # Try alternate name mapping
    if normalized_name in ALTERNATE_NAME_MAPPING:
        city_id = ALTERNATE_NAME_MAPPING[normalized_name]
        return CITY_MAPPING.get(city_id)
    
    # Try short name mapping
    if name.lower() in SHORT_NAME_MAPPING:
        city_id = SHORT_NAME_MAPPING[name.lower()]
        return CITY_MAPPING.get(city_id)
    
    # Try fuzzy matching
    for city_id, city_info in CITY_MAPPING.items():
        if (name.lower() in city_id.lower() or 
            city_id.lower() in name.lower() or
            name.lower() in city_info["name"].lower() or
            city_info["name"].lower() in name.lower()):
            return city_info
    
    return None 