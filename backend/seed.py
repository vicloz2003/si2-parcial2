import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import inspect, text

from app.database import Base, SessionLocal, engine
from app.models import (
    ChatMessage,
    Evidence,
    EvidenceType,
    Incident,
    IncidentCategory,
    IncidentPriority,
    IncidentStatus,
    Notification,
    NotificationType,
    Payment,
    PaymentCard,
    PaymentStatus,
    InvitationStatus,
    Review,
    OfferStatus,
    ServiceCategorySLA,
    ServiceOffer,
    StatusHistory,
    Technician,
    Tenant,
    User,
    UserRole,
    Vehicle,
    Workshop,
    WorkshopInvitation,
)
from app.utils.security import hash_password


DEFAULT_PASSWORD = "12345678*"
PASSWORD_HASH = hash_password(DEFAULT_PASSWORD)


def sync_missing_columns() -> None:
    inspector = inspect(engine)
    dialect = engine.dialect

    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue

            existing_columns = {column["name"] for column in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing_columns or column.primary_key:
                    continue

                column_type = column.type.compile(dialect=dialect)
                conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {column_type}'))


def sync_postgres_enums() -> None:
    if engine.dialect.name != "postgresql":
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'TECHNICIAN'"))


def get_or_create_tenant(db, name: str, slug: str, contact_phone: str) -> Tenant:
    """Crea (o actualiza) el Tenant 1:1 de un taller."""
    tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
    if tenant:
        tenant.name = name
        tenant.contact_phone = contact_phone
        tenant.is_active = True
        return tenant

    tenant = Tenant(name=name, slug=slug, contact_phone=contact_phone, is_active=True)
    db.add(tenant)
    db.flush()
    return tenant


def get_or_create_user(
    db, email: str, full_name: str, phone: str, role: UserRole, tenant_id: int | None = None
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.password_hash = PASSWORD_HASH
        user.full_name = full_name
        user.phone = phone
        user.role = role
        user.is_active = True
        user.tenant_id = tenant_id
        return user

    user = User(
        email=email,
        password_hash=PASSWORD_HASH,
        full_name=full_name,
        phone=phone,
        role=role,
        is_active=True,
        tenant_id=tenant_id,
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_workshop(
    db,
    user: User,
    tenant_id: int,
    name: str,
    address: str,
    latitude: float,
    longitude: float,
    phone: str,
    services: str,
    capacity: int,
    rating: float,
    total_ratings: int,
    description: str,
) -> Workshop:
    workshop = db.query(Workshop).filter(Workshop.user_id == user.id).first()
    if workshop:
        workshop.tenant_id = tenant_id
        workshop.name = name
        workshop.address = address
        workshop.latitude = latitude
        workshop.longitude = longitude
        workshop.phone = phone
        workshop.services = services
        workshop.capacity = capacity
        workshop.rating = rating
        workshop.total_ratings = total_ratings
        workshop.is_available = True
        workshop.description = description
        return workshop

    workshop = Workshop(
        tenant_id=tenant_id,
        user_id=user.id,
        name=name,
        description=description,
        address=address,
        latitude=latitude,
        longitude=longitude,
        phone=phone,
        services=services,
        capacity=capacity,
        rating=rating,
        total_ratings=total_ratings,
        commission_rate=0.10,
        is_available=True,
    )
    db.add(workshop)
    db.flush()
    return workshop


def get_or_create_technician(
    db,
    workshop: Workshop,
    user: User,
    name: str,
    phone: str,
    specialties: str,
    latitude: float,
    longitude: float,
) -> Technician:
    technician = (
        db.query(Technician)
        .filter(Technician.workshop_id == workshop.id, Technician.phone == phone)
        .first()
    )
    if technician:
        technician.tenant_id = workshop.tenant_id
        technician.user_id = user.id
        technician.name = name
        technician.specialties = specialties
        technician.latitude = latitude
        technician.longitude = longitude
        technician.is_available = True
        return technician

    technician = Technician(
        tenant_id=workshop.tenant_id,
        workshop_id=workshop.id,
        user_id=user.id,
        name=name,
        phone=phone,
        specialties=specialties,
        latitude=latitude,
        longitude=longitude,
        is_available=True,
    )
    db.add(technician)
    db.flush()
    return technician


def get_or_create_vehicle(
    db,
    user: User,
    brand: str,
    model: str,
    year: int,
    color: str,
    plate_number: str,
) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plate_number).first()
    if vehicle:
        vehicle.user_id = user.id
        vehicle.brand = brand
        vehicle.model = model
        vehicle.year = year
        vehicle.color = color
        return vehicle

    vehicle = Vehicle(
        user_id=user.id,
        brand=brand,
        model=model,
        year=year,
        color=color,
        plate_number=plate_number,
    )
    db.add(vehicle)
    db.flush()
    return vehicle


_CANCEL_REASONS = [
    "El cliente resolvio el problema por su cuenta",
    "Ningun taller acepto a tiempo",
    "El cliente cancelo por demora",
    "Datos del vehiculo incorrectos",
]


def _apply_timeline(incident: Incident, status: IncidentStatus) -> None:
    """Setea los timestamps de ciclo de vida coherentes con el estado (para KPIs).

    Algunos servicios superan el SLA de llegada a proposito, para que el KPI de
    cumplimiento no sea 100%.
    """
    base = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 240))
    incident.created_at = base
    incident.assigned_at = None
    incident.en_route_at = None
    incident.arrived_at = None
    incident.completed_at = None
    incident.cancelled_at = None
    incident.cancel_reason = None

    if status in {IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.COMPLETED}:
        incident.assigned_at = base + timedelta(minutes=random.randint(3, 14))
        incident.en_route_at = incident.assigned_at + timedelta(minutes=random.randint(1, 4))
    if status in {IncidentStatus.IN_PROGRESS, IncidentStatus.COMPLETED}:
        # ~30% de los casos llegan tarde (sobre 40 min).
        arrival_delta = random.randint(12, 28) if random.random() > 0.3 else random.randint(45, 70)
        incident.arrived_at = incident.assigned_at + timedelta(minutes=arrival_delta)
    if status == IncidentStatus.COMPLETED:
        incident.completed_at = incident.arrived_at + timedelta(minutes=random.randint(25, 70))
    if status == IncidentStatus.CANCELLED:
        incident.cancelled_at = base + timedelta(minutes=random.randint(5, 30))
        incident.cancel_reason = random.choice(_CANCEL_REASONS)


