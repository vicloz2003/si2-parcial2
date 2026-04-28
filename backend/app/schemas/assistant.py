from typing import Any

from pydantic import BaseModel, Field


class AssistantContextRequest(BaseModel):
    platform: str = Field(..., examples=["web", "mobile"])
    screen: str
    question: str | None = None
    visible_state: dict[str, Any] = Field(default_factory=dict)


class AssistantContextResponse(BaseModel):
    message: str
    suggested_actions: list[str] = Field(default_factory=list)
    source: str = "rules"