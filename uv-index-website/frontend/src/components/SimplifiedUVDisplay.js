import React, { useState } from 'react';
import SkinToneSelector from './SkinToneSelector';
import '../styles/SimplifiedUVDisplay.css';

const SimplifiedUVDisplay = ({ uvData }) => {
  const [showSkinToneSelector, setShowSkinToneSelector] = useState(false);
  
  if (!uvData) {
    return null;
  }

  // Get UV index value
  const uvIndex = typeof uvData.uv_index === 'number' ? uvData.uv_index : 
                  parseFloat(uvData.uv_index) || 0;
                  
  // Get date and time information
  const timeInfo = uvData.time ? (uvData.date ? `${uvData.time}, ${uvData.date}` : uvData.time) : '';

  // Get UV level
  const getUVLevel = (index) => {
    if (index < 3) return 'Low';
    if (index < 6) return 'Moderate';
    if (index < 8) return 'High';
    if (index < 11) return 'Very High';
    return 'Extreme';
  };

  // Get UV color
  const getUVColor = (index) => {
    if (index < 3) return '#3498db';
    if (index < 6) return '#2ecc71';
    if (index < 8) return '#f1c40f';
    if (index < 11) return '#e67e22';
    return '#e74c3c';
  };

  const uvLevel = getUVLevel(uvIndex);
  const uvColor = getUVColor(uvIndex);

  const handleGetRecommendations = () => {
    setShowSkinToneSelector(true);
  };

  return (
    <div className="simplified-uv-container">
      <div className="uv-details-card">
        <h2>UV Index Details</h2>
        <div className="uv-details-content">
          <h3 className="city-name">{uvData.city}</h3>
          <div className="uv-value-container">
            <span className="uv-value" style={{ color: uvColor }}>
              {uvIndex.toFixed(1)}
            </span>
            <div className="uv-info">
              <div className="uv-time">Updated: {timeInfo}</div>
              <div 
                className="uv-level-badge"
                style={{ backgroundColor: uvColor }}
              >
                {uvLevel} UV Index
              </div>
            </div>
          </div>
          
          {!showSkinToneSelector && (
            <button 
              className="get-recommendations-btn"
              onClick={handleGetRecommendations}
            >
              Get Protection Recommendations
            </button>
          )}
        </div>
      </div>
      
      {showSkinToneSelector && (
        <SkinToneSelector 
          uvIndex={uvIndex} 
          onSkinToneSelected={() => {}} 
        />
      )}
    </div>
  );
};

export default SimplifiedUVDisplay; 