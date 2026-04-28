from app.ai.gemini_client import generate_json


async def classify_incident(evidences: list[dict]) -> dict:
    """
    Clasifica un incidente basandose en todas las evidencias recopiladas.
    Combina texto, transcripciones de audio y analisis de imagenes.
    """
    evidence_summary = ""
    for ev in evidences:
        if ev.get("type") == "text":
            evidence_summary += f"\nTexto del usuario: {ev.get('content', '')}"
        elif ev.get("type") == "audio":
            evidence_summary += f"\nTranscripcion de audio: {ev.get('transcription', '')}"
        elif ev.get("type") == "image":
            evidence_summary += f"\nAnalisis de imagen: {ev.get('ai_analysis', '')}"

    prompt = (
        "Eres un sistema de clasificacion de emergencias vehiculares para AsisteCar. "
        "Analiza texto, transcripciones y analisis de imagenes. Responde solo JSON valido con: "
        "categoria (battery/tire/crash/engine/keys/other/uncertain), "
        "prioridad (low/medium/high/critical), resumen, diagnostico_preliminar, "
        "servicios_requeridos (array), requiere_remolque (boolean), "
        "costo_estimado_min (number), costo_estimado_max (number), confianza (number 0-1).\n\n"
        f"Evidencias del incidente:\n{evidence_summary}"
    )
    try:
        return generate_json(prompt)
    except Exception as exc:
        return {
            "categoria": "uncertain",
            "prioridad": "medium",
            "resumen": "No se pudo completar la clasificacion automatica.",
            "diagnostico_preliminar": f"Pendiente de revision manual: {exc}",
            "servicios_requeridos": ["other"],
            "requiere_remolque": False,
            "costo_estimado_min": 0,
            "costo_estimado_max": 0,
            "confianza": 0,
        }
