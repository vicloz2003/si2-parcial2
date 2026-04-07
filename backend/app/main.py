from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import assignment, auth, incidents, notifications, payments, users, vehicles, workshops

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plataforma de Emergencias Vehiculares",
    description="API para la gestion inteligente de emergencias vehiculares",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos subidos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Registrar routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(workshops.router)
app.include_router(incidents.router)
app.include_router(assignment.router)
app.include_router(payments.router)
app.include_router(notifications.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Plataforma Inteligente de Emergencias Vehiculares",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "ok"}
