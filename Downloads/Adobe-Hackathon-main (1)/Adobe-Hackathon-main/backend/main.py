import os
import shutil
import uvicorn
from typing import Optional, Dict

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel

from ats_engine import ATSCalculator
from llm_helper import generate_improved_resume, generate_resume_image
from file_reader import extract_text_from_image, extract_text_from_pdf


app = FastAPI(
    title="Adobe + AI Resume Coach API",
    description="Hybrid ATS Scoring, AI Suggestions, and Visual Prompt Generation",
    version="1.1"
)

ats_engine = ATSCalculator()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------- SCHEMAS --------------------

class ResumeRequest(BaseModel):
    resume_type: str
    job_text: str
    name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "resume_type": "aesthetic",
                "job_text": "Senior Software Engineer with Python, Django",
                "name": "John Doe"
            }
        }


class ResumeResponse(BaseModel):
    improved_resume_text: str
    resume_image_path: Optional[str] = None


class RephraseSectionsRequest(BaseModel):
    sections: Dict[str, str]

    class Config:
        json_schema_extra = {
            "example": {
                "sections": {
                    "summary": "Software engineer with Python experience",
                    "experience": "Worked at XYZ",
                    "skills": "Python, FastAPI"
                }
            }
        }


class EditRequest(BaseModel):
    current_resume_text: str
    edit_prompt: str
    resume_type: str
    name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "current_resume_text": "John Doe\nSoftware Engineer",
                "edit_prompt": "Improve summary and add skills",
                "resume_type": "aesthetic",
                "name": "John Doe"
            }
        }

# -------------------- ENDPOINTS --------------------

@app.get("/")
async def health():
    return {"status": "ATS + Visual Coach API running successfully"}


@app.post("/generate-resume", response_model=ResumeResponse)
async def generate_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    resume_type: str = Form(...),
    job_text: str = Form(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        if file.filename.lower().endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_path)
        else:
            resume_text = extract_text_from_image(file_path)

        # ATS score
        ats_result = ats_engine.calculate_ats_score(resume_text, job_text)

        # Improve resume
        improved_resume = generate_improved_resume(
            resume_text,
            job_text,
            ats_result
        )

        # Generate image
        image_path = generate_resume_image(
            improved_resume,
            resume_type
        )

        # Cleanup
        background_tasks.add_task(os.remove, file_path)

        return ResumeResponse(
            improved_resume_text=improved_resume,
            resume_image_path=image_path
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume generation failed: {str(e)}"
        )


@app.post("/edit-resume", response_model=ResumeResponse)
async def edit_resume(data: EditRequest):
    try:
        # Safe dummy ATS result
        ats_result = {
            "score": None,
            "missing_keywords": []
        }

        improved_resume = generate_improved_resume(
            data.current_resume_text,
            data.edit_prompt,
            ats_result
        )

        image_path = generate_resume_image(
            improved_resume,
            data.resume_type
        )

        return ResumeResponse(
            improved_resume_text=improved_resume,
            resume_image_path=image_path
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume editing failed: {str(e)}"
        )

# -------------------- RUN --------------------

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
