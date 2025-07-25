import { RequestHandler } from "express";
import { ATSCalculatorResponse } from "@shared/api";

// Simple but effective ATS Calculator implementation
class ATSCalculator {
  private stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "will",
    "with",
    "would",
    "i",
    "you",
    "they",
    "we",
    "she",
    "her",
    "his",
    "this",
    "these",
    "those",
    "which",
    "where",
    "when",
    "who",
    "what",
    "how",
  ]);

  preprocess(text: string): string {
    if (!text) return "";

    // Convert to lowercase and remove special characters
    let processed = text.toLowerCase();
    processed = processed.replace(/[^a-zA-Z\s]/g, " ");
    processed = processed.replace(/\s+/g, " ").trim();

    // Remove stopwords and short words
    const words = processed
      .split(" ")
      .filter((word) => word.length > 2 && !this.stopWords.has(word));

    return words.join(" ");
  }

  extractKeywords(text: string, topN: number = 20): string[] {
    const processed = this.preprocess(text);
    if (!processed) return [];

    // Simple frequency-based keyword extraction
    const words = processed.split(" ");
    const frequency: { [key: string]: number } = {};

    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and take top N
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .map(([word]) => word);
  }

  calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.preprocess(text1).split(" ");
    const words2 = this.preprocess(text2).split(" ");

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // Calculate Jaccard similarity
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  calculateATSScore(
    resumeText: string,
    jobDescription: string,
  ): ATSCalculatorResponse {
    console.log("Starting ATS calculation...");
    console.log("Resume length:", resumeText.length);
    console.log("Job description length:", jobDescription.length);

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return {
        overall_score: 0,
        similarity_score: 0,
        keyword_match: 0,
        matched_keywords: [],
        missing_keywords: [],
        recommendations: [
          "Please provide valid resume and job description text.",
        ],
        job_keywords: [],
        resume_keywords: [],
      };
    }

    try {
      // Calculate similarity
      const similarityScore = this.calculateSimilarity(
        resumeText,
        jobDescription,
      );
      console.log("Similarity score:", similarityScore);

      // Extract keywords
      const jobKeywords = this.extractKeywords(jobDescription, 30);
      const resumeKeywords = this.extractKeywords(resumeText, 50);

      console.log("Job keywords:", jobKeywords.slice(0, 10));
      console.log("Resume keywords:", resumeKeywords.slice(0, 10));

      // Find matches
      const jobKeywordsSet = new Set(jobKeywords.slice(0, 20));
      const resumeKeywordsSet = new Set(resumeKeywords);

      const matchedKeywords = Array.from(jobKeywordsSet).filter((keyword) =>
        resumeKeywordsSet.has(keyword),
      );
      const missingKeywords = Array.from(jobKeywordsSet).filter(
        (keyword) => !resumeKeywordsSet.has(keyword),
      );

      const keywordMatchScore =
        jobKeywordsSet.size > 0
          ? (matchedKeywords.length / jobKeywordsSet.size) * 100
          : 0;

      // Calculate overall score (weighted combination)
      const overallScore =
        (similarityScore * 0.6 + (keywordMatchScore / 100) * 0.4) * 100;

      console.log("Keyword match score:", keywordMatchScore);
      console.log("Overall score:", overallScore);

      const recommendations = this.generateRecommendations(
        overallScore,
        missingKeywords,
        matchedKeywords,
      );

      return {
        overall_score: Math.round(overallScore * 100) / 100,
        similarity_score: Math.round(similarityScore * 100 * 100) / 100,
        keyword_match: Math.round(keywordMatchScore * 100) / 100,
        matched_keywords: matchedKeywords.slice(0, 10),
        missing_keywords: missingKeywords.slice(0, 10),
        recommendations,
        job_keywords: jobKeywords.slice(0, 15),
        resume_keywords: resumeKeywords.slice(0, 15),
      };
    } catch (error) {
      console.error("Error calculating ATS score:", error);
      return {
        overall_score: 0,
        similarity_score: 0,
        keyword_match: 0,
        matched_keywords: [],
        missing_keywords: [],
        recommendations: ["Error calculating score. Please try again."],
        job_keywords: [],
        resume_keywords: [],
        error: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  generateRecommendations(
    score: number,
    missingKeywords: string[],
    matchedKeywords: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (score < 30) {
      recommendations.push(
        "🔴 Low match score. Consider significant resume improvements.",
      );
    } else if (score < 60) {
      recommendations.push("🟡 Moderate match. Some improvements needed.");
    } else {
      recommendations.push(
        "🟢 Good match! Your resume aligns well with the job.",
      );
    }

    if (missingKeywords.length > 0) {
      recommendations.push(
        `📝 Add these key terms: ${missingKeywords.slice(0, 5).join(", ")}`,
      );
    }

    if (matchedKeywords.length > 0) {
      recommendations.push(
        `✅ Great! You have these relevant skills: ${matchedKeywords.slice(0, 3).join(", ")}`,
      );
    }

    if (score < 70) {
      recommendations.push(
        "💡 Use exact keywords from the job description",
        "📊 Quantify your achievements with numbers",
        "🎯 Tailor your resume for this specific role",
        "📋 Include relevant certifications and skills",
      );
    }

    return recommendations;
  }
}

export const calculateATSScore: RequestHandler = async (req, res) => {
  try {
    console.log("ATS calculation request received");
    const { resume_text, job_description } = req.body;

    console.log("Request body:", {
      resume_length: resume_text?.length || 0,
      job_length: job_description?.length || 0,
    });

    if (!resume_text?.trim() || !job_description?.trim()) {
      console.log("Missing required fields");
      return res.status(400).json({
        error: "Both resume and job description are required.",
      });
    }

    const calculator = new ATSCalculator();
    const result = calculator.calculateATSScore(resume_text, job_description);

    console.log("ATS calculation result:", {
      overall_score: result.overall_score,
      similarity_score: result.similarity_score,
      keyword_match: result.keyword_match,
    });

    res.json(result);
  } catch (error) {
    console.error("ATS calculation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
