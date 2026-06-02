"""Calculo de KPIs (indicadores) sobre incidentes.

Todas las funciones aceptan un tenant_id opcional: si se pasa, los KPIs se
calculan solo para ese taller (tenant); si es None, son globales (plataforma).
Tambien aceptan un rango de fechas opcional sobre incident.created_at.
"""
from datetime import datetime

from sqlalchemy import Numeric, func
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentStatus
from app.models.sla import ServiceCategorySLA
from app.models.workshop import Workshop


def _scope(query, tenant_id: int | None, date_from: datetime | None, date_to: datetime | None):
    if tenant_id is not None:
        query = query.filter(Incident.tenant_id == tenant_id)
    if date_from is not None:
        query = query.filter(Incident.created_at >= date_from)
    if date_to is not None:
        query = query.filter(Incident.created_at <= date_to)
    return query


def _avg_minutes(db, start_col, end_col, tenant_id, date_from, date_to) -> float | None:
    seconds = _scope(
        db.query(func.avg(func.extract("epoch", end_col - start_col))),
        tenant_id, date_from, date_to,
    ).filter(start_col.isnot(None), end_col.isnot(None)).scalar()
    return round(seconds / 60, 2) if seconds is not None else None


def avg_assignment_minutes(db: Session, tenant_id=None, date_from=None, date_to=None) -> float | None:
    """Tiempo promedio de asignacion: desde que se crea hasta que se asigna taller."""
    return _avg_minutes(db, Incident.created_at, Incident.assigned_at, tenant_id, date_from, date_to)


def avg_arrival_minutes(db: Session, tenant_id=None, date_from=None, date_to=None) -> float | None:
    """Tiempo promedio de llegada: desde la asignacion hasta que llega el tecnico."""
    return _avg_minutes(db, Incident.assigned_at, Incident.arrived_at, tenant_id, date_from, date_to)


def incidents_by_category(db: Session, tenant_id=None, date_from=None, date_to=None) -> list[dict]:
    """Tipos de incidentes mas frecuentes."""
    rows = _scope(
        db.query(Incident.category, func.count(Incident.id)),
        tenant_id, date_from, date_to,
    ).group_by(Incident.category).order_by(func.count(Incident.id).desc()).all()
    return [{"category": cat.value, "count": count} for cat, count in rows]


