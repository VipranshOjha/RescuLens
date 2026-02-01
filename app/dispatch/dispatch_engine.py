from app.dispatch.hospitals import find_nearest_hospital

def recommend_dispatch(incident):
    """
    Analyzing incident to recommend dispatch resources.
    """
    if not incident.dispatch_required:
        return None
    
    # Locate nearest hospital
    # Using defaults if incident has no location (simulated 23.25, 77.42)
    lat = incident.lat or 23.25
    lon = incident.lon or 77.42
    
    hospital = find_nearest_hospital(lat, lon)
    
    return {
        "unit_type": "ALS Ambulance" if incident.urgency == "CRITICAL" else "BLS Ambulance",
        "hospital": hospital.name,
        "hospital_id": hospital.id,
        "eta_minutes": 12 # Simulated
    }
