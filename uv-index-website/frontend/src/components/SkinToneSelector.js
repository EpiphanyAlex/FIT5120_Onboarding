import React, { useState } from 'react';
import '../styles/SkinToneSelector.css';

const SKIN_TYPES = [
  {
    id: 1,
    name: 'Type I',
    description: 'Very fair skin, always burns, never tans',
    color: '#f8d5c2'
  },
  {
    id: 2,
    name: 'Type II',
    description: 'Fair skin, burns easily, tans minimally',
    color: '#f3bd9c'
  },
  {
    id: 3,
    name: 'Type III',
    description: 'Medium skin, sometimes burns, gradually tans',
    color: '#e5a887'
  },
  {
    id: 4,
    name: 'Type IV',
    description: 'Olive skin, rarely burns, tans easily',
    color: '#c68863'
  },
  {
    id: 5,
    name: 'Type V',
    description: 'Brown skin, very rarely burns, tans darkly',
    color: '#a67358'
  },
  {
    id: 6,
    name: 'Type VI',
    description: 'Dark brown or black skin, never burns',
    color: '#70483c'
  }
];

const SkinToneSelector = ({ uvIndex, onSkinToneSelected }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleSkinTypeSelect = (skinType) => {
    setSelectedType(skinType);
    setShowRecommendations(true);
    if (onSkinToneSelected) {
      onSkinToneSelected(skinType);
    }
  };

  const getRecommendations = (skinType, uvIndex) => {
    // Base recommendations for everyone
    const baseRecommendations = [
      'Wear sunglasses to protect your eyes',
      'Seek shade during peak hours (10am-4pm)'
    ];

    // Additional recommendations based on skin type and UV index
    const additionalRecommendations = [];

    // UV index specific recommendations
    if (uvIndex >= 11) {
      // Extreme
      additionalRecommendations.push('Avoid being outside during midday hours');
      additionalRecommendations.push('Ensure you seek shade at all times');
      additionalRecommendations.push('Shirt, sunscreen, hat, and sunglasses are a must');
    } else if (uvIndex >= 8) {
      // Very High
      additionalRecommendations.push('Minimize sun exposure between 10am and 4pm');
      additionalRecommendations.push('Apply SPF 50+ sunscreen every 2 hours');
    } else if (uvIndex >= 6) {
      // High
      additionalRecommendations.push('Reduce sun exposure between 10am and 4pm');
      additionalRecommendations.push('Apply SPF 30+ sunscreen every 2 hours');
    } else if (uvIndex >= 3) {
      // Moderate
      additionalRecommendations.push('Apply SPF 30+ sunscreen');
      additionalRecommendations.push('Wear protective clothing when outdoors for extended periods');
    } else {
      // Low
      additionalRecommendations.push('Use sunscreen if you burn easily');
    }

    // Skin type specific recommendations
    if (skinType.id <= 2) {
      // Very fair to fair skin
      additionalRecommendations.push('Your skin burns very easily, take extra precautions');
      if (uvIndex >= 3) {
        additionalRecommendations.push('Wear long-sleeved shirts and pants');
        additionalRecommendations.push('Use SPF 50+ sunscreen even on cloudy days');
      }
    } else if (skinType.id <= 4) {
      // Medium to olive skin
      if (uvIndex >= 5) {
        additionalRecommendations.push('Wear protective clothing');
        additionalRecommendations.push('Use SPF 30+ sunscreen');
      }
    } else {
      // Brown to dark skin
      if (uvIndex >= 8) {
        additionalRecommendations.push('Use SPF 15+ sunscreen for extended outdoor activities');
      }
    }

    // Add time-based recommendations
    const maxTimeInSun = Math.max(
      Math.floor(60 / (uvIndex * (1 + (6 - skinType.id) / 6))),
      5
    );
    
    additionalRecommendations.push(
      `Without protection, limit direct sun exposure to ${maxTimeInSun} minutes`
    );

    return [...baseRecommendations, ...additionalRecommendations];
  };

  return (
    <div className="skin-tone-selector">
      {!showRecommendations ? (
        <>
          <h3>Select Your Skin Type for Personalized Recommendations</h3>
          <div className="skin-types-container">
            {SKIN_TYPES.map((skinType) => (
              <div 
                key={skinType.id}
                className="skin-type-option"
                onClick={() => handleSkinTypeSelect(skinType)}
              >
                <div 
                  className="skin-color-sample" 
                  style={{ backgroundColor: skinType.color }}
                ></div>
                <div className="skin-type-info">
                  <h4>{skinType.name}</h4>
                  <p>{skinType.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="personalized-recommendations">
          <h3>Personalized Sun Protection Recommendations</h3>
          <div className="skin-type-selected">
            <div 
              className="skin-color-sample" 
              style={{ backgroundColor: selectedType.color }}
            ></div>
            <div className="skin-type-info">
              <h4>{selectedType.name}</h4>
              <p>{selectedType.description}</p>
            </div>
            <button 
              className="change-skin-type-btn"
              onClick={() => setShowRecommendations(false)}
            >
              Change Skin Type
            </button>
          </div>
          
          <div className="recommendations-list">
            <ul>
              {getRecommendations(selectedType, uvIndex).map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinToneSelector; 