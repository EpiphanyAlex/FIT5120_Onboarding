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
      }, 150);
    }
  }, [map, selectedLocation]);
  
  return null;
}

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
    <div className="map-controls locate-control">
      <button 
        className="map-button location-button" 
        onClick={handleGetLocation}
        disabled={loading}
        title="Get my location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a.5.5 0 0 1 .5.5v.518A7 7 0 0 1 14.982 7.5h.518a.5.5 0 0 1 0 1h-.518A7 7 0 0 1 8.5 14.982v.518a.5.5 0 0 1-1 0v-.518A7 7 0 0 1 1.018 8.5H.5a.5.5 0 0 1 0-1h.518A7 7 0 0 1 7.5 1.018V.5A.5.5 0 0 1 8 0zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z"/>
          <path d="M8 4a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 1 0v-7A.5.5 0 0 0 8 4z"/>
        </svg>
      </button>
      {loading && <div className="loading-indicator">Getting your location...</div>}
    </div>
  );
}

// Return to Australia view button
function ReturnToAustraliaButton() {
  const map = useMap();
  const australiaCenter = [-25.2744, 133.7751];
  
  const handleReturnToAustralia = () => {
    map.flyTo(australiaCenter, 4, {
      animate: true,
      duration: 1.5
    });
  };
  
  return (
    <div className="map-controls australia-view-control">
      <button 
        className="map-button australia-button" 
        onClick={handleReturnToAustralia}
        title="Return to Australia view"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a1 1 0 0 1 .707.293l2.828 2.829a1 1 0 0 1-1.414 1.414L9 3.414V13.5a1 1 0 0 1-2 0V3.414L5.879 4.536a1 1 0 0 1-1.414-1.414l2.828-2.829A1 1 0 0 1 8 0z" transform="rotate(270 8 8)"/>
        </svg>
        Australia
      </button>
    </div>
  );
}

const UVMap = ({ onUVDataSelected, selectedLocation }) => {
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
          
          return (
            <Marker 
              key={`${location.city || index}-${index}`}
              position={[location.latitude, location.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(location)
              }}
            />
          );
        }) : (
          <div>No UV data available for the map</div>
        )}
        
        <LocationMarker onLocationFound={handleLocationFound} />
        <ReturnToAustraliaButton />
        <MapViewHandler selectedLocation={selectedLocation} />
      </MapContainer>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default UVMap; 