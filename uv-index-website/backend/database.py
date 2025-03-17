import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config

class Database:
    def __init__(self):
        self.conn = None
        self.connect()

    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URI)
            self.conn.autocommit = True
            self.create_tables()
            self.insert_initial_data()
        except Exception as e:
            print(f"Database connection error: {e}")
            raise e

    def create_tables(self):
        """Create necessary tables"""
        with self.conn.cursor() as cursor:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS cities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                postcode VARCHAR(10) NOT NULL,
                latitude FLOAT NOT NULL,
                longitude FLOAT NOT NULL,
                state VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_cities_postcode ON cities(postcode);
            CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
            """)

    def insert_initial_data(self):
        """Insert initial city data"""
        with self.conn.cursor() as cursor:
            # Check if data already exists
            cursor.execute("SELECT COUNT(*) FROM cities;")
            count = cursor.fetchone()[0]
            
            if count == 0:
                # Use city_mapping information to insert major cities
                from city_mapping import get_all_city_info
                
                city_infos = get_all_city_info()
                
                # Add postcodes for each major city
                postcode_mapping = {
                    "Sydney": "2000",
                    "Melbourne": "3000",
                    "Brisbane": "4000",
                    "Perth": "6000",
                    "Adelaide": "5000",
                    "Hobart": "7000",
                    "Darwin": "0800",
                    "Canberra": "2600",
                    "Gold Coast": "4217",
                    "Newcastle": "2300",
                    "Townsville": "4810",
                    "Alice Springs": "0870"
                }
                
                cities_data = []
                for city in city_infos:
                    # Only add major cities
                    if city["name"] in postcode_mapping:
                        cities_data.append((
                            city["name"],
                            postcode_mapping.get(city["name"], "0000"),
                            city["latitude"],
                            city["longitude"],
                            city["state"]
                        ))
                
                insert_query = """
                INSERT INTO cities (name, postcode, latitude, longitude, state)
                VALUES (%s, %s, %s, %s, %s);
                """
                
                cursor.executemany(insert_query, cities_data)
                
                # Add Melbourne suburbs with postcodes
                melbourne_suburbs = [
                    ("Melbourne (CBD)", "3000", -37.8136, 144.9631, "VIC"),
                    ("South Melbourne", "3205", -37.8300, 144.9630, "VIC"),
                    ("Docklands", "3008", -37.8170, 144.9460, "VIC"),
                    ("Carlton", "3053", -37.8010, 144.9670, "VIC"),
                    ("Parkville", "3052", -37.7870, 144.9520, "VIC"),
                    ("North Melbourne", "3051", -37.8040, 144.9400, "VIC"),
                    ("Kensington", "3031", -37.7940, 144.9300, "VIC"),
                    ("Flemington", "3031", -37.7880, 144.9200, "VIC"),
                    ("Fitzroy", "3065", -37.7990, 144.9780, "VIC"),
                    ("Collingwood", "3066", -37.8040, 144.9840, "VIC"),
                    ("Richmond", "3121", -37.8230, 144.9980, "VIC"),
                    ("South Yarra", "3141", -37.8400, 144.9950, "VIC"),
                    ("Prahran", "3181", -37.8510, 144.9900, "VIC"),
                    ("St Kilda", "3182", -37.8670, 144.9800, "VIC"),
                    ("Albert Park", "3206", -37.8400, 144.9560, "VIC"),
                    ("Port Melbourne", "3207", -37.8300, 144.9300, "VIC")
                ]
                
                melbourne_suburbs_query = """
                INSERT INTO cities (name, postcode, latitude, longitude, state)
                VALUES (%s, %s, %s, %s, %s);
                """
                
                cursor.executemany(melbourne_suburbs_query, melbourne_suburbs)
                
                # Add Sydney suburbs with postcodes
                sydney_suburbs = [
                    ("Sydney (CBD)", "2000", -33.8688, 151.2093, "NSW"),
                    ("Surry Hills", "2010", -33.8845, 151.2115, "NSW"),
                    ("Darlinghurst", "2010", -33.8780, 151.2220, "NSW"),
                    ("Paddington", "2021", -33.8850, 151.2260, "NSW"),
                    ("Bondi", "2026", -33.8930, 151.2740, "NSW"),
                    ("Bondi Junction", "2022", -33.8920, 151.2480, "NSW"),
                    ("Double Bay", "2028", -33.8770, 151.2440, "NSW"),
                    ("Woollahra", "2025", -33.8880, 151.2400, "NSW"),
                    ("Potts Point", "2011", -33.8690, 151.2260, "NSW"),
                    ("Darling Point", "2027", -33.8700, 151.2350, "NSW"),
                    ("Kings Cross", "2011", -33.8740, 151.2250, "NSW"),
                    ("Woolloomooloo", "2011", -33.8690, 151.2200, "NSW"),
                    ("The Rocks", "2000", -33.8600, 151.2090, "NSW"),
                    ("Pyrmont", "2009", -33.8705, 151.1950, "NSW"),
                    ("Ultimo", "2007", -33.8790, 151.1990, "NSW"),
                    ("Glebe", "2037", -33.8790, 151.1870, "NSW")
                ]
                
                sydney_suburbs_query = """
                INSERT INTO cities (name, postcode, latitude, longitude, state)
                VALUES (%s, %s, %s, %s, %s);
                """
                
                cursor.executemany(sydney_suburbs_query, sydney_suburbs)

    def get_city_by_postcode(self, postcode):
        """Get city information by postcode"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
            SELECT * FROM cities WHERE postcode = %s;
            """, (postcode,))
            return cursor.fetchone()

    def get_all_cities(self):
        """Get all cities"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
            SELECT * FROM cities ORDER BY name;
            """)
            return cursor.fetchall()

    def find_cities_by_name(self, name):
        """Find cities by name"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
            SELECT * FROM cities WHERE name ILIKE %s ORDER BY name;
            """, (f'%{name}%',))
            return cursor.fetchall()

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close() 