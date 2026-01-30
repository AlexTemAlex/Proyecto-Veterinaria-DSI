from fastapi import FastAPI, HTTPException, Query, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import requests
from typing import Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel
import uuid

app = FastAPI()

# Permitir requests desde tu frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar por tu dominio en producción
    allow_methods=["*"],
    allow_headers=["*"],
)
# uvicorn main:app --reload --host 0.0.0.0 --port 8000

# N8N_BASE_URL = "http://n8n:5678/webhook"
N8N_BASE_URL = "https://n8n.petsi-dsi.website/webhook"
# ====================
# GET: Carpetas
# ====================
@app.get("/api/drive/carpetas")
def get_folders():
    try:
        response = requests.get(f"{N8N_BASE_URL}/api/drive/carpetas", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Archivos por carpeta
# ====================
@app.get("/api/drive/filtrar/{folder_id}")
def get_archivos(folder_id: str):
    try:
        response = requests.get(f"{N8N_BASE_URL}/api/drive/filtrar/", params={"folder_id": folder_id}, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# POST: Webhook genérico
# ====================
# Modelo para validar el request
class ChatbotRequest(BaseModel):
    mensaje: str
    tipo_mensaje: Optional[str] = "web"
    fecha: Optional[str] = None

# Diccionario temporal para sesiones (opcional)
sesiones = {}
SESSION_TTL = timedelta(minutes=30)

@app.post("/chatbot")
def post_chatbot(
    request: ChatbotRequest,
    id_session: Optional[str] = Cookie(None)  # recibimos la cookie si existe
):
    try:
        # Si no hay cookie, generamos un id_session nuevo
        if not id_session:
            id_session = str(uuid.uuid4())
        
        # Guardamos la sesión en memoria con TTL
        sesiones[id_session] = {
            "fecha_creacion": datetime.utcnow(),
            "expira": datetime.utcnow() + SESSION_TTL
        }

        # Limpiar sesiones expiradas
        ahora = datetime.utcnow()
        for sid in list(sesiones.keys()):
            if sesiones[sid]["expira"] < ahora:
                del sesiones[sid]

        # Preparar payload para n8n
        payload = {
            "mensaje": request.mensaje,
            "tipo_mensaje": request.tipo_mensaje,
            "fecha": request.fecha or datetime.utcnow().isoformat(),
            "id_session": id_session
        }

        response = requests.post(f"{N8N_BASE_URL}/chatbot/", json=payload, timeout=5)
        response.raise_for_status()

        # Devolver respuesta con cookie de 30 minutos
        resp = JSONResponse(content={"respuesta": response.text})
        resp.set_cookie(
            key="id_session",
            value=id_session,
            max_age=30*60,       # 30 minutos
            expires=30*60,
            httponly=True,       # no accesible desde JS (seguridad)
            samesite="lax"       # evita CSRF en otros sitios
        )
        return resp

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
# ====================
# GET: Productos
# ====================
@app.get("/api/productos")
def get_archivos(folder_id: str):
    try:
        response = requests.get(f"{N8N_BASE_URL}/api/productos/", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: 50 citas del total de citas - usando paginación
# ====================
@app.get("/api/citas")
def get_all_citas(
    limit: int = Query(50, ge=1, le=500, description="Cantidad máxima de citas a devolver"),
    offset: int = Query(0, ge=0, description="Número de citas a saltar")
):
    try:
        params = {"limit": limit, "offset": offset}
        response = requests.get(f"{N8N_BASE_URL}/api/citas/", params=params, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Filtrar citas por fecha y/o estado
# ====================
@app.get("/api/citas/filtrar")
def filter_citas(
    fecha: Optional[str] = Query(None, description="Fecha en formato YYYY-MM-DD"),
    estado: Optional[str] = Query(None, description="Estado de la cita")
):
    """
    Filtra citas por fecha, estado o ambos.
    """
    try:
        params = {}
        if fecha:
            params["fecha"] = fecha
        if estado:
            params["estado"] = estado

        response = requests.get(f"{N8N_BASE_URL}/api/citas/filtrar", params=params, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Detalle de una cita específica
# ====================
@app.get("/api/citas/{cita_id}")
def get_cita(cita_id: str):
    try:
        response = requests.get(f"{N8N_BASE_URL}/api/citas/{cita_id}", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ====================
# GET: Citas del día de hoy
# ====================
@app.get("/api/citas/hoy")
def get_citas_hoy():
    try:
        # Obtener la fecha de hoy en formato YYYY-MM-DD
        hoy = date.today().isoformat()
        params = {"fecha": hoy}  # n8n debe poder filtrar por fecha

        response = requests.get(f"{N8N_BASE_URL}/api/citas/filtrar", params=params, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))