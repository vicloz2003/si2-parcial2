import base64

from openai import OpenAI

from app.config import settings


async def analyze_vehicle_image(image_path: str) -> dict:
    """Analiza una imagen de vehiculo usando GPT-4 Vision para detectar danos."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres un experto en mecanica automotriz que analiza imagenes de vehiculos. "
                    "Identifica danos visibles, el tipo de problema y la gravedad. "
                    "Responde en formato JSON con los campos: "
                    "danos_detectados (list[str]), categoria (battery/tire/crash/engine/keys/other), "
                    "gravedad (leve/moderado/grave), descripcion (str), "
                    "requiere_remolque (bool)"
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analiza esta imagen de un vehiculo con problemas:"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
                    },
                ],
            },
        ],
        response_format={"type": "json_object"},
    )
    import json
    return json.loads(response.choices[0].message.content)
