import { RequestHandler } from "express";

// Job data structure matching Python implementation
interface JobData {
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

interface CompanyMaterial {
  company: string;
  jobs: JobData[];
  interview_questions: string[];
  coding_challenges: string[];
  culture_info: string;
  salary_range: string;
  hiring_process: string[];
}

// Job Scraper Service (based on Python JobScraperSelenium)
class JobScraperService {
  private companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Netflix",
    "Apple",
    "Uber",
    "Airbnb",
    "Spotify",
    "Tesla",
    "Oracle",
    "IBM",
  ];

  private jobTitles = [
    "Software Engineer",
    "Senior Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Product Manager",
    "Technical Lead",
    "Senior Technical Lead",
    "Principal Engineer",
  ];

  private locations = [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Gurgaon",
    "Noida",
    "Kolkata",
    "Remote",
  ];

  private skills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "AWS",
    "Docker",
    "Kubernetes",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "Machine Learning",
    "Data Analysis",
    "System Design",
    "Microservices",
  ];

  // Simulate job scraping (based on scrape_naukri_jobs method)
  scrapeJobs(
    keyword: string = "software engineer",
    location: string = "bangalore",
    pages: number = 3,
  ): JobData[] {
    const jobs: JobData[] = [];
    const totalJobs = Math.min(50, pages * 15); // Limit to 50 jobs like Python version

    for (let i = 0; i < totalJobs; i++) {
      const company =
        this.companies[Math.floor(Math.random() * this.companies.length)];
      const title =
        this.jobTitles[Math.floor(Math.random() * this.jobTitles.length)];
      const jobLocation =
        this.locations[Math.floor(Math.random() * this.locations.length)];

      // Generate realistic job data
      const jobData: JobData = {
        id: Math.floor(Math.random() * 10000) + 1000,
        title: title,
        company: company,
        location: jobLocation,
        experience: this.generateExperience(),
        salary: this.generateSalary(),
        skills: this.generateRandomSkills(),
        posted_date: this.generatePostedDate(),
        job_url: `https://www.naukri.com/job-listings-${title.toLowerCase().replace(/\s+/g, "-")}-${company.toLowerCase()}-${jobLocation.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
        description: `Looking for ${title} with experience in ${this.generateRandomSkills().join(", ")}. Join ${company} team and work on cutting-edge technologies.`,
        job_type: Math.random() > 0.2 ? "Full-time" : "Contract",
        remote: this.generateRemoteType(),
      };

      jobs.push(jobData);
    }

    return jobs;
  }

  private generateExperience(): string {
    const years = Math.floor(Math.random() * 8) + 1;
    return `${years}-${years + 2} years`;
  }

  private generateSalary(): string {
    const salaries = [
      "₹8-15 LPA",
      "₹15-25 LPA",
      "₹25-40 LPA",
      "₹40-60 LPA",
      "₹60-80 LPA",
      "Not disclosed",
      "₹6-12 LPA",
      "₹30-50 LPA",
    ];
    return salaries[Math.floor(Math.random() * salaries.length)];
  }

  private generateRandomSkills(): string[] {
    const numSkills = Math.floor(Math.random() * 4) + 3; // 3-6 skills
    const selectedSkills = [];
    const availableSkills = [...this.skills];

    for (let i = 0; i < numSkills && availableSkills.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableSkills.length);
      selectedSkills.push(availableSkills.splice(randomIndex, 1)[0]);
    }

    return selectedSkills;
  }

  private generatePostedDate(): string {
    const days = Math.floor(Math.random() * 30) + 1;
    if (days === 1) return "Today";
    if (days === 2) return "Yesterday";
    return `${days} days ago`;
  }

  private generateRemoteType(): string {
    const types = ["office", "hybrid", "remote"];
    return types[Math.floor(Math.random() * types.length)];
  }

  // Generate company-specific materials
  generateCompanyMaterials(companyName: string): CompanyMaterial {
    const jobs = this.scrapeJobs(
      `software engineer ${companyName}`,
      "bangalore",
      2,
    )
      .filter((job) => job.company === companyName)
      .slice(0, 8); // Limit to 8 jobs per company

    // If no jobs for specific company, generate some
    if (jobs.length === 0) {
      for (let i = 0; i < 5; i++) {
        const title =
          this.jobTitles[Math.floor(Math.random() * this.jobTitles.length)];
        jobs.push({
          id: Math.floor(Math.random() * 10000) + 1000,
          title: title,
          company: companyName,
          location:
            this.locations[Math.floor(Math.random() * this.locations.length)],
          experience: this.generateExperience(),
          salary: this.generateSalary(),
          skills: this.generateRandomSkills(),
          posted_date: this.generatePostedDate(),
          job_url: `https://careers.${companyName.toLowerCase()}.com/jobs/${Math.floor(Math.random() * 1000)}`,
          description: `Join ${companyName} as a ${title}. Work on innovative projects and cutting-edge technology.`,
          job_type: "Full-time",
          remote: this.generateRemoteType(),
        });
      }
    }

    return {
      company: companyName,
      jobs: jobs,
      interview_questions: this.generateInterviewQuestions(companyName),
      coding_challenges: this.generateCodingChallenges(companyName),
      culture_info: this.generateCultureInfo(companyName),
      salary_range: this.generateSalaryRange(companyName),
      hiring_process: this.generateHiringProcess(companyName),
    };
  }

  private generateInterviewQuestions(company: string): string[] {
    const commonQuestions = [
      "Tell me about yourself and your experience",
      "Why do you want to work at our company?",
      "Describe a challenging project you worked on",
      "How do you handle tight deadlines?",
      "What are your strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "How do you stay updated with technology trends?",
      "Describe a time you worked in a team",
      "How do you approach problem-solving?",
      "What motivates you in your work?",
    ];

    const techQuestions = [
      "Explain the difference between var, let, and const in JavaScript",
      "How would you optimize a slow-loading web application?",
      "Describe the difference between SQL and NoSQL databases",
      "What is your experience with cloud platforms like AWS?",
      "How do you ensure code quality in your projects?",
      "Explain REST API design principles",
      "What testing strategies do you follow?",
      "How do you handle version control in team projects?",
      "Describe your experience with CI/CD pipelines",
      "What design patterns have you implemented?",
    ];

    // Shuffle and return 8 questions
    const allQuestions = [...commonQuestions, ...techQuestions];
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 8);
  }

  private generateCodingChallenges(company: string): string[] {
    const challenges = [
      "Two Sum - Find two numbers in array that add up to target",
      "Valid Parentheses - Check if string has valid parentheses",
      "Reverse Linked List - Reverse a singly linked list",
      "Binary Tree Traversal - Implement inorder/preorder/postorder",
      "Merge Sorted Arrays - Merge two sorted arrays efficiently",
      "Find Duplicate Number - Find duplicate in array of n+1 integers",
      "Longest Substring Without Repeating Characters",
      "Design URL Shortener - System design for URL shortening service",
      "Implement LRU Cache - Design and implement LRU cache",
      "Search in Rotated Sorted Array - Binary search variant",
      "Design Chat System - Architecture for real-time messaging",
      "Rate Limiter Design - Implement API rate limiting system",
    ];

    return challenges.sort(() => 0.5 - Math.random()).slice(0, 6);
  }

  private generateCultureInfo(company: string): string {
    const cultures = {
      Google:
        "Innovation-driven culture with emphasis on data-driven decisions. 20% time for personal projects. Strong focus on employee well-being and diversity.",
      Microsoft:
        "Growth mindset culture promoting continuous learning. Collaborative environment with strong work-life balance. Emphasis on empowering others.",
      Amazon:
        "Customer obsession and ownership principles. Fast-paced environment with high performance standards. Leadership principles guide daily work.",
      Meta: "Move fast and break things mentality. Open culture encouraging bold ideas. Strong focus on connecting people globally.",
      Apple:
        "Attention to detail and design excellence. Secretive culture with high standards. Focus on creating products that change the world.",
      Netflix:
        "Freedom and responsibility culture. High performance expectations. Direct feedback and continuous improvement.",
    };

    return (
      cultures[company as keyof typeof cultures] ||
      `${company} fosters an innovative and collaborative work environment. Strong emphasis on technical excellence, continuous learning, and team collaboration. Competitive benefits and growth opportunities.`
    );
  }

  private generateSalaryRange(company: string): string {
    const ranges = {
      Google: "₹25-80 LPA (depending on level and experience)",
      Microsoft: "₹20-70 LPA (including stock options)",
      Amazon: "₹18-65 LPA (base + stock + signing bonus)",
      Meta: "₹30-90 LPA (highly competitive packages)",
      Apple: "₹25-75 LPA (excellent benefits included)",
      Netflix: "₹40-100 LPA (top of market compensation)",
    };

    return (
      ranges[company as keyof typeof ranges] ||
      "₹15-50 LPA (competitive market rates)"
    );
  }

  private generateHiringProcess(company: string): string[] {
    return [
      "Online Application Review",
      "Phone/Video Screening",
      "Technical Assessment",
      "Virtual Onsite Interviews",
      "System Design Round",
      "Behavioral Interviews",
      "Final Decision & Offer",
    ];
  }
}

