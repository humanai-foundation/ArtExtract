import os
import requests
import logging
import base64
import uuid
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
logging.basicConfig(level=logging.INFO)

# ----------------- OPENAI -----------------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ----------------- GROQ (OPTIONAL) -----------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
} if GROQ_API_KEY else None


# ----------------- RESUME IMPROVEMENT -----------------
def generate_improved_resume(resume_text: str, job_text: str, ats_result: dict) -> str:
    prompt = f"""
You are an expert ATS resume coach.

Resume:
{resume_text}

Job Description / Instructions:
{job_text}

ATS Results:
Overall Score: {ats_result.get('overall_score')}
Similarity Score: {ats_result.get('similarity_score')}
Keyword Match: {ats_result.get('keyword_match')}
Missing Keywords: {ats_result.get('missing_keywords')}
Matched Keywords: {ats_result.get('matched_keywords')}

Rewrite the entire resume in a professional, ATS-optimized format.
Use strong action verbs, quantify achievements, and keep formatting clean.
Return the full rewritten resume.
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are an ATS resume expert."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 500
    }

    response = requests.post(GROQ_URL, headers=HEADERS, json=payload, timeout=20)
    response.raise_for_status()

    return response.json()["choices"][0]["message"]["content"]


# ----------------- REPHRASE SECTIONS -----------------
def rephrase_resume_sections(sections: dict) -> dict:
    rephrased = {}

    for section, content in sections.items():
        if not isinstance(content, str) or not content.strip():
            rephrased[section] = content
            continue

        prompt = f"""
Rephrase the following resume section to be more professional, concise,
ATS-friendly, and impactful. Preserve meaning.

Section: {section}
Content:
{content}
"""

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You rewrite resume sections professionally."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 300
        }

        response = requests.post(GROQ_URL, headers=HEADERS, json=payload, timeout=20)
        response.raise_for_status()

        rephrased[section] = response.json()["choices"][0]["message"]["content"].strip()

    return rephrased


# ----------------- IMAGE GENERATION -----------------
def generate_resume_image(improved_resume: str, resume_type: str) -> Optional[str]:
    try:
        style_map = {
            "aesthetic": "modern clean resume layout, pastel colors, elegant typography",
            "normal": "professional corporate resume, black text on white background",
            "creative": "creative resume with icons, color accents, modern layout",
            "minimal": "minimalist resume, lots of white space, simple fonts"
        }

        style = style_map.get(resume_type.lower(), style_map["normal"])

        prompt = f"""
Professional resume design.
Style: {style}
Clean layout, readable typography.
No photos, no people, no icons clutter.
"""

        result = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024"
        )

        image_base64 = result.data[0].b64_json
        filename = f"generated_resume_{uuid.uuid4().hex}.png"

        with open(filename, "wb") as f:
            f.write(base64.b64decode(image_base64))

        return filename

    except Exception as e:
        logging.error(f"❌ Image generation failed: {e}")
        return None
