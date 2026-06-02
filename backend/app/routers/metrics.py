from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.services import metrics_service
from app.utils.security import get_current_user
from app.utils.tenancy import get_user_workshop

router = APIRouter(prefix="/api/metrics", tags=["KPIs"])


def _resolve_scope(current_user: User, db: Session, tenant_id: int | None) -> int | None:
    """Determina el tenant_id efectivo segun el rol.

    - ADMIN: global (tenant_id None) o el tenant que pida via query param.
    - WORKSHOP: forzado a su propio tenant (ignora el query param).
    - Otros: 403.
    """
    if current_user.role == UserRole.ADMIN:
        return tenant_id  # None = global
    if current_user.role == UserRole.WORKSHOP:
        workshop = get_user_workshop(db, current_user)
        if not workshop:
            raise HTTPException(status_code=404, detail="No tiene taller registrado")
        return workshop.tenant_id
    raise HTTPException(status_code=403, detail="No tiene permisos para ver metricas")


@router.get("/summary")
def metrics_summary(
    tenant_id: int | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Todos los KPIs en una respuesta lista para dashboards (global o por taller)."""
    scope_tenant = _resolve_scope(current_user, db, tenant_id)
    return metrics_service.build_summary(db, scope_tenant, date_from, date_to)
