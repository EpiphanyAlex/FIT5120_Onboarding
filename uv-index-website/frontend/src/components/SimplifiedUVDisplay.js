import React, { useState } from 'react';
import SkinToneSelector from './SkinToneSelector';
import '../styles/SimplifiedUVDisplay.css';

const SimplifiedUVDisplay = ({ uvData, defaultSkinType = 1 }) => {
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
    if (index < 3) return '#2ecc71'; // Green for Low
    if (index < 6) return '#f1c40f'; // Yellow for Moderate
    if (index < 8) return '#e67e22'; // Orange for High
    if (index < 11) return '#e74c3c'; // Red for Very High
    return '#9b59b6'; // Purple for Extreme
  };
  
  // Get risk message
  const getRiskMessage = (index) => {
    if (index < 3) return 'Low risk from UV rays. Most people can stay outdoors with minimal protection.';
    if (index < 6) return 'Moderate risk from UV rays. Take precautions if you will be outside.';
    if (index < 8) return 'High risk from UV rays. Protection against skin and eye damage is needed.';
    if (index < 11) return 'Very high risk from UV rays. Extra protection is needed. Try to avoid sun during midday hours.';
    return 'Extreme risk from UV rays. Take all precautions: shirt, sunscreen, hat, sunglasses, and stay in shade.';
  };

  const uvLevel = getUVLevel(uvIndex);
  const uvColor = getUVColor(uvIndex);
  const riskMessage = getRiskMessage(uvIndex);

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
          
          <div className="risk-message" style={{ borderColor: uvColor }}>
            {riskMessage}
          </div>
        </div>
      </div>
      
      <div className="skin-tone-prompt">
        <p>Select your skin type for personalized recommendations</p>
      </div>
      
      <SkinToneSelector 
        uvIndex={uvIndex} 
        onSkinToneSelected={() => {}} 
        defaultSkinType={defaultSkinType}
      />
    </div>
  );
};

export default SimplifiedUVDisplay; 