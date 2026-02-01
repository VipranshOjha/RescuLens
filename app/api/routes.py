from fastapi import APIRouter, HTTPException

from typing import List
from app.api.schemas import AnalyzeRequest, AnalyzeResponse, IncidentResponse
from app.medical_nlp.extractor import extract_medical_entities
from app.medical_nlp.normalizer import normalize_entities
from app.triage.triage_engine import triage
from app.incident.service import create_incident, confirm_dispatch, request_manual_review, deny_dispatch
from app.incident.repository import incident_repository

router = APIRouter()


@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents():
    return incident_repository.all()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_incident(request: AnalyzeRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    extracted = extract_medical_entities(text)
    normalized = normalize_entities(extracted["entities"])
    triage_result = triage(normalized["symptoms"])

    incident = create_incident(
        input_text=text,
        symptoms=normalized["symptoms"],
        triage_result=triage_result
    )

    return {
        "incident_id": incident.id,
        "symptoms": incident.symptoms,
        "urgency": incident.urgency,
        "dispatch_required": incident.dispatch_required,
        "reasoning": incident.reasoning
    }

@router.get("/incident/{incident_id}")
def get_incident(incident_id: str):
    incident = incident_repository.get(incident_id)

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    return {
        "id": incident.id,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
        "input_text": incident.input_text,
        "symptoms": incident.symptoms,
        "urgency": incident.urgency,
        "dispatch_required": incident.dispatch_required,
        "status": incident.status,
        "reasoning": incident.reasoning,
        "audit_log": incident.audit_log
    }

@router.post("/incidents/{incident_id}/dispatch")
def dispatch_incident(incident_id: str):
    try:
        # For this demo, we can just assume a standard dispatch decision 
        # or grab the last recommendation from the log.
        # But to keep it simple, we'll confirm with a generic decision.
        
        # In a real flow, the frontend sends the confirmed hospital/unit.
        decision = {
            "status": "CONFIRMED",
            "timestamp": "now"
        }
        
        incident = confirm_dispatch(incident_id, decision)
        return incident.dispatch_confirmed
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/incidents/{incident_id}/review")
def review_incident(incident_id: str):
    try:
        incident = request_manual_review(incident_id)
        return {"status": incident.status}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/incidents/{incident_id}/deny")
def deny_incident_dispatch(incident_id: str):
    try:
        incident = deny_dispatch(incident_id)
        return {"status": incident.status}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
