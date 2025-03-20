import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import UVDisplay from './components/UVDisplay';
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
        <nav className="main-nav">
          <div className="nav-brand">UV Australia</div>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#map">UV Map</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
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
            />
          </section>

          {selectedUVData && (
            <section className="uv-display-section">
              <SimplifiedUVDisplay uvData={selectedUVData} defaultSkinType={1} />
            </section>
          )}
        </div>
      </main>

      {/* <footer className="App-footer">
        <p>© 2025 UV Index Australia</p>
      </footer> */}

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Home</h4>
            <h4>Contact</h4>
          </div>
          <div className="footer-section">
            <h4>Social media</h4>
            < img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" width="24" height="24" />
            < img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlMFJv9yo-2GQMxYrv8ct7IIw9oM7eJcHPnA&s" alt="Twitter" width="24" height="24" />
          </div>
          <div className="footer-bottom">
            <p>© 2025 UV Index Australia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 