import mimetypes

from app.ai.gemini_client import generate_json


async def analyze_vehicle_image(image_path: str) -> dict:
    """Analiza una imagen de vehiculo usando Gemini/Vertex AI para detectar danos."""
    with open(image_path, "rb") as f:
        image_data = f.read()

    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"
    prompt = (
        "Eres un experto en mecanica automotriz que analiza imagenes para AsisteCar. "
        "Identifica danos visibles, tipo de problema y gravedad. Responde solo JSON valido con: "
        "danos_detectados (array), categoria (battery/tire/crash/engine/keys/other), "
        "gravedad (leve/moderado/grave), descripcion, requiere_remolque (boolean)."
    )
    try:
        return generate_json(prompt, image_data, mime_type)
    except Exception as exc:
        return {
            "danos_detectados": [],
            "categoria": "other",
            "gravedad": "moderado",
            "descripcion": f"No se pudo analizar la imagen automaticamente: {exc}",
            "requiere_remolque": False,
        }