def get_or_create_incident(
    db,
    user: User,
    vehicle: Vehicle,
    description: str,
    category: IncidentCategory,
    priority: IncidentPriority,
    status: IncidentStatus,
    latitude: float,
    longitude: float,
    address: str,
    workshop: Workshop | None = None,
    technician: Technician | None = None,
    final_cost: float | None = None,
) -> Incident:
    incident = (
        db.query(Incident)
        .filter(Incident.user_id == user.id, Incident.description == description)
        .first()
    )
    if incident:
        incident.vehicle_id = vehicle.id
        incident.tenant_id = workshop.tenant_id if workshop else None
        incident.workshop_id = workshop.id if workshop else None
        incident.technician_id = technician.id if technician else None
        incident.category = category
        incident.priority = priority
        incident.status = status
        incident.latitude = latitude
        incident.longitude = longitude
        incident.address = address
        incident.final_cost = final_cost
        incident.commission_amount = round(final_cost * 0.10, 2) if final_cost else None
        _apply_timeline(incident, status)
        return incident

    incident = Incident(
        user_id=user.id,
        vehicle_id=vehicle.id,
        tenant_id=workshop.tenant_id if workshop else None,
        workshop_id=workshop.id if workshop else None,
        technician_id=technician.id if technician else None,
        category=category,
        priority=priority,
        status=status,
        description=description,
        ai_summary="Caso demo generado por seed para probar el panel.",
        ai_diagnosis="Clasificacion inicial sugerida por IA segun descripcion y evidencia.",
        latitude=latitude,
        longitude=longitude,
        address=address,
        estimated_arrival=22 if workshop else None,
        final_cost=final_cost,
        commission_amount=round(final_cost * 0.10, 2) if final_cost else None,
    )
    _apply_timeline(incident, status)
    db.add(incident)
    db.flush()
    return incident


def add_status_history(db, incident: Incident) -> None:
    if db.query(StatusHistory).filter(StatusHistory.incident_id == incident.id).first():
        return

    steps = [
        ("pending", "Incidente registrado por el cliente", "Sistema"),
    ]
    if incident.status in {IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.COMPLETED}:
        steps.append(("assigned", "Taller asignado al incidente", "RescateYa"))
    if incident.status in {IncidentStatus.IN_PROGRESS, IncidentStatus.COMPLETED}:
        steps.append(("in_progress", "Tecnico en camino", "Taller"))
    if incident.status == IncidentStatus.COMPLETED:
        steps.append(("completed", "Servicio completado", "Taller"))

    for status, notes, changed_by in steps:
        db.add(StatusHistory(incident_id=incident.id, status=status, notes=notes, changed_by=changed_by))


def add_related_demo_data(db, incident: Incident, client: User, workshop_user: User | None = None) -> None:
    if not db.query(Evidence).filter(Evidence.incident_id == incident.id).first():
        db.add(
            Evidence(
                incident_id=incident.id,
                type=EvidenceType.TEXT,
                content=incident.description,
                ai_analysis="Evidencia textual suficiente para clasificacion demo.",
            )
        )

    if not db.query(Notification).filter(Notification.user_id == client.id, Notification.incident_id == incident.id).first():
        db.add(
            Notification(
                user_id=client.id,
                incident_id=incident.id,
                title="Incidente registrado",
                message="Tu solicitud fue recibida por RescateYa.",
                type=NotificationType.STATUS_UPDATE,
                is_read=incident.status == IncidentStatus.COMPLETED,
            )
        )

    if workshop_user and not db.query(ChatMessage).filter(ChatMessage.incident_id == incident.id).first():
        db.add(
            ChatMessage(
                incident_id=incident.id,
                sender_id=workshop_user.id,
                sender_name=workshop_user.full_name,
                sender_role=workshop_user.role.value,
                message="Hola, ya recibimos tu emergencia y estamos coordinando al tecnico mas cercano.",
            )
        )

    add_status_history(db, incident)


