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
  const [userInteracted, setUserInteracted] = useState(false);

  const sliderRef = useRef(null);

  useEffect(() => {
    // Reset user interaction state when UV index changes
    setUserInteracted(false);
  }, [uvIndex]);

  useEffect(() => {
    // Find the closest skin type based on slider value
    const typeIndex = Math.min(Math.max(Math.round(sliderValue) - 1, 0), 5);
    setSelectedType(SKIN_TYPES[typeIndex]);
    
    // Only call the callback if the user has interacted with the slider
    if (userInteracted && onSkinToneSelected) {
      onSkinToneSelected(typeIndex + 1);
    }
  }, [sliderValue, onSkinToneSelected, userInteracted]);

  const handleSliderChange = (e) => {
    setSliderValue(parseFloat(e.target.value));
    setUserInteracted(true);
  };

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
        <div className="skin-type-info">
          <h4>{selectedType.name}</h4>
          <p>{selectedType.description}</p>
        </div>
        
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
      
      {!userInteracted && (
        <div className="skin-selection-instruction">
          <p>Drag the slider to select your skin type and view personalized recommendations</p>
        </div>
      )}
    </div>
  );
};

export default SkinToneSelector; 