// API Endpoints
export const getCompanyMaterials: RequestHandler = async (req, res) => {
  try {
    console.log("Company materials request received");
    const { company } = req.params;

    if (!company) {
      return res.status(400).json({
        error: "Company name is required",
      });
    }

    const scraper = new JobScraperService();
    const materials = scraper.generateCompanyMaterials(company);

    console.log(`Generated materials for ${company}:`, {
      jobs: materials.jobs.length,
      questions: materials.interview_questions.length,
      challenges: materials.coding_challenges.length,
    });

    res.json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error("Error generating company materials:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getAvailableCompanies: RequestHandler = async (req, res) => {
  try {
    const scraper = new JobScraperService();
    const companies = [
      "Google",
      "Microsoft",
      "Amazon",
      "Meta",
      "Netflix",
      "Apple",
      "Uber",
      "Airbnb",
      "Spotify",
      "Tesla",
      "Oracle",
      "IBM",
    ];

    res.json({
      success: true,
      companies: companies.map((company) => ({
        name: company,
        jobs_available: Math.floor(Math.random() * 20) + 5,
        avg_salary: scraper.generateSalaryRange(company),
      })),
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const searchJobs: RequestHandler = async (req, res) => {
  try {
    console.log("Job search request received");
    const {
      keyword = "software engineer",
      location = "bangalore",
      pages = 3,
    } = req.query;

    const scraper = new JobScraperService();
    const jobs = scraper.scrapeJobs(
      keyword as string,
      location as string,
      parseInt(pages as string) || 3,
    );

    console.log(`Found ${jobs.length} jobs for "${keyword}" in ${location}`);

    res.json({
      success: true,
      jobs: jobs,
      total: jobs.length,
      filters: {
        keyword,
        location,
        pages,
      },
    });
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