def add_demo_payment_cards(db, clients: list[User]) -> None:
    card_specs = [
        (clients[0], "Luciana Mendez", "visa", "4242"),
        (clients[1], "Fernando Arce", "mastercard", "4444"),
        (clients[2], "Claudia Vaca", "visa", "1881"),
    ]
    for client, holder_name, brand, last4 in card_specs:
        if db.query(PaymentCard).filter(PaymentCard.user_id == client.id, PaymentCard.last4 == last4).first():
            continue
        db.add(
            PaymentCard(
                user_id=client.id,
                holder_name=holder_name,
                brand=brand,
                last4=last4,
                exp_month=12,
                exp_year=2030,
                is_default=True,
            )
        )


def add_demo_offers(
    db,
    incident: Incident,
    workshops: list[Workshop],
    technicians_by_workshop: list[list[Technician]],
) -> None:
    if db.query(ServiceOffer).filter(ServiceOffer.incident_id == incident.id).first():
        return

    preferred_by_category = {
        IncidentCategory.BATTERY: [3, 0, 1],
        IncidentCategory.TIRE: [1, 0, 3],
        IncidentCategory.CRASH: [4, 2, 0],
        IncidentCategory.ENGINE: [0, 2, 3],
        IncidentCategory.KEYS: [3, 0, 1],
        IncidentCategory.OTHER: [2, 0, 1],
        IncidentCategory.UNCERTAIN: [0, 1, 2],
    }
    candidate_indexes = preferred_by_category.get(incident.category, [0, 1, 2])
    accepted_workshop_id = incident.workshop_id if incident.status != IncidentStatus.PENDING else None
    if accepted_workshop_id:
        accepted_index = next((index for index, workshop in enumerate(workshops) if workshop.id == accepted_workshop_id), None)
        if accepted_index is not None and accepted_index not in candidate_indexes:
            candidate_indexes = [accepted_index, *candidate_indexes[:2]]

    base_cost_by_category = {
        IncidentCategory.BATTERY: 95,
        IncidentCategory.TIRE: 85,
        IncidentCategory.CRASH: 180,
        IncidentCategory.ENGINE: 160,
        IncidentCategory.KEYS: 70,
        IncidentCategory.OTHER: 130,
        IncidentCategory.UNCERTAIN: 120,
    }
    base_cost = base_cost_by_category.get(incident.category, 120)

    for position, workshop_index in enumerate(candidate_indexes[:3]):
        workshop = workshops[workshop_index]
        technician = technicians_by_workshop[workshop_index][position % len(technicians_by_workshop[workshop_index])]
        is_accepted = accepted_workshop_id == workshop.id
        cost = incident.final_cost if is_accepted and incident.final_cost else round(base_cost + position * 18 + max(0, 5 - workshop.rating) * 15, 2)
        eta = 14 + position * 9
        distance = round(2.4 + position * 1.8 + max(0, 5 - workshop.rating), 2)
        offer = ServiceOffer(
            incident_id=incident.id,
            tenant_id=workshop.tenant_id,
            workshop_id=workshop.id,
            technician_id=technician.id,
            cost=cost,
            estimated_arrival=eta,
            distance_km=distance,
            score=round(92 - position * 8 + workshop.rating, 2),
            recommendation_reason=(
                "Recomendado por cercania, calificacion y tiempo de llegada."
                if position == 0
                else "Alternativa demo para comparar costo, ETA y reputacion."
            ),
            message="Oferta demo lista para comparar en la app movil.",
            status=OfferStatus.ACCEPTED if is_accepted else (OfferStatus.PENDING if not accepted_workshop_id else OfferStatus.REJECTED),
        )
        db.add(offer)


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    import math
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def seed_invitations(db, pending_incidents: list[Incident], workshops: list[Workshop]) -> None:
    """Crea invitaciones demo para incidentes PENDING (bandeja del taller).

    Las pendientes tienen expiracion futura (siguen vivas en la defensa); ademas
    se crean algunas ya respondidas/expiradas para mostrar la politica de
    reputacion en el historial.
    """
    now = datetime.now(timezone.utc)
    for incident in pending_incidents:
        category = incident.category.value
        compatible = [
            w for w in workshops
            if category in (w.services or "") or "other" in (w.services or "")
        ]
        compatible.sort(key=lambda w: _haversine_km(incident.latitude, incident.longitude, w.latitude, w.longitude))
        chosen = compatible[:4]
        for idx, w in enumerate(chosen):
            dist = round(_haversine_km(incident.latitude, incident.longitude, w.latitude, w.longitude), 2)
            # La mayoria quedan PENDING con expiracion futura; algunas demo de historial.
            if idx == 0 and incident.id % 4 == 0:
                status = InvitationStatus.ACCEPTED
                expires = now + timedelta(minutes=30)
                responded = now - timedelta(minutes=2)
                rt = 45
                w.invitations_accepted += 1
                w.reputation_points = min(200, w.reputation_points + 5)
            elif idx == 1 and incident.id % 5 == 0:
                status = InvitationStatus.EXPIRED
                expires = now - timedelta(minutes=5)
                responded = None
                rt = None
                w.invitations_ignored += 1
                w.reputation_points = max(0, w.reputation_points - 10)
            else:
                status = InvitationStatus.PENDING
                expires = now + timedelta(minutes=random.randint(10, 90))
                responded = None
                rt = None
            w.invitations_sent += 1
            db.add(WorkshopInvitation(
                incident_id=incident.id,
                workshop_id=w.id,
                tenant_id=w.tenant_id,
                status=status,
                distance_km=dist,
                sent_at=now,
                expires_at=expires,
                responded_at=responded,
                response_time_seconds=rt,
            ))


