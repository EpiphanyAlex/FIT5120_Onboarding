import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  config => {
    console.log(`API request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log(`API response: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    console.error('API response error:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Mock data matching the XML file from https://uvdata.arpansa.gov.au/xml/uvvalues.xml
const MOCK_UV_DATA = [
  {
    city: 'Adelaide',
    city_id: 'Adelaide',
    short_name: 'adl',
    state: 'SA',
    uv_index: 0.5,
    time: '5:11 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -34.9285,
    longitude: 138.6007
  },
  {
    city: 'Alice Springs',
    city_id: 'Alice Springs',
    short_name: 'ali',
    state: 'NT',
    uv_index: 0.9,
    time: '5:12 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:42',
    status: 'ok',
    latitude: -23.6980,
    longitude: 133.8807
  },
  {
    city: 'Brisbane',
    city_id: 'Brisbane',
    short_name: 'bri',
    state: 'QLD',
    uv_index: 0.0,
    time: '5:42 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:42',
    status: 'ok',
    latitude: -27.4698,
    longitude: 153.0251
  },
  {
    city: 'Canberra',
    city_id: 'Canberra',
    short_name: 'can',
    state: 'ACT',
    uv_index: 0.1,
    time: '5:42 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:42',
    status: 'ok',
    latitude: -35.2809,
    longitude: 149.1300
  },
  {
    city: 'Casey',
    city_id: 'Casey',
    short_name: 'cas',
    state: 'Antarctic',
    uv_index: 1.3,
    time: '3:42 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:42',
    status: 'ok',
    latitude: -66.2821,
    longitude: 110.5284
  },
  {
    city: 'Darwin',
    city_id: 'Darwin',
    short_name: 'dar',
    state: 'NT',
    uv_index: 0.8,
    time: '5:12 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:42',
    status: 'ok',
    latitude: -12.4634,
    longitude: 130.8456
  },
  {
    city: 'Davis',
    city_id: 'Davis',
    short_name: 'dav',
    state: 'Antarctic',
    uv_index: 2.0,
    time: '2:42 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:42',
    status: 'ok',
    latitude: -68.5764,
    longitude: 77.9689
  },
  {
    city: 'Emerald',
    city_id: 'Emerald',
    short_name: 'emd',
    state: 'QLD',
    uv_index: 0.1,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -23.5275,
    longitude: 148.1549
  },
  {
    city: 'Gold Coast',
    city_id: 'Gold Coast',
    short_name: 'gco',
    state: 'QLD',
    uv_index: 0.1,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -28.0167,
    longitude: 153.4000
  },
  {
    city: 'Kingston',
    city_id: 'Kingston',
    short_name: 'kin',
    state: 'Norfolk Island',
    uv_index: 0.1,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -29.0544,
    longitude: 167.9578
  },
  {
    city: 'Macquarie Island',
    city_id: 'Macquarie Island',
    short_name: 'mcq',
    state: 'TAS',
    uv_index: 0.0,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -54.6167,
    longitude: 158.8500
  },
  {
    city: 'Mawson',
    city_id: 'Mawson',
    short_name: 'maw',
    state: 'Antarctic',
    uv_index: 1.8,
    time: '12:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -67.6000,
    longitude: 62.8833
  },
  {
    city: 'Melbourne',
    city_id: 'Melbourne',
    short_name: 'mel',
    state: 'VIC',
    uv_index: 0.3,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -37.8136,
    longitude: 144.9631
  },
  {
    city: 'Newcastle',
    city_id: 'Newcastle',
    short_name: 'new',
    state: 'NSW',
    uv_index: 0.1,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -32.9283,
    longitude: 151.7817
  },
  {
    city: 'Perth',
    city_id: 'Perth',
    short_name: 'per',
    state: 'WA',
    uv_index: 2.7,
    time: '3:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -31.9505,
    longitude: 115.8605
  },
  {
    city: 'Sydney',
    city_id: 'Sydney',
    short_name: 'syd',
    state: 'NSW',
    uv_index: 0.1,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -33.8688,
    longitude: 151.2093
  },
  {
    city: 'Townsville',
    city_id: 'Townsville',
    short_name: 'tow',
    state: 'QLD',
    uv_index: 0.1,
    time: '5:41 PM',
    date: '17/03/2025',
    fulldate: 'Monday, 17 March 2025',
    utcdatetime: '2025/03/17 07:41',
    status: 'ok',
    latitude: -19.2590,
    longitude: 146.8169
  }
];

export const api = {
  // Get all cities
  getAllCities: async () => {
    try {
      const response = await apiClient.get('/cities');
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Return city names from mock data
      return MOCK_UV_DATA.map(city => ({
        name: city.city,
        state: city.state,
        postcode: '0000' // Placeholder
      }));
    }
  },

  // Search cities
  searchCities: async (name) => {
    try {
      const response = await apiClient.get(`/cities/search?name=${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching cities with name ${name}:`, error);
      // Filter mock data by name
      const filteredCities = MOCK_UV_DATA.filter(city => 
        city.city.toLowerCase().includes(name.toLowerCase())
      );
      
      // Return all fields from the filtered cities
      return filteredCities
    }
  },

  // Get UV indices for all cities
  getAllUVIndices: async () => {
    try {
      console.log('Fetching all UV indices from API...');
      const response = await apiClient.get('/uv-index');
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching UV indices:', error);
      console.log('Using mock data as fallback');
      return MOCK_UV_DATA;
    }
  },

  // Get UV index by postcode
  getUVIndexByPostcode: async (postcode) => {
    try {
      console.log(`Fetching UV index for postcode ${postcode}...`);
      const response = await apiClient.get(`/uv-index/postcode/${postcode}`);
      console.log('Postcode API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching UV index for postcode ${postcode}:`, error);
      
      // Map postcodes to cities based on ranges
      const postcodeNum = Number(postcode);
      let cityData = null;
      
      // Sydney: 2000-2249
      if (postcodeNum >= 2000 && postcodeNum <= 2249) {
        cityData = {
          name: 'Sydney',
          state: 'NSW',
          postcode: postcode
        };
      }
      // Melbourne: 3000-3207
      else if (postcodeNum >= 3000 && postcodeNum <= 3207) {
        cityData = {
          name: 'Melbourne',
          state: 'VIC',
          postcode: postcode
        };
      }
      // Brisbane: 4000-4179
      else if (postcodeNum >= 4000 && postcodeNum <= 4179) {
        cityData = {
          name: 'Brisbane',
          state: 'QLD',
          postcode: postcode
        };
      }
      // Perth: 6000-6199
      else if (postcodeNum >= 6000 && postcodeNum <= 6199) {
        cityData = {
          name: 'Perth',
          state: 'WA',
          postcode: postcode
        };
      }
      // Adelaide: 5000-5099
      else if (postcodeNum >= 5000 && postcodeNum <= 5099) {
        cityData = {
          name: 'Adelaide',
          state: 'SA',
          postcode: postcode
        };
      }
      // Hobart: 7000-7099
      else if (postcodeNum >= 7000 && postcodeNum <= 7099) {
        cityData = {
          name: 'Hobart',
          state: 'TAS',
          postcode: postcode
        };
      }
      // Darwin: 0800-0899
      else if (postcodeNum >= 800 && postcodeNum <= 899) {
        cityData = {
          name: 'Darwin',
          state: 'NT',
          postcode: postcode
        };
      }
      // Canberra: 2600-2620
      else if (postcodeNum >= 2600 && postcodeNum <= 2620) {
        cityData = {
          name: 'Canberra',
          state: 'ACT',
          postcode: postcode
        };
      }
      // Gold Coast: 4209-4299
      else if (postcodeNum >= 4209 && postcodeNum <= 4299) {
        cityData = {
          name: 'Gold Coast',
          state: 'QLD',
          postcode: postcode
        };
      }
      // Newcastle: 2300-2310
      else if (postcodeNum >= 2300 && postcodeNum <= 2310) {
        cityData = {
          name: 'Newcastle',
          state: 'NSW',
          postcode: postcode
        };
      }
      // Townsville: 4810-4820
      else if (postcodeNum >= 4810 && postcodeNum <= 4820) {
        cityData = {
          name: 'Townsville',
          state: 'QLD',
          postcode: postcode
        };
      }
      // Alice Springs: 0870-0880
      else if (postcodeNum >= 870 && postcodeNum <= 880) {
        cityData = {
          name: 'Alice Springs',
          state: 'NT',
          postcode: postcode
        };
      }
      
      if (cityData) {
        const cityUVData = MOCK_UV_DATA.find(city => city.city === cityData.name);
        if (cityUVData) {
          return {
            city: cityData,
            uv_index: cityUVData
          };
        }
      }
      
      throw error;
    }
  },

  // Get UV index by coordinates
  getUVIndexByCoordinates: async (lat, lng) => {
    try {
      console.log(`Fetching UV index for coordinates (${lat}, ${lng})...`);
      const response = await apiClient.get(`/uv-index/coordinates?lat=${lat}&lng=${lng}`);
      console.log('Coordinates API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching UV index for coordinates (${lat}, ${lng}):`, error);
      
      // Find nearest city in mock data (very simplified)
      let nearestCity = null;
      let minDistance = Number.MAX_VALUE;
      
      MOCK_UV_DATA.forEach(city => {
        const distance = Math.sqrt(
          Math.pow(lat - city.latitude, 2) + 
          Math.pow(lng - city.longitude, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      });
      
      if (nearestCity) {
        return {
          ...nearestCity,
          distance: minDistance
        };
      }
      
      throw error;
    }
  },

  // get UV index by city name
  getUVIndexByCityName: async (city) => {
    try {
      console.log(`Fetching UV index for city name ${city}...`);
      const response = await apiClient.get(`/uv-index/city/${city}`);
      console.log('City name API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching UV index for city name ${city}:`, error);
      // Find matching city from mock data
      const matchingCity = MOCK_UV_DATA.find(cityData => cityData.city === city);
      if (matchingCity) {
        return {
          city: {
            name: matchingCity.city,
            state: matchingCity.state,
            postcode: '0000' // Placeholder
          },
          uv_index: matchingCity
        }
      }
    }
  },
};

export default api; 