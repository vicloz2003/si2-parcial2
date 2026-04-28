from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.assistant import AssistantContextRequest, AssistantContextResponse
from app.services.assistant_service import get_contextual_help
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["Asistente IA"])


@router.post("/help", response_model=AssistantContextResponse)
def ask_contextual_assistant(
    data: AssistantContextRequest,
    current_user: User = Depends(get_current_user),
):
    return get_contextual_help(data, current_user)