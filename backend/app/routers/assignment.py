from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident
from app.models.user import User
from app.services.assignment_engine import find_best_workshops
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


@router.post("/{incident_id}/auto-assign")
def auto_assign(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raise HTTPException(
        status_code=410,
        detail="La asignacion directa fue deshabilitada. Los talleres deben enviar ofertas y el cliente debe seleccionar una.",
    )