def add_payment_and_review(db, incident: Incident, client: User, workshop: Workshop) -> None:
    if incident.final_cost and not db.query(Payment).filter(Payment.incident_id == incident.id).first():
        db.add(
            Payment(
                incident_id=incident.id,
                amount=incident.final_cost,
                commission_amount=incident.commission_amount or round(incident.final_cost * 0.10, 2),
                payment_method="cash" if incident.id % 2 == 0 else "card",
                status=PaymentStatus.COMPLETED,
                transaction_id=f"SEED-{incident.id:04d}",
            )
        )

    if not db.query(Review).filter(Review.incident_id == incident.id).first():
        db.add(
            Review(
                incident_id=incident.id,
                user_id=client.id,
                workshop_id=workshop.id,
                rating=5,
                comment="Atencion rapida y buen seguimiento desde la app.",
            )
        )


def seed_default_slas(db) -> None:
    """SLA global por defecto (tenant_id NULL) por categoria de incidente.

    Alimenta el KPI 'servicios atendidos dentro del tiempo esperado'.
    (asignacion_min, llegada_min, completado_min)
    """
    defaults = {
        "battery": (10, 25, 45),
        "tire": (10, 25, 40),
        "crash": (10, 30, 120),
        "engine": (10, 35, 120),
        "keys": (10, 20, 40),
        "other": (10, 30, 90),
        "uncertain": (10, 30, 90),
    }
    for category, (asg, arr, comp) in defaults.items():
        exists = (
            db.query(ServiceCategorySLA)
            .filter(ServiceCategorySLA.tenant_id.is_(None), ServiceCategorySLA.category == category)
            .first()
        )
        if exists:
            exists.expected_assignment_min = asg
            exists.expected_arrival_min = arr
            exists.expected_completion_min = comp
            continue
        db.add(
            ServiceCategorySLA(
                tenant_id=None,
                category=category,
                expected_assignment_min=asg,
                expected_arrival_min=arr,
                expected_completion_min=comp,
            )
        )


