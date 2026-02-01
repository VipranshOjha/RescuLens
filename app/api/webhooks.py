from fastapi import APIRouter, Form, Request, HTTPException, Response
from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse
from app.medical_nlp.extractor import extract_medical_entities
from app.medical_nlp.normalizer import normalize_entities
from app.triage.triage_engine import triage
from app.incident.service import create_incident

router = APIRouter()

@router.post("/webhooks/sms")
async def handle_sms(Body: str = Form(...), From: str = Form(...)):
    """
    Handle incoming SMS from Twilio.
    """
    transcript = Body.strip()
    
    # Process the incident
    extracted = extract_medical_entities(transcript)
    normalized = normalize_entities(extracted["entities"])
    triage_result = triage(normalized["symptoms"])
    
    incident = create_incident(
        input_text=transcript,
        symptoms=normalized["symptoms"],
        triage_result=triage_result,
        # In a real app, we might use 'From' to lookup location or user
    )
    
    # Create TwiML response
    resp = MessagingResponse()
    
    if incident.urgency == "CRITICAL":
        msg = f"EMERGENCY ALERT RECEIVED. Dispatching units immediately. ID: {incident.id.split('-')[0]}"
    elif incident.urgency == "URGENT":
         msg = f"Help is on the way. Severity: High. ID: {incident.id.split('-')[0]}"
    else:
        # Check if triage_result has reasoning, otherwise provide default
        reasoning = incident.reasoning[0] if incident.reasoning else "Monitor condition"
        msg = f"Incident recorded. Advice: {reasoning}"
        
    resp.message(msg)
    
    return Response(content=str(resp), media_type="application/xml")

import os
import requests
# from openai import OpenAI
from app.core.config import settings

# client = OpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/webhooks/voice")
async def handle_voice(From: str = Form(...)):
    """
    Handle incoming Voice call. Records the call and sends for local transcription.
    """
    resp = VoiceResponse()
    resp.say("This is RescuLens 911. Please state your emergency after the beep. We are listening.")
    
    # Record the user's response
    # action: Twilio will POST to this URL when recording ends (silence or hangup)
    resp.record(
        action="/webhooks/process_recording",
        max_length=60,
        play_beep=True,
        transcribe=True,
        transcribe_callback="/webhooks/transcription"
    )
    
    return Response(content=str(resp), media_type="application/xml")

@router.post("/webhooks/process_recording")
async def handle_recording(RecordingUrl: str = Form(...), From: str = Form(...)):
    """
    Handle recording completion.
    Twilio handles transcription asynchronously, so we just acknowledge here.
    """
    print(f"Recording finished. URL: {RecordingUrl}")
    resp = MessagingResponse()
    
    # We rely on the transcription callback now.
    # Just return empty 200 OK.
    return {"status": "recording_received"}

@router.post("/webhooks/transcription")
async def handle_transcription(TranscriptionText: str = Form(...), From: str = Form(...)):
    """
    Handle incoming Transcription text from Twilio.
    """
    print(f"Received transcription for {From}: {TranscriptionText}")
    
    try:
        transcript = TranscriptionText.strip()
        if not transcript:
            print("Empty transcription received.")
            return {"status": "empty_transcription"}

        # Process the incident
        extracted = extract_medical_entities(transcript)
        normalized = normalize_entities(extracted["entities"])
        triage_result = triage(normalized["symptoms"])
        
        incident = create_incident(
            input_text=transcript,
            symptoms=normalized["symptoms"],
            triage_result=triage_result
        )
        print(f"Incident created from transcription: {incident.id}")
        
    except Exception as e:
        print(f"Error processing transcription: {e}")
        return Response(status_code=500)
        
    return {"status": "transcription_processed"}

# Deprecated/Disabled OpenAI Logic
# async def handle_recording_old(...): 

