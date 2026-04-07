from datetime import datetime

from pydantic import BaseModel

from app.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    incident_id: int
    amount: float
    payment_method: str = "card"


class PaymentResponse(BaseModel):
    id: int
    incident_id: int
    amount: float
    commission_amount: float
    payment_method: str
    status: PaymentStatus
    transaction_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
