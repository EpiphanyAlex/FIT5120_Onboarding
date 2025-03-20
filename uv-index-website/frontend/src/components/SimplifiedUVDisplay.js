import React, { useState, useEffect } from 'react';
import SkinToneSelector from './SkinToneSelector';
import '../styles/SimplifiedUVDisplay.css';

const SimplifiedUVDisplay = ({ uvData, defaultSkinType = 1 }) => {
  const [selectedSkinType, setSelectedSkinType] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [adjustedUvIndex, setAdjustedUvIndex] = useState(0);
  
  useEffect(() => {
    // Update current date and time on component mount
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setCurrentDateTime(formattedDateTime);
    
    // Simulate the UV index at peak time (around 11 AM)
    if (uvData && (typeof uvData.uv_index === 'number' || typeof uvData.uv_index === 'string')) {
      const baseUvIndex = typeof uvData.uv_index === 'number' ? uvData.uv_index : parseFloat(uvData.uv_index) || 0;
      
      // Adjust to simulate peak time UV index
      // For lower UV indices, increase more significantly to represent peak daytime values
      let peakTimeUvIndex;
      
      if (baseUvIndex < 3) {
        peakTimeUvIndex = Math.min(baseUvIndex * 2 + 1, 5); // Low becomes moderate
      } else if (baseUvIndex < 6) {
        peakTimeUvIndex = Math.min(baseUvIndex * 1.5, 8); // Moderate becomes high
      } else {
        peakTimeUvIndex = Math.min(baseUvIndex * 1.2, 12); // Higher indices increase slightly
      }
      
      setAdjustedUvIndex(peakTimeUvIndex);
    }
  }, [uvData]);

  if (!uvData) {
    return null;
  }

  // Get UV index value - use the adjusted value instead of the raw value
  const uvIndex = adjustedUvIndex;
                  
  // Get UV level and color based on risk categories
  const getUVLevel = (index) => {
    if (index < 3) return 'Low Risk';
    if (index < 6) return 'Moderate Risk';
    if (index < 8) return 'High Risk';
    if (index < 11) return 'Very High Risk';
    return 'Extreme Risk';
  };

  // Get UV color
  const getUVColor = (index) => {
    if (index < 3) return '#2ecc71'; // Green for low
    if (index < 6) return '#f1c40f'; // Yellow for moderate
    if (index < 8) return '#e67e22'; // Orange for high
    if (index < 11) return '#e74c3c'; // Red for very high
    return '#9b59b6'; // Purple for extreme
  };

  const uvLevel = getUVLevel(uvIndex);
  const uvColor = getUVColor(uvIndex);
  const roundedUvIndex = Math.round(uvIndex); // Round to integer

  // Generate recommendations based on UV index and skin type
  const getRecommendations = (uvIndex, skinType) => {
    // Base recommendations that vary by UV index
    let baseRecommendations = {
      clothing: '',
      sunscreen: '',
      exposure: '',
      sunglasses: '',
      additional: ''
    };
    
    // UV index specific recommendations
    if (uvIndex < 3) {
      baseRecommendations = {
        clothing: 'Normal clothing is sufficient.',
        sunscreen: 'SPF 15+ sunscreen recommended for extended outdoor activities.',
        exposure: 'Safe to be outdoors for most people.',
        sunglasses: 'Consider sunglasses on bright days.',
        additional: 'Enjoy outdoor activities with minimal precautions.'
      };
    } else if (uvIndex < 6) {
      baseRecommendations = {
        clothing: 'Lightweight long-sleeved shirts and pants when possible.',
        sunscreen: 'Apply SPF 30+ sunscreen every 2 hours.',
        exposure: 'Seek shade during midday hours (10am-2pm).',
        sunglasses: 'Sunglasses recommended.',
        additional: 'Take breaks in the shade and stay hydrated.'
      };
    } else if (uvIndex < 8) {
      baseRecommendations = {
        clothing: 'Wear protective clothing, wide-brimmed hat.',
        sunscreen: 'Apply SPF 50+ sunscreen every 90 minutes.',
        exposure: 'Reduce time in the sun between 10am-4pm.',
        sunglasses: 'UV-protective sunglasses necessary.',
        additional: 'Be careful around reflective surfaces like water and sand.'
      };
    } else if (uvIndex < 11) {
      baseRecommendations = {
        clothing: 'Wear UV-protective clothing, wide-brimmed hat, and cover exposed skin.',
        sunscreen: 'Apply SPF 50+ sunscreen every hour.',
        exposure: 'Minimize sun exposure between 10am-4pm. Stay in shade when possible.',
        sunglasses: 'High-quality UV-blocking sunglasses essential.',
        additional: 'Check UV forecast before planning outdoor activities.'
      };
    } else {
      baseRecommendations = {
        clothing: 'Full coverage with UV-protective clothing is essential.',
        sunscreen: 'Apply SPF 50+ sunscreen every hour on all exposed skin.',
        exposure: 'Avoid outdoor activities during midday. Stay indoors when possible.',
        sunglasses: 'High-quality wrap-around sunglasses with UV protection required.',
        additional: 'Extreme caution is advised. Sunburn can occur in minutes.'
      };
    }
    
    // Adjust recommendations based on skin type
    const skinTypeAdjustments = {
      1: {
        // Type I - Very fair skin, always burns, never tans
        sunscreen: baseRecommendations.sunscreen + ' Reapply more frequently.',
        exposure: `Reduce recommended exposure time by 50%. ${baseRecommendations.exposure}`,
        additional: 'Your skin type has the highest risk of sun damage. Take extra precautions.'
      },
      2: {
        // Type II - Fair skin, burns easily, tans minimally
        sunscreen: baseRecommendations.sunscreen + ' Ensure thorough application.',
        exposure: `Reduce recommended exposure time by 30%. ${baseRecommendations.exposure}`,
        additional: 'Your skin type burns easily. Be vigilant with sun protection.'
      },
      3: {
        // Type III - Medium skin, sometimes burns, gradually tans
        sunscreen: baseRecommendations.sunscreen,
        exposure: baseRecommendations.exposure,
        additional: 'Your skin type has moderate sensitivity. Follow standard precautions.'
      },
      4: {
        // Type IV - Olive skin, rarely burns, tans easily
        sunscreen: baseRecommendations.sunscreen,
        exposure: baseRecommendations.exposure,
        additional: 'While your skin is less prone to burning, sun damage can still occur.'
      },
      5: {
        // Type V - Brown skin, rarely burns, tans darkly
        sunscreen: baseRecommendations.sunscreen.replace(/SPF \d+\+/, 'SPF 30+'),
        exposure: baseRecommendations.exposure,
        additional: 'Your skin has natural protection, but isn\'t immune to UV damage.'
      },
      6: {
        // Type VI - Dark brown/black skin, never burns
        sunscreen: baseRecommendations.sunscreen.replace(/SPF \d+\+/, 'SPF 15-30'),
        exposure: baseRecommendations.exposure,
        additional: 'While your risk of sunburn is low, protecting your skin is still important.'
      }
    };
    
    // Merge base recommendations with skin-type specific adjustments
    return {
      ...baseRecommendations,
      ...skinTypeAdjustments[skinType]
    };
  };
  
  const handleSkinToneSelected = (skinType) => {
    setSelectedSkinType(skinType);
  };

  return (
    <div className="simplified-uv-container">
      <div className="uv-details-card">
        <h2>UV Index Details</h2>
        <div className="uv-details-content">
          <h3 className="city-name">{uvData.city}</h3>
          <div className="uv-value-container">
            <span className="uv-value" style={{ color: uvColor }}>
              {roundedUvIndex}
            </span>
            <div className="uv-info">
              <div className="uv-time">Updated: {currentDateTime}</div>
              <div 
                className="uv-level-badge"
                style={{ backgroundColor: uvColor }}
              >
                {uvLevel}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="skin-type-selection-card">
        <div className="skin-tone-prompt-highlight">
          <p>Select your skin type for personalized recommendations</p>
        </div>
        <SkinToneSelector 
          uvIndex={uvIndex} 
          onSkinToneSelected={handleSkinToneSelected} 
          defaultSkinType={defaultSkinType}
        />
      </div>
      
      {selectedSkinType && (
        <div className="recommendations-card">
          <h2>Sun Protection Recommendations</h2>
          <div className="recommendations-content">
            {(() => {
              const recommendations = getRecommendations(uvIndex, selectedSkinType);
              return (
                <>
                  <div className="recommendation-item">
                    <h3>Clothing</h3>
                    <p>{recommendations.clothing}</p>
                  </div>
                  
                  <div className="recommendation-item">
                    <h3>Sunscreen</h3>
                    <p>{recommendations.sunscreen}</p>
                  </div>
                  
                  <div className="recommendation-item">
                    <h3>Time Outdoors</h3>
                    <p>{recommendations.exposure}</p>
                  </div>
                  
                  <div className="recommendation-item">
                    <h3>Eye Protection</h3>
                    <p>{recommendations.sunglasses}</p>
                  </div>
                  
                  <div className="recommendation-item">
                    <h3>Additional Advice</h3>
                    <p>{recommendations.additional}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default SimplifiedUVDisplay; 