import React from 'react';

const UVDisplay = ({ uvData }) => {
  if (!uvData) {
    return null;
  }

  // Get UV index value
  const uvIndex = typeof uvData.uv_index === 'number' ? uvData.uv_index : 
                  parseFloat(uvData.uv_index) || 0;
                  
  // Get date and time information
  const timeInfo = uvData.time ? (uvData.date ? `${uvData.time}, ${uvData.date}` : uvData.time) : '';

  // Get UV level and recommendations
  const getUVInfo = (index) => {
    if (index < 3) {
      return {
        category: 'uv-low',
        level: 'Low',
        color: '#3498db',
        recommendations: [
          'Most people can safely stay outdoors',
          'Consider wearing sunglasses if you are sensitive to sunlight',
          'Use SPF30+ sunscreen if outdoors for more than 2 hours',
        ]
      };
    } else if (index < 6) {
      return {
        category: 'uv-moderate',
        level: 'Moderate',
        color: '#2ecc71',
        recommendations: [
          'Wear sunglasses during daylight hours',
          'Apply SPF30+ sunscreen',
          'Seek shade during midday hours',
          'Wear protective clothing, including a hat'
        ]
      };
    } else if (index < 8) {
      return {
        category: 'uv-high',
        level: 'High',
        color: '#f1c40f',
        recommendations: [
          'Minimize outdoor activities between 10AM and 4PM',
          'Seek shade when outdoors',
          'Wear protective clothing, including long sleeves, pants and a hat',
          'Use SPF30+ sunscreen and reapply every two hours',
          'Wear sunglasses'
        ]
      };
    } else if (index < 11) {
      return {
        category: 'uv-very-high',
        level: 'Very High',
        color: '#e67e22',
        recommendations: [
          'Avoid outdoor activities between 10AM and 4PM',
          'Seek shade when outdoors',
          'Wear protective clothing, including long sleeves, pants and a wide-brimmed hat',
          'Use SPF30+ sunscreen and reapply every two hours',
          'Wear UV-protective sunglasses'
        ]
      };
    } else {
      return {
        category: 'uv-extreme',
        level: 'Extreme',
        color: '#e74c3c',
        recommendations: [
          'Avoid outdoor activities if possible',
          'If you must go outside, do so in early morning or late evening',
          'Wear full protective clothing, including long sleeves, pants and a wide-brimmed hat',
          'Use SPF50+ sunscreen and reapply every hour',
          'Wear UV-protective sunglasses',
          'Stay indoors or in shaded areas as much as possible'
        ]
      };
    }
  };

  const uvInfo = getUVInfo(uvIndex);

  return (
    <div className="uv-display">
      <div className="uv-info">
        <div className="uv-value" style={{ color: uvInfo.color }}>
          {uvIndex.toFixed(1)}
        </div>
        <div className="uv-details">
          <div className="uv-city">{uvData.city}</div>
          <div className="uv-time">Updated: {timeInfo}</div>
          <div 
            className={`uv-category ${uvInfo.category}`}
            style={{ backgroundColor: uvInfo.color }}
          >
            {uvInfo.level} UV Index
          </div>
        </div>
      </div>
      
      <div className="uv-recommendations">
        <h4>Protection Recommendations:</h4>
        <ul>
          {uvInfo.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UVDisplay; 