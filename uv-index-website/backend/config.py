import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application Configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-for-testing'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:postgres@localhost/uv_index'
    UV_DATA_URL = 'https://uvdata.arpansa.gov.au/xml/uvvalues.xml'
    # Default cache time for UV data (seconds)
    UV_DATA_CACHE_TIME = 1800  # 30 minutes 