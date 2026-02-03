from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.webhooks import router as webhook_router
from app.simulation import run_simulation

app = FastAPI(title="T.A.L.O.N.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router)
app.include_router(webhook_router)


@app.post("/simulate")
def simulate_load(cases: int = 10):
    return run_simulation(cases)
