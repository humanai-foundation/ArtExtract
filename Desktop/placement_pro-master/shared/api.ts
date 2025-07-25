/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Speech Analysis API Types
 */
export interface SpeechAnalysisRequest {
  videoFile: File;
}

export interface SpeechAnalysisResponse {
  transcript: string;
  speechScore: number;
  bodyLanguageScore: number;
  feedback: string;
  reportUrl?: string;
}

export interface SpeechAnalysisProgress {
  stage:
    | "uploading"
    | "transcribing"
    | "analyzing_speech"
    | "analyzing_body"
    | "generating_feedback"
    | "creating_report"
    | "completed";
  progress: number;
  message: string;
}



/**
 * ATS Calculator API Types
 */
export interface ATSCalculatorRequest {
  resume_text: string;
  job_description: string;
}

export interface ATSCalculatorResponse {
  overall_score: number;
  similarity_score: number;
  keyword_match: number;
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
  job_keywords: string[];
  resume_keywords: string[];
  error?: string;
}

/**
 * YouTube Converter API Types
 */
export interface YouTubeConverterRequest {
  url: string;
}

export interface VideoInfo {
  title: string;
  duration: number;
  videoId: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptData {
  full_text: string;
  segments: TranscriptSegment[];
  language: string;
}

export interface YouTubeConverterResponse {
  video_info?: VideoInfo;
  transcript?: TranscriptData;
  pdf_url?: string;
  success: boolean;
  error?: string;
}

/**
 * Company Materials API Types
 */
export interface JobData {
  id: number;
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  skills: string[];
  posted_date: string;
  job_url: string;
  description: string;
  job_type: string;
  remote: string;
}

export interface CompanyMaterial {
  company: string;
  jobs: JobData[];
  interview_questions: string[];
  coding_challenges: string[];
  culture_info: string;
  salary_range: string;
  hiring_process: string[];
}

export interface CompanyMaterialsResponse {
  success: boolean;
  data?: CompanyMaterial;
  error?: string;
}

export interface CompaniesListResponse {
  success: boolean;
  companies?: {
    name: string;
    jobs_available: number;
    avg_salary: string;
  }[];
  error?: string;
}

export interface JobSearchResponse {
  success: boolean;
  jobs?: JobData[];
  total?: number;
  filters?: {
    keyword: string;
    location: string;
    pages: number;
  };
  error?: string;
}

/**
 * DSA Sheets API Types
 */
export interface DSAQuestion {
  Topic: string;
  Problem: string;
  difficulty: "easy" | "medium" | "hard";
  Done: boolean;
  Bookmark: boolean;
  Notes: string;
  URL: string;
  URL2?: string;
}

export interface DSATopicSection {
  topicName: string;
  position: number;
  started: boolean;
  doneQuestions: number;
  questions: DSAQuestion[];
}

export interface DSASheet {
  id: string;
  sheetName: string;
  author: string;
  totalQuestions: number;
  solvedQuestions: number;
  problems: DSATopicSection[];
  topicsCount?: number;
}

export interface DSASheetOverview {
  id: string;
  sheetName: string;
  author: string;
  totalQuestions: number;
  solvedQuestions: number;
  topicsCount: number;
  progressPercentage?: number;
}

export interface DSASheetsResponse {
  success: boolean;
  data?: DSASheetOverview[];
  error?: string;
}

export interface DSASheetResponse {
  success: boolean;
  data?: DSASheet;
  error?: string;
}

export interface DSATopicResponse {
  success: boolean;
  data?: DSATopicSection;
  error?: string;
}

export interface DSAQuestionUpdateRequest {
  Done?: boolean;
  Bookmark?: boolean;
  Notes?: string;
}

export interface DSAQuestionUpdateResponse {
  success: boolean;
  data?: Partial<DSAQuestion>;
  error?: string;
}

export interface DSAProgressStats {
  totalSheets: number;
  sheets: DSASheetOverview[];
}

export interface DSAProgressStatsResponse {
  success: boolean;
  data?: DSAProgressStats;
  error?: string;
}
