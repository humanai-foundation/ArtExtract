import re
import logging
from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords

# ---------------- LOGGING ---------------- #

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# ---------------- NLTK INIT ---------------- #

try:
    STOP_WORDS = set(stopwords.words("english"))
except LookupError:
    nltk.download("stopwords")
    STOP_WORDS = set(stopwords.words("english"))

# ---------------- ATS ENGINE ---------------- #

class ATSCalculator:

    def __init__(self):

        self.TOP_JOB_KEYWORDS = 30
        self.TOP_RESUME_KEYWORDS = 50
        self.KEYWORDS_TO_MATCH = 20

        self.similarity_vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2)
        )

        self.keyword_vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=60,
            ngram_range=(1, 2)
        )

    # ---------------- TEXT CLEAN ---------------- #

    @staticmethod
    def preprocess(text: str) -> str:
        if not text:
            return ""

        text = text.lower()
        text = re.sub(r"[^a-z\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()

        return text

    # ---------------- KEYWORDS ---------------- #

    def extract_keywords(self, text: str, top_n: int) -> List[str]:

        clean_text = self.preprocess(text)

        if not clean_text:
            return []

        try:
            tfidf = self.keyword_vectorizer.fit_transform([clean_text])
            features = self.keyword_vectorizer.get_feature_names_out()
            scores = tfidf.toarray()[0]

            keywords = sorted(
                zip(features, scores),
                key=lambda x: x[1],
                reverse=True
            )

            return [word for word, score in keywords[:top_n] if score > 0]

        except Exception as e:
            logging.error(f"Keyword extraction failed: {e}")
            return []

    # ---------------- MAIN ATS ---------------- #

    def calculate_ats_score(self, resume_text: str, job_text: str) -> Dict:

        resume_clean = self.preprocess(resume_text)
        job_clean = self.preprocess(job_text)

        if not resume_clean or not job_clean:
            return self.empty_response()

        try:
            vectors = self.similarity_vectorizer.fit_transform(
                [resume_clean, job_clean]
            )

            similarity = cosine_similarity(
                vectors[0:1], vectors[1:2]
            )[0][0]

            job_keywords = self.extract_keywords(job_text, self.TOP_JOB_KEYWORDS)
            resume_keywords = self.extract_keywords(resume_text, self.TOP_RESUME_KEYWORDS)

            job_set = set(job_keywords[:self.KEYWORDS_TO_MATCH])
            resume_set = set(resume_keywords)

            matched = list(job_set & resume_set)
            missing = list(job_set - resume_set)

            keyword_match_score = (
                len(matched) / len(job_set) * 100 if job_set else 0
            )

            final_score = (
                similarity * 0.6 +
                (keyword_match_score / 100) * 0.4
            ) * 100

            return {
                "overall_score": round(final_score, 2),
                "similarity_score": round(similarity * 100, 2),
                "keyword_match": round(keyword_match_score, 2),
                "matched_keywords": matched[:10],
                "missing_keywords": missing[:10],
                "job_keywords": job_keywords[:15],
                "resume_keywords": resume_keywords[:15]
            }

        except Exception as e:
            logging.exception("ATS scoring failed")
            return self.empty_response()

    # ---------------- FALLBACK ---------------- #

    @staticmethod
    def empty_response():
        return {
            "overall_score": 0,
            "similarity_score": 0,
            "keyword_match": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "job_keywords": [],
            "resume_keywords": []
        }
