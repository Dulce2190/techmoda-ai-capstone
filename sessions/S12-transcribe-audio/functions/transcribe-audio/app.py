import json
import os
import time
import urllib.request
import boto3

REGION = os.environ.get("AWS_REGION", "us-east-1")
AUDIO_BUCKET = os.environ["AUDIO_BUCKET"]
PRODUCTS_TABLE = os.environ["PRODUCTS_TABLE"]

transcribe = boto3.client("transcribe", region_name=REGION)
table = boto3.resource("dynamodb").Table(PRODUCTS_TABLE)

LANG_CODES = {"es": "es-US", "en": "en-US"}
MAX_ATTEMPTS = 15
POLL_SECONDS = 2


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def lambda_handler(event, context):
    print("Event:", json.dumps(event))
    method = ((event.get("requestContext") or {}).get("http") or {}).get("method", "")
    if method == "OPTIONS":
        return _response(200, {})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "Body JSON invalido."})

    product_id = body.get("productId")
    lang = (body.get("lang") or "es").lower()
    if not product_id:
        return _response(400, {"error": "Enviá productId (del audio ya generado por S5)."})

    audio_key = f"audio/{product_id}-{lang}.mp3"
    media_uri = f"s3://{AUDIO_BUCKET}/{audio_key}"
    language_code = LANG_CODES.get(lang, "es-US")
    job_name = f"techmoda-transcribe-{product_id}-{lang}-{int(time.time())}"

    try:
        transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            LanguageCode=language_code,
            MediaFormat="mp3",
            Media={"MediaFileUri": media_uri},
        )
    except Exception as e:
        return _response(
            502,
            {
                "error": "Fallo al iniciar la transcripcion",
                "detail": str(e),
                "hint": "Confirma que ya generaste el audio de este producto con /voice (S5) primero.",
            },
        )

    status = "IN_PROGRESS"
    transcript_text = None
    for _ in range(MAX_ATTEMPTS):
        time.sleep(POLL_SECONDS)
        job = transcribe.get_transcription_job(TranscriptionJobName=job_name)["TranscriptionJob"]
        status = job["TranscriptionJobStatus"]
        if status in ("COMPLETED", "FAILED"):
            break

    if status == "COMPLETED":
        uri = job["Transcript"]["TranscriptFileUri"]
        with urllib.request.urlopen(uri) as resp:
            data = json.loads(resp.read())
        transcript_text = data["results"]["transcripts"][0]["transcript"]

    try:
        transcribe.delete_transcription_job(TranscriptionJobName=job_name)
    except Exception as e:
        print("No se pudo borrar el job (no critico):", repr(e))

    if status != "COMPLETED":
        return _response(
            502,
            {"error": "La transcripcion no completo a tiempo.", "status": status, "jobName": job_name},
        )

    return _response(
        200,
        {
            "productId": product_id,
            "lang": lang,
            "languageCode": language_code,
            "audioKey": audio_key,
            "transcript": transcript_text,
        },
    )
