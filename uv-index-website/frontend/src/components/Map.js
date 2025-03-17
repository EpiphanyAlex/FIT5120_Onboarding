import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import '../styles/Map.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Get UV index color class
const getUVColorClass = (uvIndex) => {
  if (uvIndex < 3) return 'uv-low';
  if (uvIndex < 6) return 'uv-moderate';
  if (uvIndex < 8) return 'uv-high';
  if (uvIndex < 11) return 'uv-very-high';
  return 'uv-extreme';
};

// Get UV index description
const getUVDescription = (uvIndex) => {
  if (uvIndex < 3) return 'Low';
  if (uvIndex < 6) return 'Moderate';
  if (uvIndex < 8) return 'High';
  if (uvIndex < 11) return 'Very High';
  return 'Extreme';
};

// Location marker component
function LocationMarker({ onLocationFound }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const map = useMap();

  const handleGetLocation = () => {
    setLoading(true);
    map.locate({ setView: true, maxZoom: 10 });
  };

  useEffect(() => {
    map.on('locationfound', (e) => {
      setPosition(e.latlng);
      setLoading(false);
      if (onLocationFound) {
        onLocationFound(e.latlng.lat, e.latlng.lng);
      }
    });

    map.on('locationerror', (e) => {
      console.error('Location error:', e.message);
      setLoading(false);
      alert('Unable to get your location. Please check your browser location permissions.');
    });

    return () => {
      map.off('locationfound');
      map.off('locationerror');
    };
  }, [map, onLocationFound]);

  return (
    <div className="map-controls">
      <button 
        className="map-button" 
        onClick={handleGetLocation}
        disabled={loading}
      >
        {loading ? 'Getting Location...' : 'Get My UV Index'}
      </button>
      {loading && <div className="loading-indicator">Getting your location...</div>}
    </div>
  );
}

const UVMap = ({ onUVDataSelected }) => {
  const [uvData, setUVData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mapRef = useRef(null);
  
  // Refresh interval (30 minutes = 1800000 milliseconds)
  const REFRESH_INTERVAL = 1800000;

  const fetchUVData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Getting UV data...');
      const data = await api.getAllUVIndices();
      console.log('Retrieved UV data:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setUVData(data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        console.error('Invalid or empty UV data format:', data);
        setError('Invalid UV data format. Please check API response.');
      }
    } catch (err) {
      console.error('Failed to get UV data:', err);
      setError('Unable to load UV data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load data on initial render
    fetchUVData();
    
    // Set up periodic refresh
    const refreshTimer = setInterval(() => {
      console.log('Refreshing UV data...');
      fetchUVData();
    }, REFRESH_INTERVAL);
    
    // Cleanup function
    return () => {
      clearInterval(refreshTimer);
    };
  }, [fetchUVData]);

  const handleLocationFound = async (lat, lng) => {
    try {
      setLoading(true);
      const data = await api.getUVIndexByCoordinates(lat, lng);
      if (onUVDataSelected) {
        onUVDataSelected(data);
      }
    } catch (err) {
      console.error('Failed to get UV data:', err);
      setError('Unable to load UV data for your location. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (data) => {
    if (onUVDataSelected) {
      onUVDataSelected(data);
    }
  };

  // Calculate Australia's geographic center
  const australiaCenter = [-25.2744, 133.7751];

  // Filter out Antarctic locations for better map view
  const filteredUVData = uvData.filter(location => 
    !location.state || location.state.toLowerCase() !== 'antarctic'
  );

  return (
    <div className="map-container">
      {loading && <div className="loading-indicator">Loading...</div>}
      
      <MapContainer 
        center={australiaCenter} 
        zoom={4} 
        className="map"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredUVData && filteredUVData.length > 0 ? filteredUVData.map((location, index) => {
          // Ensure valid coordinates
          if (!location.latitude || !location.longitude || 
              isNaN(location.latitude) || isNaN(location.longitude)) {
            console.warn('Invalid location data:', location);
            return null;
          }
          
          // Ensure UV index is a valid number
          const uvIndex = typeof location.uv_index === 'number' ? location.uv_index : 
                          parseFloat(location.uv_index) || 0;
          
          // Use city_id or city as the main name
          const cityName = location.city || location.city_id || 'Unknown';
          const stateName = location.state || '';
          const shortName = location.short_name ? `(${location.short_name})` : '';
          const timeInfo = location.time ? (location.date ? `${location.time}, ${location.date}` : location.time) : '';
          
          return (
            <Marker 
              key={`${cityName}-${index}`}
              position={[location.latitude, location.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(location)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <div className="popup-title">
                    {cityName} {shortName} {stateName ? `, ${stateName}` : ''}
                  </div>
                  <div>
                    UV Index: 
                    <span className={`uv-indicator ${getUVColorClass(uvIndex)}`}>
                      {uvIndex.toFixed(1)} ({getUVDescription(uvIndex)})
                    </span>
                  </div>
                  {timeInfo && <div>Updated: {timeInfo}</div>}
                  {location.status && <div>Status: {location.status}</div>}
                </div>
              </Popup>
            </Marker>
          );
        }) : (
          <div>No UV data available for the map</div>
        )}
        
        <LocationMarker onLocationFound={handleLocationFound} />
      </MapContainer>
      
      {error && <div className="error-message">{error}</div>}
      
      {lastUpdated && (
        <div className="last-updated">
          Data updated: {lastUpdated.toLocaleString()}
          <button onClick={fetchUVData} className="refresh-button" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UVMap; 