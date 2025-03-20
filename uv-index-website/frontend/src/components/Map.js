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

// Component to handle map view changes
function MapViewHandler({ selectedLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      const { latitude, longitude } = selectedLocation;
      
      // Always invalidate the map size to ensure correct calculations after container resize
      map.invalidateSize();
      
      // Small delay to ensure the map has properly resized
      setTimeout(() => {
        // Use a consistent zoom level for better user experience
        const zoomLevel = 10;
        
        // Fly to the selected location with animation and zoom in
        map.flyTo([latitude, longitude], zoomLevel, {
          animate: true,
          duration: 1.5
        });
        
        // Close any open popups
        map.closePopup();
      }, 150);
    }
  }, [map, selectedLocation]);
  
  return null;
}

// Map Controls component (location and zoom buttons)
function MapControls({ onLocationFound }) {
  const [loading, setLoading] = useState(false);
  const map = useMap();

  const handleGetLocation = () => {
    setLoading(true);
    map.locate({ setView: true, maxZoom: 10 });
  };

  useEffect(() => {
    map.on('locationfound', (e) => {
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
        className="location-button" 
        onClick={handleGetLocation}
        disabled={loading}
        title="Use my current location"
      >
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        )}
      </button>
      {loading && <div className="loading-indicator">Getting your location...</div>}
    </div>
  );
}

// Button to reset map view to Australia
function ResetMapView({ hasSelectedLocation, onResetMap }) {
  const map = useMap();
  
  // Only show the button when a location is selected
  if (!hasSelectedLocation) return null;
  
  const handleResetView = () => {
    // Australia's center and default zoom
    const australiaCenter = [-25.2744, 133.7751];
    const defaultZoom = 4;
    
    // Fly to Australia view
    map.flyTo(australiaCenter, defaultZoom, {
      animate: true,
      duration: 1.5
    });
    
    // Call the callback to reset selected location
    if (onResetMap) {
      onResetMap();
    }
  };
  
  return (
    <button 
      className="reset-map-button" 
      onClick={handleResetView}
      title="View all Australia"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    </button>
  );
}

// Component to move zoom controls position
function ChangeZoomControlPosition() {
  const map = useMap();
  
  useEffect(() => {
    // Move zoom control to top left
    map.zoomControl.setPosition('topleft');
  }, [map]);
  
  return null;
}

const UVMap = ({ onUVDataSelected, selectedLocation, onResetMap }) => {
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

  // Check if we have a selected location
  const hasSelectedLocation = selectedLocation !== null;

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
        zoomControl={true}
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
        
        <MapControls onLocationFound={handleLocationFound} />
        <MapViewHandler selectedLocation={selectedLocation} />
        <ResetMapView 
          hasSelectedLocation={hasSelectedLocation} 
          onResetMap={onResetMap} 
        />
        <ChangeZoomControlPosition />
      </MapContainer>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default UVMap; 