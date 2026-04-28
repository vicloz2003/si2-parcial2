import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["Usuarios"])

PHOTO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "photos")
os.makedirs(PHOTO_DIR, exist_ok=True)


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver usuarios")

    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.firebase_token is not None:
        current_user.firebase_token = data.firebase_token
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/photo", response_model=UserResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPEG, PNG o WebP")
    ext = file.content_type.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(PHOTO_DIR, filename)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 5MB")
    with open(filepath, "wb") as f:
        f.write(contents)
    # Delete old photo if exists
    if current_user.profile_photo_url:
        old_filename = current_user.profile_photo_url.split("/")[-1]
        old_path = os.path.join(PHOTO_DIR, old_filename)
        if os.path.exists(old_path):
            os.remove(old_path)
    current_user.profile_photo_url = f"/uploads/photos/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user
