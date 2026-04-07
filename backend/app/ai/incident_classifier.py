from openai import OpenAI

from app.config import settings


async def classify_incident(evidences: list[dict]) -> dict:
    """
    Clasifica un incidente basandose en todas las evidencias recopiladas.
    Combina texto, transcripciones de audio y analisis de imagenes.
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    evidence_summary = ""
    for ev in evidences:
        if ev.get("type") == "text":
            evidence_summary += f"\nTexto del usuario: {ev.get('content', '')}"
        elif ev.get("type") == "audio":
            evidence_summary += f"\nTranscripcion de audio: {ev.get('transcription', '')}"
        elif ev.get("type") == "image":
            evidence_summary += f"\nAnalisis de imagen: {ev.get('ai_analysis', '')}"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres un sistema de clasificacion de emergencias vehiculares. "
                    "Basandote en las evidencias proporcionadas, clasifica el incidente. "
                    "Responde en formato JSON con los campos: "
                    "categoria (battery/tire/crash/engine/keys/other/uncertain), "
                    "prioridad (low/medium/high/critical), "
                    "resumen (str - resumen del incidente en 2-3 oraciones), "
                    "diagnostico_preliminar (str - posible diagnostico), "
                    "servicios_requeridos (list[str] - tipos de servicio necesarios), "
                    "requiere_remolque (bool), "
                    "confianza (float 0-1 - que tan seguro estas de la clasificacion)"
                ),
            },
            {
                "role": "user",
                "content": f"Evidencias del incidente:\n{evidence_summary}",
            },
        ],
        response_format={"type": "json_object"},
    )
    import json
    return json.loads(response.choices[0].message.content)
