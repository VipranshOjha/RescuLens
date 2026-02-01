from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    incident_id: str
    symptoms: List[str]
    urgency: str
    dispatch_required: bool
    reasoning: List[str]


class IncidentResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    input_text: str
    symptoms: List[str]
    urgency: str
    dispatch_required: bool
    dispatch_confirmed: bool = False
    dispatch_decision: Optional[Dict[str, Any]] = None
    status: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    reasoning: List[str]
    audit_log: List[Dict[str, Any]]
