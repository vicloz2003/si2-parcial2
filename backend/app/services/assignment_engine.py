from geopy.distance import geodesic
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentCategory
from app.models.workshop import Technician, Workshop


def find_best_workshops(incident: Incident, db: Session, max_results: int = 5) -> list[dict]:
    """
    Motor de asignacion inteligente.
    Encuentra los mejores talleres considerando:
    - Ubicacion / distancia
    - Tipo de problema
    - Disponibilidad del taller
    - Capacidad del taller
    - Rating del taller
    - Prioridad del caso
    """
    workshops = db.query(Workshop).filter(Workshop.is_available == True).all()

    candidates = []
    for workshop in workshops:
        # Verificar que el taller maneja este tipo de problema
        services = workshop.services.split(",")
        if incident.category.value not in services and "other" not in services:
            continue

        # Calcular distancia
        distance = geodesic(
            (incident.latitude, incident.longitude),
            (workshop.latitude, workshop.longitude),
        ).km

        # Verificar tecnicos disponibles
        available_technicians = (
            db.query(Technician)
            .filter(
                Technician.workshop_id == workshop.id,
                Technician.is_available == True,
            )
            .all()
        )
        if not available_technicians:
            continue

        # Filtrar tecnicos por especialidad
        matching_technicians = []
        for tech in available_technicians:
            specialties = tech.specialties.split(",")
            if incident.category.value in specialties or "other" in specialties:
                matching_technicians.append(tech)

        if not matching_technicians:
            matching_technicians = available_technicians

        # Calcular puntuacion (menor = mejor)
        score = _calculate_score(
            distance=distance,
            rating=workshop.rating,
            capacity=workshop.capacity,
            num_technicians=len(matching_technicians),
            priority=incident.priority.value,
        )

        # Encontrar tecnico mas cercano
        best_technician = None
        best_tech_distance = float("inf")
        for tech in matching_technicians:
            if tech.latitude and tech.longitude:
                tech_dist = geodesic(
                    (incident.latitude, incident.longitude),
                    (tech.latitude, tech.longitude),
                ).km
                if tech_dist < best_tech_distance:
                    best_tech_distance = tech_dist
                    best_technician = tech

        if best_technician is None:
            best_technician = matching_technicians[0]
            best_tech_distance = distance

        # Estimar tiempo de llegada (velocidad promedio 30 km/h en ciudad)
        estimated_minutes = int((best_tech_distance / 30) * 60) + 5

        candidates.append({
            "workshop_id": workshop.id,
            "workshop_name": workshop.name,
            "distance_km": round(distance, 2),
            "rating": workshop.rating,
            "score": round(score, 2),
            "estimated_arrival_minutes": estimated_minutes,
            "technician_id": best_technician.id,
            "technician_name": best_technician.name,
        })

    # Ordenar por puntuacion (menor es mejor)
    candidates.sort(key=lambda x: x["score"])
    return candidates[:max_results]


def _calculate_score(
    distance: float,
    rating: float,
    capacity: int,
    num_technicians: int,
    priority: str,
) -> float:
    """
    Calcula una puntuacion para el taller.
    Menor puntuacion = mejor candidato.
    """
    # Peso de la distancia (mas importante)
    distance_score = distance * 2.0

    # Peso del rating (invertido, mayor rating = menor score)
    rating_score = (5.0 - rating) * 1.5

    # Bonus por capacidad y tecnicos disponibles
    capacity_bonus = max(0, 5 - capacity) * 0.5
    tech_bonus = max(0, 3 - num_technicians) * 0.3

    # Factor de prioridad: para casos criticos, la distancia pesa mas
    priority_multiplier = {
        "low": 1.0,
        "medium": 1.2,
        "high": 1.5,
        "critical": 2.0,
    }.get(priority, 1.0)

    total = (distance_score * priority_multiplier) + rating_score + capacity_bonus + tech_bonus
    return total


def auto_assign_workshop(incident: Incident, db: Session) -> dict | None:
    """Asigna automaticamente el mejor taller disponible."""
    candidates = find_best_workshops(incident, db)
    if not candidates:
        return None
    return candidates[0]