def top_efficient_workshops(db: Session, tenant_id=None, date_from=None, date_to=None, limit: int = 5) -> list[dict]:
    """Talleres mas eficientes: por servicios completados y tiempo de atencion."""
    completion = func.avg(func.extract("epoch", Incident.completed_at - Incident.assigned_at))
    q = (
        db.query(
            Workshop.id,
            Workshop.name,
            Workshop.rating,
            func.count(Incident.id).label("completed"),
            completion.label("avg_completion_s"),
        )
        .join(Incident, Incident.workshop_id == Workshop.id)
        .filter(Incident.status == IncidentStatus.COMPLETED)
    )
    if tenant_id is not None:
        q = q.filter(Incident.tenant_id == tenant_id)
    if date_from is not None:
        q = q.filter(Incident.created_at >= date_from)
    if date_to is not None:
        q = q.filter(Incident.created_at <= date_to)
    rows = (
        q.group_by(Workshop.id, Workshop.name, Workshop.rating)
        .order_by(func.count(Incident.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "workshop_id": wid,
            "workshop_name": name,
            "rating": round(rating or 0, 2),
            "completed": completed,
            "avg_completion_min": round(avg_s / 60, 2) if avg_s is not None else None,
        }
        for wid, name, rating, completed, avg_s in rows
    ]


def incidents_by_zone(db: Session, tenant_id=None, date_from=None, date_to=None, limit: int = 10) -> list[dict]:
    """Zonas con mas incidencias (celdas de ~1 km redondeando lat/lng)."""
    lat_cell = func.round(func.cast(Incident.latitude, Numeric), 2)
    lng_cell = func.round(func.cast(Incident.longitude, Numeric), 2)
    rows = _scope(
        db.query(lat_cell, lng_cell, func.count(Incident.id)),
        tenant_id, date_from, date_to,
    ).group_by(lat_cell, lng_cell).order_by(func.count(Incident.id).desc()).limit(limit).all()
    return [
        {"latitude": float(lat), "longitude": float(lng), "count": count}
        for lat, lng, count in rows
    ]


def cancelled_stats(db: Session, tenant_id=None, date_from=None, date_to=None) -> dict:
    """Casos cancelados: cantidad, ratio sobre el total y motivos."""
    total = _scope(db.query(func.count(Incident.id)), tenant_id, date_from, date_to).scalar() or 0
    cancelled = _scope(
        db.query(func.count(Incident.id)), tenant_id, date_from, date_to
    ).filter(Incident.status == IncidentStatus.CANCELLED).scalar() or 0
    reasons = _scope(
        db.query(Incident.cancel_reason, func.count(Incident.id)),
        tenant_id, date_from, date_to,
    ).filter(Incident.status == IncidentStatus.CANCELLED).group_by(Incident.cancel_reason).all()
    return {
        "total_incidents": total,
        "cancelled": cancelled,
        "cancellation_rate": round(cancelled / total, 4) if total else 0.0,
        "reasons": [{"reason": r or "Sin motivo", "count": c} for r, c in reasons],
    }


def sla_compliance(db: Session, tenant_id=None, date_from=None, date_to=None) -> dict:
    """Servicios atendidos dentro del tiempo esperado (SLA de llegada por categoria)."""
    # Mapa categoria -> minutos esperados de llegada (override por tenant > global).
    sla_map: dict[str, int] = {}
    globals_q = db.query(ServiceCategorySLA).filter(ServiceCategorySLA.tenant_id.is_(None)).all()
    for s in globals_q:
        sla_map[s.category] = s.expected_arrival_min
    if tenant_id is not None:
        for s in db.query(ServiceCategorySLA).filter(ServiceCategorySLA.tenant_id == tenant_id).all():
            sla_map[s.category] = s.expected_arrival_min

    rows = _scope(
        db.query(Incident.category, Incident.assigned_at, Incident.arrived_at),
        tenant_id, date_from, date_to,
    ).filter(Incident.assigned_at.isnot(None), Incident.arrived_at.isnot(None)).all()

    measured = 0
    within = 0
    for category, assigned_at, arrived_at in rows:
        expected = sla_map.get(category.value)
        if expected is None:
            continue
        measured += 1
        arrival_min = (arrived_at - assigned_at).total_seconds() / 60
        if arrival_min <= expected:
            within += 1
    return {
        "measured": measured,
        "within_sla": within,
        "compliance_rate": round(within / measured, 4) if measured else None,
    }


def status_breakdown(db: Session, tenant_id=None, date_from=None, date_to=None) -> list[dict]:
    """Distribucion de incidentes por estado (apoyo para dashboards)."""
    rows = _scope(
        db.query(Incident.status, func.count(Incident.id)),
        tenant_id, date_from, date_to,
    ).group_by(Incident.status).all()
    return [{"status": st.value, "count": count} for st, count in rows]


def build_summary(db: Session, tenant_id=None, date_from=None, date_to=None) -> dict:
    """Todos los KPIs en una sola respuesta lista para dashboards."""
    return {
        "scope": "tenant" if tenant_id is not None else "global",
        "tenant_id": tenant_id,
        "avg_assignment_min": avg_assignment_minutes(db, tenant_id, date_from, date_to),
        "avg_arrival_min": avg_arrival_minutes(db, tenant_id, date_from, date_to),
        "incidents_by_category": incidents_by_category(db, tenant_id, date_from, date_to),
        "top_workshops": top_efficient_workshops(db, tenant_id, date_from, date_to),
        "zones": incidents_by_zone(db, tenant_id, date_from, date_to),
        "cancelled": cancelled_stats(db, tenant_id, date_from, date_to),
        "sla": sla_compliance(db, tenant_id, date_from, date_to),
        "status_breakdown": status_breakdown(db, tenant_id, date_from, date_to),
    }
