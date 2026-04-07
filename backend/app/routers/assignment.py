from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident, IncidentStatus
from app.models.notification import Notification, NotificationType
from app.models.status_history import StatusHistory
from app.models.user import User, UserRole
from app.models.workshop import Workshop
from app.schemas.incident import IncidentResponse
from app.services.assignment_engine import auto_assign_workshop, find_best_workshops
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/assignment", tags=["Asignacion"])


@router.get("/{incident_id}/candidates")
def get_candidates(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    candidates = find_best_workshops(incident, db)
    return {"incident_id": incident_id, "candidates": candidates}


@router.post("/{incident_id}/auto-assign", response_model=IncidentResponse)
def auto_assign(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    if incident.status != IncidentStatus.PENDING:
        raise HTTPException(status_code=400, detail="El incidente ya fue asignado")

    result = auto_assign_workshop(incident, db)
    if not result:
        raise HTTPException(status_code=404, detail="No hay talleres disponibles")

    incident.workshop_id = result["workshop_id"]
    incident.technician_id = result["technician_id"]
    incident.status = IncidentStatus.ASSIGNED
    incident.estimated_arrival = result["estimated_arrival_minutes"]

    workshop = db.query(Workshop).filter(Workshop.id == result["workshop_id"]).first()

    history = StatusHistory(
        incident_id=incident.id,
        status=IncidentStatus.ASSIGNED.value,
        changed_by="Sistema de asignacion automatica",
        notes=f"Asignado a: {result['workshop_name']} (tecnico: {result['technician_name']})",
    )
    db.add(history)

    # Notificar al cliente
    notification_client = Notification(
        user_id=incident.user_id,
        incident_id=incident.id,
        title="Taller asignado",
        message=f"Se ha asignado el taller {result['workshop_name']}. Tiempo estimado: {result['estimated_arrival_minutes']} min",
        type=NotificationType.INCIDENT_ASSIGNED,
    )
    db.add(notification_client)

    # Notificar al taller
    if workshop:
        notification_workshop = Notification(
            user_id=workshop.user_id,
            incident_id=incident.id,
            title="Nueva solicitud asignada",
            message=f"Se le ha asignado un nuevo incidente de tipo: {incident.category.value}",
            type=NotificationType.NEW_INCIDENT,
        )
        db.add(notification_workshop)

    db.commit()
    db.refresh(incident)
    return incident
