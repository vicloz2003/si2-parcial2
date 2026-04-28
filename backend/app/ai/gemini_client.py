import json
from typing import Any

from app.config import settings


def generate_json(prompt: str, image_bytes: bytes | None = None, mime_type: str = "image/jpeg") -> dict[str, Any]:
    try:
        from google import genai
        from google.genai import types
    except Exception as exc:
        raise RuntimeError("google-genai no esta instalado. Ejecuta pip install -r requirements.txt") from exc

    client = genai.Client(
        vertexai=True,
        project=settings.GOOGLE_CLOUD_PROJECT,
        location=settings.GOOGLE_CLOUD_LOCATION,
    )

    contents: list[Any] = [prompt]
    if image_bytes:
        contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    if not response.text:
        raise RuntimeError("Gemini no devolvio contenido")
    return json.loads(response.text)