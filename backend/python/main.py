from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import auth
import n8n

app = FastAPI()

# ========================
# CORS
# ========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    #allow_origins=["https://petsi-dsi.website"]
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(n8n.router, prefix="/api", tags=["n8n"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
