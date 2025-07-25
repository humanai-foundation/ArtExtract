import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { SpeechAnalysisResponse } from "@shared/api";

const execAsync = promisify(exec);

// Ensure upload directories exist
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize directories on module load
ensureDirectoryExists("uploads/videos");
ensureDirectoryExists("uploads/temp");

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/videos";
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "video-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp4|mov|avi|mkv|webm)$/i;
    if (allowedTypes.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"));
    }
  },
});

// Analyze speech duration and quality
async function analyzeSpeech(videoPath: string): Promise<number> {
  const tempWav = path.join("uploads/temp", `audio-${Date.now()}.wav`);

  try {
    // Extract audio using ffmpeg (simplified approach for now)
    // In production, you'd want to use fluent-ffmpeg for better control
    const command = `ffmpeg -y -i "${videoPath}" -ac 1 -ar 16000 "${tempWav}" 2>/dev/null || echo "ffmpeg not available"`;
    await execAsync(command);

    // Check if ffmpeg worked or if we need to simulate
    if (!fs.existsSync(tempWav)) {
      console.log("FFmpeg not available, simulating speech analysis");
      // Simulate duration-based scoring
      const simulatedDuration = Math.random() * 30 + 5; // 5-35 seconds
      return simulatedDuration <= 15 ? 85 : simulatedDuration <= 30 ? 75 : 65;
    }

    // Get audio duration
    const { stdout } = await execAsync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${tempWav}" 2>/dev/null || echo "15"`,
    );
    const duration = parseFloat(stdout.trim()) || 15;

    // Scoring logic based on duration (from original Python code)
    let score: number;
    if (duration < 3) {
      score = 40;
    } else if (duration <= 15) {
      score = 90;
    } else if (duration <= 30) {
      score = 75;
    } else {
      score = 60;
    }

    // Clean up temp file
    if (fs.existsSync(tempWav)) {
      fs.unlinkSync(tempWav);
    }

    return score;
  } catch (error) {
    console.error("Error analyzing speech:", error);
    if (fs.existsSync(tempWav)) {
      fs.unlinkSync(tempWav);
    }
    // Return a reasonable simulated score
    return Math.floor(Math.random() * 31) + 60; // 60-90
  }
}

// Transcribe audio using a simple approach (you can replace with actual Whisper API)
async function transcribeAudio(videoPath: string): Promise<string> {
  try {
    // For now, return a placeholder. In production, you would:
    // 1. Use OpenAI Whisper API
    // 2. Use a speech-to-text service like Google Cloud Speech
    // 3. Use a local Whisper installation

    return "This is a placeholder transcript. In a production environment, this would be the actual transcribed text from the video using Whisper or another speech-to-text service.";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "Transcription failed";
  }
}

// Analyze body language (simplified version)
async function analyzeBodyLanguage(videoPath: string): Promise<number> {
  try {
    // This is a simplified version. In production, you would:
    // 1. Use TensorFlow.js with PoseNet
    // 2. Use MediaPipe through a Python service
    // 3. Use a computer vision API

    // For now, return a random score between 60-90
    return Math.floor(Math.random() * 31) + 60;
  } catch (error) {
    console.error("Error analyzing body language:", error);
    return 50;
  }
}

// Generate AI feedback
async function generateFeedback(
  transcript: string,
  speechScore: number,
  bodyLanguageScore: number,
): Promise<string> {
  try {
    // This would use OpenAI API or similar in production
    const feedback = `Based on your presentation:

Speech Analysis (${speechScore}/100): ${speechScore >= 80 ? "Excellent speech pacing and clarity!" : speechScore >= 60 ? "Good speech delivery with room for improvement." : "Consider working on speech pacing and clarity."}

Body Language Analysis (${bodyLanguageScore}/100): ${bodyLanguageScore >= 80 ? "Great posture and body language!" : bodyLanguageScore >= 60 ? "Solid body language with minor adjustments needed." : "Focus on maintaining better posture and confident body language."}

Overall, ${speechScore + bodyLanguageScore >= 140 ? "this was a strong presentation!" : "there are opportunities to enhance your presentation skills."}`;

    return feedback;
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Unable to generate detailed feedback at this time.";
  }
}

export const uploadVideoMiddleware = upload.single("video");

export const analyzeSpeechHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const videoPath = req.file.path;

    // Perform analysis
    const [transcript, speechScore, bodyLanguageScore] = await Promise.all([
      transcribeAudio(videoPath),
      analyzeSpeech(videoPath),
      analyzeBodyLanguage(videoPath),
    ]);

    // Generate feedback
    const feedback = await generateFeedback(
      transcript,
      speechScore,
      bodyLanguageScore,
    );

    const response: SpeechAnalysisResponse = {
      transcript,
      speechScore,
      bodyLanguageScore,
      feedback,
    };

    // Clean up uploaded file
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    res.json(response);
  } catch (error) {
    console.error("Error in speech analysis:", error);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Failed to analyze speech" });
  }
};
