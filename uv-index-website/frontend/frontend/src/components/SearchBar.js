import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState(''); // 因为要支持两种搜索方式，这里postcode改成query，后面用正则表达式判断是数字还是字母
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate postcode
    if (!query) {
      setError('Please enter a postcode');
      return;
    }
    
    // Australian postcodes are 4 digits
    if (/^\d{4}$/.test(query)) { // 这里用正则表达式判断是数字还是字母
      onSearch({ type: 'postcode', value: query});
      console.log('onSearch', { type: 'postcode', value: query});
    } else if (/^[a-zA-Z\s]+$/.test(query)) {
      onSearch({ type: 'city', value: query.trim() });
      console.log('onSearch', { type: 'city', value: query.trim() });
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
            placeholder="Enter Australian postcode (e.g. 3000) or city name" // 修改文案
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