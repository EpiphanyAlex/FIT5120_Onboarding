import React, { useState, useEffect, useRef } from 'react';
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

const SkinToneSelector = ({ uvIndex, onSkinToneSelected, defaultSkinType = 1 }) => {
  const [sliderValue, setSliderValue] = useState(defaultSkinType);
  const [selectedType, setSelectedType] = useState(SKIN_TYPES[defaultSkinType - 1]);
  const [hasSliderChange, setHasSliderChange] = useState(false);

  useEffect(() => {
    setHasSliderChange(false);
  }, [uvIndex])

  const sliderRef = useRef(null);

  useEffect(() => {
    // Find the closest skin type based on slider value
    const typeIndex = Math.min(Math.max(Math.round(sliderValue) - 1, 0), 5);
    setSelectedType(SKIN_TYPES[typeIndex]);
    
    if (onSkinToneSelected) {
      onSkinToneSelected(SKIN_TYPES[typeIndex]);
    }
  }, [sliderValue, onSkinToneSelected]);

  const handleSliderChange = (e) => {
    setSliderValue(parseFloat(e.target.value));
    setHasSliderChange(true);
  };

  const getRecommendations = (skinType, uvIndex) => {
    // Skip general recommendations for low UV index
    if (uvIndex < 3) {
      return [];
    }
    
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

  const recommendations = getRecommendations(selectedType, uvIndex);

  // Create gradient background for slider
  const gradientColors = SKIN_TYPES.map(type => type.color).join(', ');
  const sliderBackground = `linear-gradient(to right, ${gradientColors})`;

  // Calculate thumb position for the tooltip
  const getThumbPosition = () => {
    if (!sliderRef.current) return '0%';
    const min = parseFloat(sliderRef.current.min);
    const max = parseFloat(sliderRef.current.max);
    const percent = ((sliderValue - min) / (max - min)) * 100;
    return `${percent}%`;
  };

  return (
    <div className="skin-tone-selector">
      <div className="skin-tone-slider-container">
        {hasSliderChange ? <div className="skin-type-info">
          <h4>{selectedType.name}</h4>
          <p>{selectedType.description}</p>
        </div> : null}
        
        <div className="slider-container">
          <div className="slider-gradient" style={{ background: sliderBackground }}></div>
          <input
            ref={sliderRef}
            type="range"
            min="1"
            max="6"
            step="0.01"
            value={sliderValue}
            onChange={handleSliderChange}
            className="skin-tone-slider"
          />
          <div className="slider-markers">
            {SKIN_TYPES.map((type) => (
              <div 
                key={type.id}
                className="slider-marker"
                style={{ left: `${(type.id - 1) * 20}%` }}
              ></div>
            ))}
          </div>
          <div 
            className="slider-thumb-tooltip" 
            style={{ left: getThumbPosition() }}
          >
            <div 
              className="tooltip-color-sample" 
              style={{ backgroundColor: selectedType.color }}
            ></div>
          </div>
        </div>
      </div>
      
      {
        hasSliderChange ? (<>
        
          {recommendations.length > 0 ? (
          <div className="personalized-recommendations">
            <h3>Personalized Sun Protection Recommendations</h3>
            <div className="recommendations-list">
              <ul>
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="low-uv-message">
            <p>Current UV index is low. Most people can safely stay outdoors without special protection.</p>
            {selectedType.id <= 2 && (
              <p>However, with your skin type, consider wearing sunglasses if you are sensitive to sunlight.</p>
            )}
          </div>
        )}
        </>) : null
      }
    </div>
  );
};

export default SkinToneSelector; 