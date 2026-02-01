# from fastapi.security import OAuth2PasswordBearer
# from passlib.context import CryptContext
# from jose import jwt, JWTError
# from datetime import datetime, timedelta
# from dotenv import load_dotenv
# from fastapi import APIRouter, Depends, HTTPException, Form
# from sqlalchemy import create_engine, Column, Integer, String, Boolean
# from sqlalchemy.orm import sessionmaker, Session, declarative_base
# import os
# import hashlib

# # =====================
# # ENV
# # =====================
# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")
# SECRET_KEY = os.getenv("SECRET_KEY", "secret-demo-key")
# ALGORITHM = os.getenv("ALGORITHM", "HS256")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# # =====================
# router = APIRouter()

# pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# # ======================================================
# # 🚧 POSTGRES
# # ======================================================
# engine = create_engine(DATABASE_URL, pool_pre_ping=True)
# SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
# Base = declarative_base()

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True, nullable=False)
#     full_name = Column(String, nullable=False)
#     hashed_password = Column(String, nullable=False)
#     active = Column(Boolean, default=True)

# Base.metadata.create_all(bind=engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # ======================================================
# # 🔐 PASSWORD FUNCTIONS
# # ======================================================
# def _digest(password: str) -> bytes:
#     return hashlib.sha256(password.encode("utf-8")).digest()

# def hash_password(password: str) -> str:
#     return pwd_context.hash(_digest(password))

# def verify_password(password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(_digest(password), hashed_password)

# # ======================================================
# def create_access_token(data: dict):
#     expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode = data.copy()
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# def authenticate(db: Session, username: str, password: str):
#     user = db.query(User).filter(User.username == username).first()
#     if not user:
#         return None
#     if not verify_password(password, user.hashed_password):
#         return None
#     return user

# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db),
# ):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username = payload.get("sub")
#         if username is None:
#             raise HTTPException(status_code=401, detail="Token inválido")
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Token inválido")

#     user = db.query(User).filter(User.username == username).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="Usuario no existe")

#     return user

# # =====================
# @router.post("/register")
# def register(
#     username: str = Form(...),
#     full_name: str = Form(...),
#     password: str = Form(...),
#     db: Session = Depends(get_db),
# ):
#     if db.query(User).filter(User.username == username).first():
#         raise HTTPException(400, "Usuario ya existe")

#     user = User(
#         username=username,
#         full_name=full_name,
#         hashed_password=hash_password(password),
#     )

#     db.add(user)
#     db.commit()
#     db.refresh(user)

#     return {"message": "Usuario creado"}

# # =====================
# @router.post("/login")
# def login(
#     username: str = Form(...),
#     password: str = Form(...),
#     db: Session = Depends(get_db),
# ):
#     user = authenticate(db, username, password)
#     if not user:
#         raise HTTPException(400, "Credenciales incorrectas")

#     token = create_access_token({"sub": user.username})

#     return {
#         "access_token": token,
#         "token_type": "bearer",
#         "user": {
#             "id": user.id,
#             "username": user.username,
#             "full_name": user.full_name,
#         },
#     }

# # =====================
# @router.get("/secure")
# def secure(user: User = Depends(get_current_user)):
#     return {"msg": f"Hola {user.username}"}

from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Form
import os
import hashlib

# =====================
# ENV
# =====================
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "secret-demo-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

router = APIRouter()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ======================================================
# 🔧 USUARIOS DE PRUEBA (SIMULADOS)
# ======================================================

def _digest(password: str) -> bytes:
    return hashlib.sha256(password.encode("utf-8")).digest()

def hash_password(password: str) -> str:
    return pwd_context.hash(_digest(password))

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_digest(password), hashed_password)

fake_users_db = {
    "admin@gmail.com": {
        "id": 1,
        "username": "admin@gmail.com",
        "full_name": "Administrador PETSI",
        "hashed_password": hash_password("123456"),
        "active": True,
    },
    "alexis@gmail.com": {
        "id": 2,
        "username": "alexis@gmail.com",
        "full_name": "Alexis Chiluisa",
        "hashed_password": hash_password("password"),
        "active": True,
    },
}


# ======================================================

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate(username: str, password: str):
    print("👉 Username recibido:", username)
    print("👉 Password recibido:", password)

    user = fake_users_db.get(username)
    if not user:
        print("❌ Usuario no existe")
        return None

    if not verify_password(password, user["hashed_password"]):
        print("❌ Password incorrecto")
        return None

    print("✅ Usuario autenticado")
    return user

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = fake_users_db.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no existe")

    return user

# =====================
@router.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
):
    print("📩 LLEGÓ REQUEST LOGIN")
    user = authenticate(username, password)

    if not user:
        raise HTTPException(400, "Credenciales incorrectas")

    token = create_access_token({"sub": user["username"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
        },
    }

# =====================
@router.get("/secure")
def secure(user: dict = Depends(get_current_user)):
    return {"msg": f"Hola {user['username']}"}
