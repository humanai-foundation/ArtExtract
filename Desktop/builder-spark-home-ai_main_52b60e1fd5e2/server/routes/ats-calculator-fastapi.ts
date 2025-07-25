import { RequestHandler } from "express";
import { ATSCalculatorResponse } from "@shared/api";

// Simple ATS Calculator based on FastAPI implementation
class ATSCalculator {
  private stopWords = new Set([
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "you're",
    "you've",
    "you'll",
    "you'd",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "she's",
    "her",
    "hers",
    "herself",
    "it",
    "it's",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "that'll",
    "these",
    "those",
    "am",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "do",
    "does",
    "did",
    "doing",
    "a",
    "an",
    "the",
    "and",
    "but",
    "if",
    "or",
    "because",
    "as",
    "until",
    "while",
    "of",
    "at",
    "by",
    "for",
    "with",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "up",
    "down",
    "in",
    "out",
    "on",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "don't",
    "should",
    "should've",
    "now",
    "d",
    "ll",
    "m",
    "o",
    "re",
    "ve",
    "y",
    "ain",
    "aren",
    "aren't",
    "couldn",
    "couldn't",
    "didn",
    "didn't",
    "doesn",
    "doesn't",
    "hadn",
    "hadn't",
    "hasn",
    "hasn't",
    "haven",
    "haven't",
    "isn",
    "isn't",
    "ma",
    "mightn",
    "mightn't",
    "mustn",
    "mustn't",
    "needn",
    "needn't",
    "shan",
    "shan't",
    "shouldn",
    "shouldn't",
    "wasn",
    "wasn't",
    "weren",
    "weren't",
    "won",
    "won't",
    "wouldn",
    "wouldn't",
  ]);

  // Preprocess and clean text (similar to sklearn preprocessing)
  preprocessText(text: string): string[] {
    if (!text) return [];

    // Convert to lowercase and extract words
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, " ") // Remove non-alphabetic characters
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 1 && !this.stopWords.has(word) && word.trim() !== "",
      );

    return words;
  }

  // Calculate Term Frequency (TF)
  calculateTF(words: string[], vocabulary: string[]): number[] {
    const tf = new Array(vocabulary.length).fill(0);
    const totalWords = words.length;

    if (totalWords === 0) return tf;

    vocabulary.forEach((term, index) => {
      const count = words.filter((word) => word === term).length;
      tf[index] = count / totalWords;
    });

    return tf;
  }

  // Calculate Inverse Document Frequency (IDF)
  calculateIDF(documents: string[][], vocabulary: string[]): number[] {
    const totalDocs = documents.length;
    const idf = new Array(vocabulary.length).fill(0);

    vocabulary.forEach((term, index) => {
      const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
      // Add 1 to avoid division by zero (smooth idf)
      idf[index] = Math.log(totalDocs / (1 + docsWithTerm));
    });

    return idf;
  }

  // Calculate TF-IDF vectors
  calculateTFIDF(
    words: string[],
    vocabulary: string[],
    idf: number[],
  ): number[] {
    const tf = this.calculateTF(words, vocabulary);
    const tfidf = new Array(vocabulary.length).fill(0);

    for (let i = 0; i < vocabulary.length; i++) {
      tfidf[i] = tf[i] * idf[i];
    }

    return tfidf;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Main calculation method (following FastAPI logic exactly)
  calculateATSScore(
    resumeText: string,
    jobDescription: string,
  ): { score: number; message: string } {
    console.log("Starting ATS calculation...");
    console.log("Resume length:", resumeText.length);
    console.log("Job description length:", jobDescription.length);

    // Clean and normalize text (as in FastAPI)
    const cleanResumeText = resumeText.toLowerCase().trim();
    const cleanJobDescription = jobDescription.toLowerCase().trim();

    if (!cleanResumeText || !cleanJobDescription) {
      return {
        score: 0,
        message: "Resume matches 0% with the job description.",
      };
    }

    try {
      // Preprocess texts
      const resumeWords = this.preprocessText(cleanResumeText);
      const jobWords = this.preprocessText(cleanJobDescription);

      console.log("Resume words count:", resumeWords.length);
      console.log("Job description words count:", jobWords.length);

      if (resumeWords.length === 0 || jobWords.length === 0) {
        return {
          score: 0,
          message: "Resume matches 0% with the job description.",
        };
      }

      // Create vocabulary from job description (fit only on job description as in FastAPI)
      const vocabulary = [...new Set(jobWords)].sort();
      console.log("Vocabulary size:", vocabulary.length);

      // Calculate IDF using both documents
      const documents = [jobWords, resumeWords];
      const idf = this.calculateIDF(documents, vocabulary);

      // Transform job description and resume to TF-IDF vectors
      const jobVector = this.calculateTFIDF(jobWords, vocabulary, idf);
      const resumeVector = this.calculateTFIDF(resumeWords, vocabulary, idf);

      // Compute cosine similarity (resume vs job description)
      const similarity = this.cosineSimilarity(resumeVector, jobVector);
      const score = Math.round(similarity * 100 * 100) / 100; // Round to 2 decimal places

      console.log("Similarity score:", similarity);
      console.log("Final score:", score);

      return {
        score,
        message: `Resume matches ${score}% with the job description.`,
      };
    } catch (error) {
      console.error("Error calculating ATS score:", error);
      return {
        score: 0,
        message: "Error calculating ATS score. Please try again.",
      };
    }
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

    console.log("ATS calculation result:", result);

    // Return in the same format as FastAPI
    res.json(result);
  } catch (error) {
    console.error("ATS calculation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
