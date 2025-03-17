class City:
    def __init__(self, id, name, postcode, latitude, longitude, state, created_at=None):
        self.id = id
        self.name = name
        self.postcode = postcode
        self.latitude = latitude
        self.longitude = longitude
        self.state = state
        self.created_at = created_at

    @classmethod
    def from_db_row(cls, row):
        """Create City object from database row"""
        if not row:
            return None
        return cls(
            id=row['id'],
            name=row['name'],
            postcode=row['postcode'],
            latitude=row['latitude'],
            longitude=row['longitude'],
            state=row['state'],
            created_at=row['created_at']
        )

    def to_dict(self):
        """Convert City object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'postcode': self.postcode,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'state': self.state,
            'created_at': str(self.created_at) if self.created_at else None
        } 