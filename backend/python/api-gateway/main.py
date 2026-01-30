from fastapi import FastAPI, HTTPException, Query, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from typing import Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel
import uuid
import httpx

app = FastAPI()

# ========================
# CORS
# ========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en prod pon tu dominio
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# uvicorn main:app --reload --host 0.0.0.0 --port 8000

# ========================
# CONFIG
# ========================
# N8N_BASE_URL = "http://n8n:5678/webhook"
N8N_BASE_URL = "https://n8n.petsi-dsi.website/webhook"

# ========================
# MODELS
# ========================
class ChatbotRequest(BaseModel):
    mensaje: str
    tipo_mensaje: Optional[str] = "web"
    fecha: Optional[str] = None


sesiones = {}
SESSION_TTL = timedelta(minutes=30)

# ====================
# DRIVE
# ====================
# ========================
# GET: Carpetas
# ========================
@app.get("/api/drive/folders")
async def get_folders():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/drive/folders")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Archivos por carpeta
# ====================
@app.get("/api/drive/folders/{folder_id}/files")
async def get_archivos(folder_id: str):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"{N8N_BASE_URL}/api/drive/folders/files",
                params={"folder_id": folder_id},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# CHATBOT
# ========================
@app.post("/chatbot")
async def post_chatbot(
    request: ChatbotRequest,
    id_session: Optional[str] = Cookie(None),
):
    try:
        if not id_session:
            id_session = str(uuid.uuid4())

        sesiones[id_session] = {
            "fecha_creacion": datetime.utcnow(),
            "expira": datetime.utcnow() + SESSION_TTL,
        }

        ahora = datetime.utcnow()
        for sid in list(sesiones.keys()):
            if sesiones[sid]["expira"] < ahora:
                del sesiones[sid]

        payload = {
            "mensaje": request.mensaje,
            "tipo_mensaje": request.tipo_mensaje,
            "fecha": request.fecha or datetime.utcnow().isoformat(),
            "id_session": id_session,
        }

        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(f"{N8N_BASE_URL}/chatbot", json=payload)
            r.raise_for_status()

        resp = JSONResponse(content=r.json())
        resp.set_cookie(
            key="id_session",
            value=id_session,
            max_age=1800,
            httponly=True,
            samesite="lax",
        )
        return resp

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# PRODUCTOS
# ========================
@app.get("/api/productos")
async def get_productos():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/productos")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET CITAS: 50 citas del total de citas - usando paginación
# ====================
@app.get("/api/citas")
async def get_all_citas(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"{N8N_BASE_URL}/api/citas",
                params={"limit": limit, "offset": offset},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Filtrar citas por fecha y/o estado
# ====================
@app.get("/api/citas/filtrar")
async def filter_citas(
    fecha: Optional[str] = None,
    estado: Optional[str] = None,
):
    try:
        params = {}
        if fecha:
            params["fecha"] = fecha
        if estado:
            params["estado"] = estado

        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/citas/filtrar", params=params)
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Detalle de una cita específica
# ====================
@app.get("/api/citas/{cita_id}")
async def get_cita(cita_id: str):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/citas/{cita_id}")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ====================
# GET: Citas del día de hoy
# ====================
@app.get("/api/citas/hoy")
async def get_citas_hoy():
    try:
        hoy = date.today().isoformat()

        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"{N8N_BASE_URL}/api/citas/filtrar",
                params={"fecha": hoy},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))