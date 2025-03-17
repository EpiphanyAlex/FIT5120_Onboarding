# Australian UV Index Website

A web application that displays real-time UV index data for major Australian cities, allowing users to check UV levels by location, postcode, or current position.

## Features

- **Interactive Map**: View UV index for all major Australian cities on an interactive map
- **Postcode Search**: Find UV index by entering an Australian postcode
- **Current Location**: Get UV index for your current location
- **Personalized Recommendations**: Receive sun protection recommendations based on your skin type and the current UV index
- **Responsive Design**: Works on desktop and mobile devices

## Data Source

This application uses UV index data from the Australian Radiation Protection and Nuclear Safety Agency (ARPANSA). The data is retrieved from their XML feed at:
https://uvdata.arpansa.gov.au/xml/uvvalues.xml

## Project Structure

```
uv-index-website/
├── backend/                 # Flask backend
│   ├── app.py               # Main Flask application
│   ├── city_mapping.py      # City data and mapping functions
│   ├── database.py          # Database functions for postcode lookup
│   ├── mock_data.py         # Mock data for testing
│   ├── config.py            # Configuration settings
│   └── requirements.txt     # Python dependencies
│
└── frontend/                # React frontend
    ├── public/              # Static files
    └── src/                 # Source code
        ├── components/      # React components
        │   ├── Map.js       # Interactive map component
        │   ├── SearchBar.js # Postcode search component
        │   ├── UVDisplay.js # UV index display component
        │   └── ...
        ├── services/        # API services
        │   └── api.js       # API client
        ├── styles/          # CSS styles
        ├── App.js           # Main application component
        └── index.js         # Entry point
```

## Installation

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- pip
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd uv-index-website/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```
   python app.py
   ```
   The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd uv-index-website/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```
   The frontend will run on http://localhost:3000

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Use the map to view UV index for different cities
3. Enter a postcode to search for UV index in a specific area
4. Click "Get My UV Index" to use your current location
5. Select your skin type to get personalized sun protection recommendations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- UV index data provided by [ARPANSA](https://www.arpansa.gov.au/)
- Map functionality powered by [Leaflet](https://leafletjs.com/)
- Frontend built with [React](https://reactjs.org/)
- Backend built with [Flask](https://flask.palletsprojects.com/) 