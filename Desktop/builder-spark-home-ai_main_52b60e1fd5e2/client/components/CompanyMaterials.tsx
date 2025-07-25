import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Code,
  MessageSquare,
  TrendingUp,
  Search,
  ExternalLink,
  Calendar,
  Target,
} from "lucide-react";
import { CompanyMaterial, CompaniesListResponse, JobData } from "@shared/api";

interface CompanyMaterialsProps {
  onBack?: () => void;
}

const CompanyMaterials = ({ onBack }: CompanyMaterialsProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyMaterial | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load available companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      const result: CompaniesListResponse = await response.json();

      if (result.success && result.companies) {
        setCompanies(result.companies);
      }
    } catch (error) {
      console.error("Failed to load companies:", error);
    }
  };

  const loadCompanyMaterials = async (companyName: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/company-materials/${encodeURIComponent(companyName)}`,
      );
      const result = await response.json();

      if (result.success && result.data) {
        setCompanyData(result.data);
        setSelectedCompany(companyName);
      }
    } catch (error) {
      console.error("Failed to load company materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatSalary = (salary: string): string => {
    if (salary.includes("₹")) return salary;
    return salary === "Not disclosed" ? "Not disclosed" : `₹${salary}`;
  };

  const getRemoteIcon = (remote: string) => {
    switch (remote) {
      case "remote":
        return "🏠";
      case "hybrid":
        return "🔀";
      default:
        return "🏢";
    }
  };

  if (selectedCompany && companyData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {companyData.company} Materials
              </h2>
              <p className="text-gray-600">
                Complete placement preparation resources
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setSelectedCompany(null)}>
              Back to Companies
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Company Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <span>Company Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Culture & Work Environment
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {companyData.culture_info}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Salary Range</h4>
                <p className="text-green-600 font-medium">
                  {companyData.salary_range}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Open Positions
                </h4>
                <p className="text-blue-600 font-medium">
                  {companyData.jobs.length} jobs available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Tabs */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="jobs" className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              className="flex items-center space-x-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Interview</span>
            </TabsTrigger>
            <TabsTrigger value="coding" className="flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>Coding</span>
            </TabsTrigger>
            <TabsTrigger
              value="process"
              className="flex items-center space-x-1"
            >
              <Target className="w-4 h-4" />
              <span>Process</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Tips</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid gap-4">
              {companyData.jobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                            <span className="ml-1">
                              {getRemoteIcon(job.remote)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.experience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatSalary(job.salary)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{job.job_type}</Badge>
                        <Badge variant="secondary">{job.posted_date}</Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Apply
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Common Interview Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyData.interview_questions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Badge variant="outline" className="mt-1">
                          Q{index + 1}
                        </Badge>
                        <p className="text-gray-700 flex-1">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coding Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyData.coding_challenges.map((challenge, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start space-x-2">
                        <Code className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {challenge.split(" - ")[0]}
                          </p>
                          {challenge.includes(" - ") && (
                            <p className="text-gray-600 text-sm mt-1">
                              {challenge.split(" - ").slice(1).join(" - ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyData.hiring_process.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preparation Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Technical Preparation
                    </h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>
                        • Practice coding problems on platforms like LeetCode
                        and HackerRank
                      </li>
                      <li>
                        • Review system design concepts and common architectures
                      </li>
                      <li>
                        • Understand the company's tech stack and recent
                        projects
                      </li>
                      <li>
                        • Prepare for live coding sessions with proper
                        communication
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      Behavioral Preparation
                    </h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Research the company culture and recent news</li>
                      <li>
                        • Prepare STAR format answers for common questions
                      </li>
                      <li>
                        • Practice explaining your projects and technical
                        decisions
                      </li>
                      <li>
                        • Prepare thoughtful questions about the role and team
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Company Placement Materials
            </h2>
            <p className="text-gray-600">
              Exclusive resources from top companies
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => (
          <Card
            key={company.name}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
            onClick={() => loadCompanyMaterials(company.name)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {company.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {company.jobs_available} open positions
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average Salary:</span>
                  <span className="font-medium text-green-600">
                    {company.avg_salary.split(" ")[0]}
                  </span>
                </div>
                <Button className="w-full" variant="outline" disabled={loading}>
                  {loading ? "Loading..." : "View Materials"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyMaterials;
