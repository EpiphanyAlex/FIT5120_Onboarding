import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, loading }) => {
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate postcode
    if (!postcode) {
      setError('Please enter a postcode');
      return;
    }
    
    // Australian postcodes are 4 digits
    if (!/^\d{4}$/.test(postcode)) {
      setError('Please enter a valid 4-digit Australian postcode');
      return;
    }
    
    setError('');
    onSearch(postcode);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Enter Australian postcode (e.g. 3000)"
            className="search-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="search-error">{error}</div>}
      </form>
    </div>
  );
};

export default SearchBar; 