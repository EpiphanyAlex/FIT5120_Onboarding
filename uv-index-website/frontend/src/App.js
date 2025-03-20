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
  const [showSimplifiedView, setShowSimplifiedView] = useState(false);

  // Handle search by postcode
  const handlePostcodeSearch = async ({type, value}) => {
    console.log('handlePostcodeSearch', {type, value});
    try {
      setLoading(true);
      setError(null);
      if (type === 'postcode') {
        const data = await api.getUVIndexByPostcode(value);
        console.log('data', data);
        if (data && data.uv_index) {
          setSelectedUVData(data.uv_index);
          setShowSimplifiedView(true);
          console.log('data', data);
        } else {
          setError('No UV data found for this postcode');
        }
      }
      if (type === 'city') {
        const data = await api.getUVIndexByCityName(value);
        console.log('getUVIndexByCity data', data);
        if (data && data.uv_index) {
          setSelectedUVData(data.uv_index);
          setShowSimplifiedView(true);
          console.log('data', data);
        }
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
    setShowSimplifiedView(true);
  };

  const hasSelectedLocation = selectedUVData !== null;

  return (
    <div className="App">
      <header className="main-header">
        <img
          src="/header-bg.jpg"
          alt="Header Background"
          className="header-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
        <div className="header-content">
          <h1 className="header-title">UV Australia</h1>
          <p className="header-description">Your trusted resource for real-time UV index information across Australia. Protect your skin with accurate UV forecasts and personalized sun safety recommendations.</p>
        </div>
      </header>

      <main className="App-main">
        <section className="search-section">
          <h2>Find UV Index</h2>
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
            />
          </section>

          {selectedUVData && (
            <section className="uv-display-section">
              <SimplifiedUVDisplay uvData={selectedUVData} defaultSkinType={1} />
            </section>
          )}
        </div>
      </main>

      <footer className="data-attribution-footer">
        <p>UV data provided by the Australian Radiation Protection and Nuclear Safety Agency (ARPANSA)</p>
        <p>© 2025 UV Australia</p>
      </footer>
    </div>
  );
}

export default App; 