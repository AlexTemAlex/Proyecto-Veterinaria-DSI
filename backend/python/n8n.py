from fastapi import APIRouter, HTTPException, Query, Cookie, Form, UploadFile, File
from fastapi.responses import JSONResponse

from typing import Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel
import uuid
import httpx

router = APIRouter()

# ========================
# CONFIG
# ========================
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
# =================================
# DRIVE
# =================================
# ========================
# GET: Lista de carpetas
# ========================
@router.get("/drive/folders")
async def get_folders():
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/drive/folders")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# POST: Crear carpeta
# ========================
@router.post("/drive/folders")
async def create_folder(name: str = Form(...)):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.post(
                f"{N8N_BASE_URL}/api/drive/folders",
                json={"name": name},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# PUT: Renombrar carpeta
# =======================
@router.put("/drive/folder/rename")
async def rename_folder(folder_id: str = Form(...), new_name: str = Form(...)):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.put(
                f"{N8N_BASE_URL}/api/drive/folder/rename",
                json={"folder_id": folder_id, "new_name": new_name},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# DELETE: Eliminar carpeta
# =======================
@router.delete("/drive/folder")
async def delete_folder(folder_id: str):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.delete(
                f"{N8N_BASE_URL}/api/drive/folder",
                params={"folder_id": folder_id},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET: Listar archivos por carpeta
# ====================
@router.get("/drive/folders/{folder_id}/files")
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
# POST: Subir archivo limite 100MB
# =======================
@router.post("/drive/files/upload")
async def upload_file(
    folder_id: str = Form(...),
    file: UploadFile = File(...),
):
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

    try:
        file_contents = await file.read()
        if len(file_contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="El archivo supera el límite de 100 MB")

        # Enviar archivo real + folder_id al webhook de n8n
        files = {
            "file": (file.filename, file_contents, file.content_type),
            "folder_id": (None, folder_id),
        }

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{N8N_BASE_URL}/api/drive/files/upload",
                files=files,
            )
            r.raise_for_status()
            return r.json()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# PUT: Renombrar archivo
# =======================
@router.put("/drive/file/rename")
async def rename_file(file_id: str = Form(...), new_name: str = Form(...)):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.put(
                f"{N8N_BASE_URL}/api/drive/file/rename",
                json={"file_id": file_id, "new_name": new_name},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# DELETE: Eliminar archivo
# =======================
@router.delete("/drive/file")
async def delete_file(file_id: str):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.delete(
                f"{N8N_BASE_URL}/api/drive/file",
                params={"file_id": file_id},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# GET: Obtener link de descarga - archivo
# =======================
@router.get("/drive/file/download")
async def get_download_link(file_id: str):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{N8N_BASE_URL}/api/drive/file/download",
                params={"file_id": file_id},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# PRODUCTOS
# ========================
@router.get("/drive/products")
async def get_productos():
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/drive/products")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/drive/total/products")
async def get_productos():
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{N8N_BASE_URL}/api/drive/total/products")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================
# GET CITAS: 50 citas del total de citas - usando paginación
# ====================
@router.get("/citas")
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
@router.get("/citas/filtrar")
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
@router.get("/citas/{cita_id}")
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
@router.get("/citas/hoy")
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

# =================================
# WEB - Pagina
# =================================
# ========================
# CHATBOT
# ========================
@router.post("/web/chatbot")
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
