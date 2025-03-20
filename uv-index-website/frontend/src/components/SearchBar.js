import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState(''); // We support both search types, using 'query' instead of 'postcode' and checking input type with regex
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    if (!query) {
      setError('Please enter a city name or postcode');
      return;
    }
    
    // Australian postcodes are 4 digits
    if (/^\d{4}$/.test(query)) { // Check if input is a 4-digit postcode
      onSearch({ type: 'postcode', value: query});
      console.log('onSearch', { type: 'postcode', value: query});
    } else if (/^[a-zA-Z\s]+$/.test(query)) {
      onSearch({ type: 'city', value: query.trim() });
      console.log('onSearch', { type: 'city', value: query.trim() });
    } else {
      setError('Please enter a valid city name or 4-digit postcode');
      return;
    }
    
    setError('');
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Australian postcode (e.g. 3000) or city name"
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