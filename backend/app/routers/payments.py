from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident
from app.models.notification import Notification, NotificationType
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/payments", tags=["Pagos"])


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incident = db.query(Incident).filter(
        Incident.id == data.incident_id, Incident.user_id == current_user.id
    ).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    existing = db.query(Payment).filter(Payment.incident_id == data.incident_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un pago para este incidente")

    commission = data.amount * 0.10
    payment = Payment(
        incident_id=data.incident_id,
        amount=data.amount,
        commission_amount=commission,
        payment_method=data.payment_method,
        status=PaymentStatus.COMPLETED,
    )
    db.add(payment)

    incident.final_cost = data.amount
    incident.commission_amount = commission

    notification = Notification(
        user_id=current_user.id,
        incident_id=incident.id,
        title="Pago realizado",
        message=f"Pago de ${data.amount:.2f} procesado exitosamente",
        type=NotificationType.PAYMENT,
    )
    db.add(notification)

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/my-payments", response_model=list[PaymentResponse])
def list_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incidents = db.query(Incident).filter(Incident.user_id == current_user.id).all()
    incident_ids = [i.id for i in incidents]
    return db.query(Payment).filter(Payment.incident_id.in_(incident_ids)).all()
