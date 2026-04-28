from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident, IncidentStatus
from app.models.notification import Notification, NotificationType
from app.models.status_history import StatusHistory
from app.models.user import User, UserRole
from app.models.workshop import Technician
from app.schemas.incident import IncidentListResponse, IncidentResponse
from app.schemas.workshop import TechnicianLocationUpdate, TechnicianResponse
from app.services.notification_service import notify_user_realtime
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/technician", tags=["Tecnico"])


def get_current_technician(current_user: User, db: Session) -> Technician:
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(status_code=403, detail="Solo tecnicos pueden acceder a este recurso")

    technician = db.query(Technician).filter(Technician.user_id == current_user.id).first()
    if not technician:
        raise HTTPException(status_code=404, detail="No existe perfil tecnico asociado")
    return technician


@router.get("/me", response_model=TechnicianResponse)
def get_my_technician_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_current_technician(current_user, db)


@router.put("/location", response_model=TechnicianResponse)
def update_my_location(
    data: TechnicianLocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    technician = get_current_technician(current_user, db)
    technician.latitude = data.latitude
    technician.longitude = data.longitude
    technician.last_location_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(technician)
    active_jobs = db.query(Incident).filter(
        Incident.technician_id == technician.id,
        Incident.status.in_([IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS]),
    ).all()
    for incident in active_jobs:
        notify_user_realtime(incident.user_id, {
            "type": "technician_location_update",
            "incident_id": incident.id,
            "technician_id": technician.id,
            "technician_name": technician.name,
            "latitude": technician.latitude,
            "longitude": technician.longitude,
            "last_location_at": technician.last_location_at.isoformat() if technician.last_location_at else None,
        })
    return technician


@router.get("/jobs", response_model=list[IncidentListResponse])
def list_my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    technician = get_current_technician(current_user, db)
    return (
        db.query(Incident)
        .filter(Incident.technician_id == technician.id)
        .order_by(Incident.created_at.desc())
        .all()
    )


@router.put("/jobs/{incident_id}/status", response_model=IncidentResponse)
def update_job_status(
    incident_id: int,
    status_value: IncidentStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    technician = get_current_technician(current_user, db)
    if status_value not in {IncidentStatus.IN_PROGRESS, IncidentStatus.COMPLETED}:
        raise HTTPException(status_code=400, detail="El tecnico solo puede marcar en progreso o completado")

    incident = db.query(Incident).filter(
        Incident.id == incident_id,
        Incident.technician_id == technician.id,
    ).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")

    incident.status = status_value
    db.add(StatusHistory(
        incident_id=incident.id,
        status=status_value.value,
        changed_by=current_user.full_name,
        notes="Estado actualizado por tecnico",
    ))
    db.add(Notification(
        user_id=incident.user_id,
        incident_id=incident.id,
        title="Actualizacion del tecnico",
        message=f"El tecnico actualizo tu servicio a: {status_value.value}",
        type=NotificationType.STATUS_UPDATE,
    ))
    notify_user_realtime(incident.user_id, {
        "type": "status_update",
        "incident_id": incident.id,
        "status": status_value.value,
        "title": "Actualizacion del tecnico",
        "message": f"El tecnico actualizo tu servicio a: {status_value.value}",
    })
    db.commit()
    db.refresh(incident)
    return incident