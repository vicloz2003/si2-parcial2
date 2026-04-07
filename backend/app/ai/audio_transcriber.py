from openai import OpenAI

from app.config import settings


async def transcribe_audio(file_path: str) -> str:
    """Transcribe un archivo de audio a texto usando Whisper de OpenAI."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="es",
        )
    return transcription.text


async def extract_key_info(transcription: str) -> dict:
    """Extrae informacion clave de la transcripcion usando GPT."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres un asistente que analiza descripciones de emergencias vehiculares. "
                    "Extrae la informacion clave y responde en formato JSON con los campos: "
                    "problema (str), urgencia (baja/media/alta/critica), "
                    "detalles_adicionales (str), categoria (battery/tire/crash/engine/keys/other)"
                ),
            },
            {"role": "user", "content": f"Transcripcion del usuario: {transcription}"},
        ],
        response_format={"type": "json_object"},
    )
    import json
    return json.loads(response.choices[0].message.content)