def clear_database(db) -> None:
    table_names = ", ".join(f'"{table.name}"' for table in reversed(Base.metadata.sorted_tables))
    db.execute(text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE"))


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    sync_postgres_enums()
    sync_missing_columns()

    db = SessionLocal()
    try:
        clear_database(db)

        seed_default_slas(db)

        # ── Admin ──────────────────────────────────────────────────────────────
        admin = get_or_create_user(db, "admin@rescateya.bo", "Administrador RescateYa", "70000001", UserRole.ADMIN)

        # ── Clientes — nombres tipicos de Santa Cruz de la Sierra ─────────────
        clients = [
            get_or_create_user(db, "luciana.mendez@gmail.com",   "Luciana Mendez",   "70000002", UserRole.CLIENT),
            get_or_create_user(db, "fernando.arce@gmail.com",    "Fernando Arce",    "70000003", UserRole.CLIENT),
            get_or_create_user(db, "claudia.vaca@gmail.com",     "Claudia Vaca",     "70000004", UserRole.CLIENT),
            get_or_create_user(db, "rodrigo.montero@gmail.com",  "Rodrigo Montero",  "70000005", UserRole.CLIENT),
            get_or_create_user(db, "sandra.quiroga@gmail.com",   "Sandra Quiroga",   "70000006", UserRole.CLIENT),
            get_or_create_user(db, "javier.mercado@gmail.com",   "Javier Mercado",   "70000007", UserRole.CLIENT),
        ]
        client_first_names = [
            "Paola", "Wilber", "Yolanda", "Marcelo", "Valeria",
            "Gustavo", "Noemí", "Orlando", "Roxana", "Freddy",
        ]
        client_last_names = [
            "Sejas", "Torrez", "Peñaranda", "Salvatierra", "Añez",
            "Cespedes", "Ribera", "Mamani", "Suarez", "Vacaflor",
        ]
        for index in range(len(clients) + 1, 61):
            first_name = client_first_names[(index - 1) % len(client_first_names)]
            last_name = client_last_names[(index - 1) % len(client_last_names)]
            clients.append(
                get_or_create_user(
                    db,
                    f"cliente{index:03d}@rescateya.demo",
                    f"{first_name} {last_name} {index:03d}",
                    f"70{index:06d}",
                    UserRole.CLIENT,
                )
            )

        # ── Talleres — 5 socios reales con ubicaciones de Santa Cruz ──────────
        workshop_specs = [
            {
                # Taller 1: zona centro-sur (El Trompillo)
                "email": "contacto@tallersanlorenzo.bo",
                "owner": "Taller San Lorenzo Motor",
                "phone": "71010001",
                "name": "Taller San Lorenzo Motor",
                "description": "Especialistas en motor, bateria y diagnostico electronico en zona El Trompillo.",
                "address": "Av. El Trompillo 320, entre 2do y 3er anillo, Santa Cruz",
                "lat": -17.7855,
                "lng": -63.1798,
                "services": "battery,engine,keys,other",
                "capacity": 8,
                "rating": 4.8,
                "total_ratings": 134,
                "techs": [
                    ("wilber.gutierrez@tallersanlorenzo.bo", "Wilber Gutierrez", "71110001", "battery,engine", -17.7880, -63.1805),
                    ("miriam.aguilera@tallersanlorenzo.bo",  "Miriam Aguilera",  "71110002", "keys,battery,other", -17.7830, -63.1778),
                    ("sergio.caballero@tallersanlorenzo.bo", "Sergio Caballero", "71110003", "engine,other", -17.7848, -63.1821),
                ],
            },
            {
                # Taller 2: zona norte (Av. Banzer 5to anillo)
                "email": "admin@llantericrucena.bo",
                "owner": "Llantería Cruceña Express",
                "phone": "71010002",
                "name": "Llanteria Crucena Express",
                "description": "Auxilio movil para llantas pinchadas, balanceo y emergencias en via publica.",
                "address": "Av. Banzer km 9, entre 5to y 6to anillo Norte, Santa Cruz",
                "lat": -17.7448,
                "lng": -63.2096,
                "services": "tire,other",
                "capacity": 10,
                "rating": 4.7,
                "total_ratings": 108,
                "techs": [
                    ("orlando.penaranda@llantericrucena.bo", "Orlando Penaranda", "71120001", "tire", -17.7460, -63.2108),
                    ("noemi.salinas@llantericrucena.bo",     "Noemi Salinas",     "71120002", "tire,other", -17.7435, -63.2081),
                    ("freddy.torrez@llantericrucena.bo",     "Freddy Torrez",     "71120003", "tire,battery", -17.7472, -63.2070),
                ],
            },
            {
                # Taller 3: zona este (av. Virgen de Cotoca / Plan 3000)
                "email": "operaciones@gruasoriente.bo",
                "owner": "Grúas del Oriente SRL",
                "phone": "71010003",
                "name": "Gruas del Oriente SRL",
                "description": "Servicio de grua pesada, remolque y asistencia en accidentes zona este.",
                "address": "Av. Virgen de Cotoca km 5, Plan 3000, Santa Cruz",
                "lat": -17.8220,
                "lng": -63.1482,
                "services": "crash,engine,other",
                "capacity": 6,
                "rating": 4.5,
                "total_ratings": 79,
                "techs": [
                    ("rolando.suarez@gruasoriente.bo",  "Rolando Suarez",  "71130001", "crash,engine", -17.8235, -63.1470),
                    ("alberto.mamani@gruasoriente.bo",  "Alberto Mamani",  "71130002", "crash,other",  -17.8198, -63.1498),
                    ("claudia.ribera@gruasoriente.bo",  "Claudia Ribera",  "71130003", "engine,other", -17.8248, -63.1462),
                ],
            },
            {
                # Taller 4: Equipetrol Norte (zona noroeste)
                "email": "recepcion@autoelectriccsc.bo",
                "owner": "AutoElectric Cruceño",
                "phone": "71010004",
                "name": "AutoElectric Cruceno",
                "description": "Baterias, alternadores, sensores y fallas electricas a domicilio en Equipetrol.",
                "address": "Av. Santos Dumont 1540, Equipetrol Norte, Santa Cruz",
                "lat": -17.7582,
                "lng": -63.2108,
                "services": "battery,engine,keys",
                "capacity": 7,
                "rating": 4.9,
                "total_ratings": 157,
                "techs": [
                    ("ruben.salvatierra@autoelectriccsc.bo", "Ruben Salvatierra", "71140001", "battery,keys",    -17.7595, -63.2115),
                    ("elizabeth.rios@autoelectriccsc.bo",    "Elizabeth Rios",    "71140002", "engine,battery",  -17.7565, -63.2095),
                    ("carlos.anez@autoelectriccsc.bo",       "Carlos Anez",       "71140003", "keys,other",      -17.7606, -63.2122),
                ],
            },
            {
                # Taller 5: Av. Paragua, zona norte-central
                "email": "gerencia@chaperoparagua.bo",
                "owner": "Chaperio Paragua",
                "phone": "71010005",
                "name": "Chaperio Paragua",
                "description": "Chaperio, pintura express y evaluacion de danos por colision en zona norte.",
                "address": "Av. Paragua 890, entre 3er y 4to anillo Norte, Santa Cruz",
                "lat": -17.7490,
                "lng": -63.1978,
                "services": "crash,other",
                "capacity": 5,
                "rating": 4.4,
                "total_ratings": 68,
                "techs": [
                    ("nelson.cespedes@chaperoparagua.bo", "Nelson Cespedes", "71150001", "crash",       -17.7480, -63.1985),
                    ("paola.sejas@chaperoparagua.bo",     "Paola Sejas",     "71150002", "crash,other", -17.7500, -63.1968),
                    ("mario.vacaflor@chaperoparagua.bo",  "Mario Vacaflor",  "71150003", "other",       -17.7510, -63.1995),
                ],
            },
        ]

        service_sets = [
            "battery,engine,keys,other",
            "tire,other",
            "crash,engine,other",
            "battery,engine,keys",
            "crash,other",
        ]
        # Nombres de talleres adicionales con sabor cruceno
        workshop_names = [
            "Mecanica del Este",
            "Auxilio Cruceno",
            "Motor Oriente",
            "ServiRuta",
            "Rescate Movil",
            "TecnoMotor SC",
            "Llanta Rapida",
            "ElectroAuto SC",
            "Gruas Paragua",
            "Auto Solucion",
        ]
        # Nombres de tecnicos adicionales — tipicos de Santa Cruz
        technician_names = ["Wilber", "Freddy", "Orlando", "Rolando", "Noemí", "Gustavo", "Paola", "Nelson", "Elizabeth", "Carlos"]

        for spec_index, spec in enumerate(workshop_specs, start=1):
            while len(spec["techs"]) < 5:
                tech_number = len(spec["techs"]) + 1
                tech_name = f"Tecnico {tech_number} {spec['name']}"
                spec["techs"].append(
                    (
                        f"tecnico{spec_index:02d}{tech_number:02d}@demo.rescateya.bo",
                        tech_name,
                        f"72{spec_index:03d}{tech_number:03d}",
                        spec["services"],
                        spec["lat"] + tech_number * 0.001,
                        spec["lng"] - tech_number * 0.001,
                    )
                )

        # Talleres adicionales generados — distribuidos por anillos y zonas de Santa Cruz
        sc_zones = [
            # (nombre zona, lat_base, lng_base)
            ("3er anillo Norte",     -17.7600, -63.1870),
            ("4to anillo Banzer",    -17.7520, -63.2020),
            ("Radial 26",            -17.7700, -63.1620),
            ("Plan 3000 Este",       -17.8350, -63.1220),
            ("Urbarí Sur",           -17.7940, -63.1910),
            ("Las Palmas",           -17.7495, -63.2110),
            ("Av. Monseñor Rivero",  -17.7800, -63.1820),
            ("Barrio Palermo",       -17.7960, -63.1870),
            ("Av. Grigota Sur",      -17.8030, -63.1810),
            ("Av. Roca y Coronado",  -17.7920, -63.1760),
            ("Zona Norte Condominio",-17.7210, -63.1875),
            ("Mutualista",           -17.7950, -63.1875),
        ]
        for index in range(len(workshop_specs) + 1, 26):
            services = service_sets[(index - 1) % len(service_sets)]
            base_name = workshop_names[(index - 1) % len(workshop_names)]
            zone_name, lat_base, lng_base = sc_zones[(index - 1) % len(sc_zones)]
            lat = lat_base - (index % 6) * 0.003
            lng = lng_base - (index % 8) * 0.004
            workshop_specs.append(
                {
                    "email": f"taller{index:03d}@rescateya.demo",
                    "owner": f"{base_name} {index:03d}",
                    "phone": f"7102{index:04d}",
                    "name": f"{base_name} {index:03d}",
                    "description": f"Taller socio con cobertura en {zone_name}, tecnicos disponibles y respuesta rapida.",
                    "address": f"{zone_name}, Santa Cruz de la Sierra",
                    "lat": lat,
                    "lng": lng,
                    "services": services,
                    "capacity": 5 + (index % 8),
                    "rating": round(4.1 + (index % 9) * 0.1, 1),
                    "total_ratings": 25 + index * 3,
                    "techs": [
                        (
                            f"mecanico{index:03d}{tech_index:02d}@rescateya.demo",
                            f"{technician_names[(index + tech_index) % len(technician_names)]} Mecanico {index:03d}-{tech_index}",
                            f"711{index:03d}{tech_index:02d}",
                            services,
                            lat + tech_index * 0.0015,
                            lng - tech_index * 0.0015,
                        )
                        for tech_index in range(1, 6)
                    ],
                }
            )

        workshops = []
        workshop_users = []
        technicians_by_workshop = []
        for spec_index, spec in enumerate(workshop_specs, start=1):
            # Cada taller es su propio tenant (1:1).
            tenant = get_or_create_tenant(db, spec["name"], f"taller-{spec_index}", spec["phone"])
            user = get_or_create_user(
                db, spec["email"], spec["owner"], spec["phone"], UserRole.WORKSHOP, tenant_id=tenant.id
            )
            workshop = get_or_create_workshop(
                db,
                user,
                tenant.id,
                spec["name"],
                spec["address"],
                spec["lat"],
                spec["lng"],
                spec["phone"],
                spec["services"],
                spec["capacity"],
                spec["rating"],
                spec["total_ratings"],
                spec["description"],
            )
            techs = [
                get_or_create_technician(
                    db,
                    workshop,
                    get_or_create_user(db, email, name, phone, UserRole.TECHNICIAN, tenant_id=tenant.id),
                    name,
                    phone,
                    specialties,
                    lat,
                    lng,
                )
                for email, name, phone, specialties, lat, lng in spec["techs"]
            ]
            workshop_users.append(user)
            workshops.append(workshop)
            technicians_by_workshop.append(techs)

        # ── Vehículos — marcas comunes en Santa Cruz ──────────────────────────
        vehicles = [
            get_or_create_vehicle(db, clients[0], "Toyota",    "Corolla",  2019, "Blanco",  "5678-SCZ"),
            get_or_create_vehicle(db, clients[1], "Suzuki",    "Vitara",   2021, "Gris",    "3421-SCZ"),
            get_or_create_vehicle(db, clients[2], "Nissan",    "Kicks",    2020, "Rojo",    "9102-SCZ"),
            get_or_create_vehicle(db, clients[3], "Hyundai",   "Tucson",   2018, "Negro",   "2847-SCZ"),
            get_or_create_vehicle(db, clients[4], "Kia",       "Sportage", 2022, "Azul",    "7365-SCZ"),
            get_or_create_vehicle(db, clients[5], "Chevrolet", "Sail",     2020, "Plata",   "4519-SCZ"),
        ]
        vehicle_brands = ["Toyota", "Suzuki", "Nissan", "Hyundai", "Kia", "Chevrolet", "Ford", "Mazda", "Renault", "Volkswagen"]
        vehicle_models = ["Hilux", "Grand Vitara", "Frontier", "Accent", "Sportage", "Captiva", "Ranger", "CX-30", "Duster", "Amarok"]
        vehicle_colors = ["Blanco", "Gris", "Rojo", "Negro", "Azul", "Plata", "Verde", "Cafe", "Dorado", "Guindo"]
        for index, client in enumerate(clients[len(vehicles):], start=len(vehicles) + 1):
            model_index = (index - 1) % len(vehicle_brands)
            vehicles.append(
                get_or_create_vehicle(
                    db,
                    client,
                    vehicle_brands[model_index],
                    vehicle_models[model_index],
                    2015 + (index % 9),
                    vehicle_colors[model_index],
                    f"{1000 + index:04d}-SCZ",
                )
            )

        add_demo_payment_cards(db, clients)

        # ── Incidentes principales — ubicaciones reales de Santa Cruz ─────────
        incident_specs = [
            # (cliente, vehiculo, descripcion, categoria, prioridad, estado, lat, lng, direccion, taller, tecnico, costo)
            (clients[0], vehicles[0],
             "El auto no enciende, la bateria parece descargada por completo.",
             IncidentCategory.BATTERY, IncidentPriority.MEDIUM, IncidentStatus.PENDING,
             -17.7840, -63.1824,
             "Plaza 24 de Septiembre, Centro, Santa Cruz",
             None, None, None),

            (clients[1], vehicles[1],
             "Llanta trasera reventada circulando por el cuarto anillo.",
             IncidentCategory.TIRE, IncidentPriority.HIGH, IncidentStatus.ASSIGNED,
             -17.7551, -63.1814,
             "Av. Cristo Redentor y 4to anillo, Santa Cruz",
             workshops[1], technicians_by_workshop[1][0], 95.0),

            (clients[2], vehicles[2],
             "El motor se apago de repente y sale humo del capo cerca de Plan 3000.",
             IncidentCategory.ENGINE, IncidentPriority.CRITICAL, IncidentStatus.IN_PROGRESS,
             -17.8395, -63.1248,
             "Av. Virgen de Cotoca km 7, Plan 3000, Santa Cruz",
             workshops[2], technicians_by_workshop[2][0], 175.0),

            (clients[3], vehicles[3],
             "Choque leve en semaforo, necesito evaluacion de chaperio y pintura.",
             IncidentCategory.CRASH, IncidentPriority.HIGH, IncidentStatus.ASSIGNED,
             -17.7582, -63.2108,
             "Av. Santos Dumont, Equipetrol Norte, Santa Cruz",
             workshops[4], technicians_by_workshop[4][1], 210.0),

            (clients[4], vehicles[4],
             "Se me quedaron las llaves dentro del auto en el estacionamiento.",
             IncidentCategory.KEYS, IncidentPriority.LOW, IncidentStatus.COMPLETED,
             -17.7448, -63.2096,
             "Av. Banzer km 9, zona norte, Santa Cruz",
             workshops[3], technicians_by_workshop[3][0], 90.0),

            (clients[5], vehicles[5],
             "La camioneta no puede moverse, necesito servicio de grua urgente.",
             IncidentCategory.OTHER, IncidentPriority.MEDIUM, IncidentStatus.COMPLETED,
             -17.7490, -63.1978,
             "Av. Paragua y 3er anillo Norte, Santa Cruz",
             workshops[2], technicians_by_workshop[2][1], 180.0),

            (clients[0], vehicles[0],
             "Falla electrica intermitente, las luces y el tablero parpadean.",
             IncidentCategory.BATTERY, IncidentPriority.MEDIUM, IncidentStatus.IN_PROGRESS,
             -17.7800, -63.1820,
             "Av. Monseñor Rivero 450, Santa Cruz",
             workshops[3], technicians_by_workshop[3][1], None),

            (clients[1], vehicles[1],
             "Perdi presion en dos llantas al pasar por baches en la radial.",
             IncidentCategory.TIRE, IncidentPriority.MEDIUM, IncidentStatus.COMPLETED,
             -17.7700, -63.1620,
             "Radial 26 y 3er anillo, Santa Cruz",
             workshops[1], technicians_by_workshop[1][1], 110.0),
        ]

        categories = [
            IncidentCategory.BATTERY,
            IncidentCategory.TIRE,
            IncidentCategory.ENGINE,
            IncidentCategory.CRASH,
            IncidentCategory.KEYS,
            IncidentCategory.OTHER,
        ]
        priorities = [IncidentPriority.LOW, IncidentPriority.MEDIUM, IncidentPriority.HIGH, IncidentPriority.CRITICAL]
        statuses = [
            IncidentStatus.PENDING,
            IncidentStatus.ASSIGNED,
            IncidentStatus.IN_PROGRESS,
            IncidentStatus.COMPLETED,
            IncidentStatus.COMPLETED,
            IncidentStatus.CANCELLED,
        ]
        descriptions = {
            IncidentCategory.BATTERY: "El vehiculo no enciende y requiere revision de bateria o alternador.",
            IncidentCategory.TIRE:    "Tengo una llanta baja y necesito auxilio movil para cambiarla.",
            IncidentCategory.ENGINE:  "El motor perdio fuerza y aparecen alertas en el tablero.",
            IncidentCategory.CRASH:   "Necesito evaluacion por choque leve y posible remolque.",
            IncidentCategory.KEYS:    "Las llaves quedaron dentro del vehiculo y necesito apertura segura.",
            IncidentCategory.OTHER:   "El vehiculo no puede continuar y necesito diagnostico en ruta.",
        }
        # Zonas reales de Santa Cruz para incidentes generados
        sc_incident_zones = [
            (-17.7840, -63.1824, "Plaza 24 de Septiembre, Centro"),
            (-17.7551, -63.1814, "Av. Cristo Redentor 4to anillo"),
            (-17.7800, -63.1820, "Av. Monseñor Rivero"),
            (-17.7671, -63.1958, "Equipetrol"),
            (-17.7700, -63.1620, "Radial 26 y 3er anillo"),
            (-17.7950, -63.1875, "Mutualista"),
            (-17.8030, -63.1810, "Av. Grigota Sur"),
            (-17.7920, -63.1760, "Av. Roca y Coronado"),
            (-17.7960, -63.1870, "Barrio Palermo"),
            (-17.7490, -63.2110, "Las Palmas"),
            (-17.7600, -63.1870, "3er anillo Norte"),
            (-17.8350, -63.1220, "Plan 3000 Este"),
            (-17.7940, -63.1910, "Urbarí Sur"),
            (-17.7210, -63.1875, "Zona Norte"),
            (-17.7448, -63.2096, "Av. Banzer 5to anillo"),
            (-17.7520, -63.2020, "4to anillo Banzer"),
        ]

        for index, client in enumerate(clients, start=1):
            vehicle = vehicles[index - 1]
            for round_index in range(1, 4):
                category = categories[(index + round_index) % len(categories)]
                status = statuses[(index + round_index) % len(statuses)]
                priority = priorities[(index + round_index) % len(priorities)]
                workshop = None
                technician = None
                cost = None
                if status in {IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.COMPLETED}:
                    workshop_index = (index + round_index * 7) % len(workshops)
                    workshop = workshops[workshop_index]
                    technician = technicians_by_workshop[workshop_index][(index + round_index) % 5]
                    cost = round(70 + ((index * 11 + round_index * 17) % 180), 2)
                elif status == IncidentStatus.CANCELLED:
                    workshop_index = (index + round_index * 7) % len(workshops)
                    workshop = workshops[workshop_index]
                zone_index = (index + round_index * 3) % len(sc_incident_zones)
                lat, lng, zone_label = sc_incident_zones[zone_index]
                # Pequena variacion para no superponer pines en el mapa
                lat += (index % 5) * 0.0008
                lng -= (round_index % 4) * 0.0006
                incident_specs.append(
                    (
                        client,
                        vehicle,
                        f"{descriptions[category]} Caso demo #{index:03d}-{round_index}.",
                        category,
                        priority,
                        status,
                        lat,
                        lng,
                        f"{zone_label}, Santa Cruz de la Sierra",
                        workshop,
                        technician,
                        cost,
                    )
                )

        completed_incidents = []
        pending_incidents = []
        for client, vehicle, description, category, priority, status, lat, lng, address, workshop, technician, cost in incident_specs:
            incident = get_or_create_incident(
                db,
                client,
                vehicle,
                description,
                category,
                priority,
                status,
                lat,
                lng,
                address,
                workshop,
                technician,
                cost,
            )
            workshop_user = None
            if workshop:
                workshop_user = next((user for user in workshop_users if user.id == workshop.user_id), None)
            add_related_demo_data(db, incident, client, workshop_user)
            add_demo_offers(db, incident, workshops, technicians_by_workshop)
            if status == IncidentStatus.COMPLETED and workshop:
                completed_incidents.append((incident, client, workshop))
            if status == IncidentStatus.PENDING:
                pending_incidents.append(incident)

        for incident, client, workshop in completed_incidents:
            add_payment_and_review(db, incident, client, workshop)

        seed_invitations(db, pending_incidents, workshops)

        db.add(
            Notification(
                user_id=admin.id,
                title="Seed demo cargado",
                message="RescateYa queda como plataforma y los talleres demo son negocios independientes de Santa Cruz de la Sierra con tecnicos y servicios propios.",
                type=NotificationType.STATUS_UPDATE,
                is_read=False,
            )
        )

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
    print("Seed completado. Password para todos los usuarios demo: 12345678*")
