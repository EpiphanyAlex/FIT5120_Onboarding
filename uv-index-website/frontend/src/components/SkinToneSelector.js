import React, { useState, useEffect, useRef } from 'react';
import '../styles/SkinToneSelector.css';

const SKIN_TYPES = [
  { id: 1, name: 'Type I', description: 'Very fair skin, always burns, never tans', color: '#f8d5c2' },
  { id: 2, name: 'Type II', description: 'Fair skin, burns easily, tans minimally', color: '#f3bd9c' },
  { id: 3, name: 'Type III', description: 'Medium skin, sometimes burns, gradually tans', color: '#e5a887' },
  { id: 4, name: 'Type IV', description: 'Olive skin, rarely burns, tans easily', color: '#c68863' },
  { id: 5, name: 'Type V', description: 'Brown skin, very rarely burns, tans darkly', color: '#a67358' },
  { id: 6, name: 'Type VI', description: 'Dark brown or black skin, never burns', color: '#70483c' }
];

const SkinToneSelector = () => {
  const [sliderValue, setSliderValue] = useState(1);
  const [recommendationText, setRecommendationText] = useState('');
  const sliderRef = useRef(null);

  // Fetch from Flask when sliderValue changes
  useEffect(() => {
    fetch(`http://localhost:5000/api/recommend_uv?skin_type=${sliderValue}`)
      .then(response => response.json())
      .then(data => {
        setRecommendationText(data.recommendation || '');
      })
      .catch(err => console.error('Error fetching recommendation:', err));
  }, [sliderValue]);

  const handleSliderChange = (e) => {
    setSliderValue(parseInt(e.target.value, 10));
  };

  const selectedType = SKIN_TYPES[sliderValue - 1];

  // Create a color gradient for the slider background
  const gradientColors = SKIN_TYPES.map(type => type.color).join(', ');
  const sliderBackground = `linear-gradient(to right, ${gradientColors})`;

  // Evenly spaced slider markers
  const sliderMarkers = SKIN_TYPES.map(type => {
    const position = ((type.id - 1) / (SKIN_TYPES.length - 1)) * 100;
    return (
      <div
        key={type.id}
        className="slider-marker"
        style={{ left: `${position}%` }}
      />
    );
  });

  // Optional tooltip positioning
  const getThumbPosition = () => {
    if (!sliderRef.current) return '0%';
    const min = parseInt(sliderRef.current.min, 10);
    const max = parseInt(sliderRef.current.max, 10);
    const percent = ((sliderValue - min) / (max - min)) * 100;
    return `${percent}%`;
  };

  return (
    <div className="skin-tone-selector">
      <div className="skin-tone-slider-container">
        <div className="skin-type-info">
          <h4>{selectedType?.name}</h4>
          <p>{selectedType?.description}</p>
        </div>

        <div className="slider-container">
          <div
            className="slider-gradient"
            style={{ background: sliderBackground }}
          />
          <input
            ref={sliderRef}
            type="range"
            min="1"
            max="6"
            step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="skin-tone-slider"
          />
          <div className="slider-markers">{sliderMarkers}</div>
          <div
            className="slider-thumb-tooltip"
            style={{ left: getThumbPosition() }}
          >
            <div
              className="tooltip-color-sample"
              style={{ backgroundColor: selectedType?.color }}
            />
          </div>
        </div>
      </div>

      <div className="recommendation-container">
        {recommendationText}
      </div>
    </div>
  );
};

export default SkinToneSelector;
