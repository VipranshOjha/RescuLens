from typing import List, Optional
import math

class Hospital:
    def __init__(self, id: str, name: str, lat: float, lon: float, beds: int, capabilities: List[str]):
        self.id = id
        self.name = name
        self.lat = lat
        self.lon = lon
        self.beds = beds
        self.capabilities = capabilities

HOSPITALS = [
    Hospital(
        id="H1",
        name="City Trauma Center",
        lat=23.23,
        lon=77.40,
        beds=4,
        capabilities=["trauma", "cardiac", "icu"]
    ),
    Hospital(
        id="H2",
        name="Metro Cardiac Institute",
        lat=23.26,
        lon=77.43,
        beds=2,
        capabilities=["cardiac", "icu"]
    ),
    Hospital(
        id="H3",
        name="Green Valley Clinic",
        lat=23.28,
        lon=77.45,
        beds=12,
        capabilities=["general"]
    )
]

def get_hospital_by_id(hospital_id: str) -> Optional[Hospital]:
    for h in HOSPITALS:
        if h.id == hospital_id:
            return h
    return None

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Simple Euclidean distance for demo purposes; use Haversine for real apps
    return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2)

def find_nearest_hospital(lat: float, lon: float) -> Optional[Hospital]:
    if lat is None or lon is None:
        return HOSPITALS[0] # Default to main center if no location

    nearest = None
    min_dist = float('inf')

    for h in HOSPITALS:
        dist = calculate_distance(lat, lon, h.lat, h.lon)
        if dist < min_dist:
            min_dist = dist
            nearest = h
            
    return nearest
