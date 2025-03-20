import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import SimplifiedUVDisplay from './components/SimplifiedUVDisplay';
import api from './services/api';

function App() {
  const [selectedUVData, setSelectedUVData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle search by postcode
  const handlePostcodeSearch = async (postcode) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUVIndexByPostcode(postcode);
      if (data && data.uv_index) {
        setSelectedUVData(data.uv_index);
      } else {
        setError('No UV data found for this postcode');
      }
    } catch (err) {
      console.error('Error searching by postcode:', err);
      setError('Failed to get UV data for this postcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle UV data selection from map
  const handleUVDataSelected = (data) => {
    setSelectedUVData(data);
  };
  
  // Handle reset map view
  const handleResetMap = () => {
    setSelectedUVData(null);
  };

  // Determine if we have a selected location
  const hasSelectedLocation = selectedUVData !== null;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Australian UV Index Lookup</h1>
        <p className="App-description">
          View real-time UV index for major Australian cities and learn how to protect yourself from UV radiation
        </p>
      </header>

      <main className="App-main">
        <section className="search-section">
          <h2>Search by Postcode</h2>
          <SearchBar onSearch={handlePostcodeSearch} loading={loading} />
          {error && <div className="error-message">{error}</div>}
        </section>

        <div className={`content-container ${hasSelectedLocation ? 'has-selected-location' : ''}`}>
          <section className="map-section">
            <h2>UV Index Map</h2>
            <p>Click on a city marker to view current UV index and recommendations</p>
            <Map 
              onUVDataSelected={handleUVDataSelected} 
              selectedLocation={selectedUVData}
              onResetMap={handleResetMap}
            />
          </section>

          {selectedUVData && (
            <section className="uv-display-section">
              <SimplifiedUVDisplay uvData={selectedUVData} defaultSkinType={1} />
            </section>
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>© 2025 UV Index Australia</p>
      </footer>
    </div>
  );
}

export default App; 