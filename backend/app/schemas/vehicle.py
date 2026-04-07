from datetime import datetime

from pydantic import BaseModel


class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int
    color: str
    plate_number: str


class VehicleUpdate(BaseModel):
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    color: str | None = None


class VehicleResponse(BaseModel):
    id: int
    user_id: int
    brand: str
    model: str
    year: int
    color: str
    plate_number: str
    created_at: datetime

    model_config = {"from_attributes": True}
