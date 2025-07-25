import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  uploadVideoMiddleware,
  analyzeSpeechHandler,
} from "./routes/speech-analysis";

import { calculateATSScore } from "./routes/ats-calculator-fastapi";
import { convertYouTubeToTranscript } from "./routes/youtube-converter";
import {
  getCompanyMaterials,
  getAvailableCompanies,
  searchJobs,
} from "./routes/company-materials";
import dsaSheetsRouter from "./routes/dsa-sheets";
import {
  googleLogin,
  googleCallback,
  getCurrentUser,
  logout,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files (for PDF downloads)
  app.use(express.static("public"));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Speech Analysis API
  app.post("/api/speech-analysis", uploadVideoMiddleware, analyzeSpeechHandler);

  // ATS Calculator API
  app.post("/api/ats-calculator", calculateATSScore);

  // YouTube Converter API
  app.post("/api/youtube-converter", convertYouTubeToTranscript);

  // Company Materials API
  app.get("/api/companies", getAvailableCompanies);
  app.get("/api/company-materials/:company", getCompanyMaterials);
  app.get("/api/jobs/search", searchJobs);

  // DSA Sheets API
  app.use("/api/dsa", dsaSheetsRouter);

  // Authentication routes
  app.get("/auth/google/login", googleLogin);
  app.get("/auth/google/callback", googleCallback);
  app.get("/api/auth/user", getCurrentUser);
  app.post("/api/auth/logout", logout);

  return app;
}
