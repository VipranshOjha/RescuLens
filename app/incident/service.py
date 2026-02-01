from app.incident.models import Incident
from app.incident.repository import incident_repository
from app.dispatch.dispatch_engine import recommend_dispatch


def create_incident(
    input_text: str,
    symptoms: list,
    triage_result: dict,
    lat: float = None,
    lon: float = None
) -> Incident:
    incident = Incident(
        input_text=input_text,
        symptoms=symptoms,
        triage_result=triage_result,
        lat=lat,
        lon=lon
    )

    incident_repository.save(incident)
    
    # Generate Dispatch Recommendation
    rec = recommend_dispatch(incident)
    if rec:
        incident.log_event("DISPATCH_RECOMMENDED", rec)
        # Update incident so recommendation persists in audit log immediately? 
        # (It's in-memory object, repository save might be needed again if we were using a real DB, 
        # but here it modifies the object reference which is stored in the list/mock DB).
    
    return incident


def confirm_dispatch(incident_id: str, dispatch_decision: dict):
    incident = incident_repository.get(incident_id)
    if not incident:
        raise ValueError("Incident not found")

    incident.dispatch_decision = dispatch_decision
    incident.dispatch_confirmed = True
    incident.status = "DISPATCH_CONFIRMED"

    incident.log_event(
        "DISPATCH_CONFIRMED",
        dispatch_decision
    )

    return incident


def override_dispatch(incident_id: str, reason: str):
    incident = incident_repository.get(incident_id)
    if not incident:
        raise ValueError("Incident not found")

    incident.dispatch_confirmed = False
    incident.status = "DISPATCH_OVERRIDDEN"
    incident.override_reason = reason

    incident.log_event(
        "DISPATCH_OVERRIDDEN",
        {"reason": reason}
    )

    return incident


def request_manual_review(incident_id: str, reason: str = "User requested review"):
    incident = incident_repository.get(incident_id)
    if not incident:
        raise ValueError("Incident not found")

    incident.status = "MANUAL_REVIEW_REQUESTED"
    
    incident.log_event(
        "MANUAL_REVIEW_REQUESTED",
        {"reason": reason}
    )

    return incident


def deny_dispatch(incident_id: str, reason: str = "User denied dispatch"):
    incident = incident_repository.get(incident_id)
    if not incident:
        raise ValueError("Incident not found")

    incident.status = "DISPATCH_DENIED"
    incident.dispatch_confirmed = False
    
    incident.log_event(
        "DISPATCH_DENIED",
        {"reason": reason}
    )

    return incident
