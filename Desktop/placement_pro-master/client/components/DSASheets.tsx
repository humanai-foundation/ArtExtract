import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  BookmarkIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
} from "lucide-react";
import {
  DSASheet,
  DSASheetOverview,
  DSATopicSection,
  DSAQuestion,
  DSASheetsResponse,
  DSASheetResponse,
  DSAQuestionUpdateRequest,
  DSAQuestionUpdateResponse,
} from "../../shared/api";

interface DSASheetsProps {}

const DSASheets: React.FC<DSASheetsProps> = () => {
  const [sheets, setSheets] = useState<DSASheetOverview[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<DSASheet | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<DSATopicSection | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dsa/sheets");
      const data: DSASheetsResponse = await response.json();

      if (data.success && data.data) {
        setSheets(data.data);
      }
    } catch (error) {
      console.error("Error fetching DSA sheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSheet = async (sheetId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dsa/sheets/${sheetId}`);
      const data: DSASheetResponse = await response.json();

      if (data.success && data.data) {
        setSelectedSheet(data.data);
        setActiveTab("problems");
      }
    } catch (error) {
      console.error("Error fetching DSA sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (
    sheetId: string,
    topicIndex: number,
    questionIndex: number,
    updates: DSAQuestionUpdateRequest,
  ) => {
    try {
      const globalIndex = `${topicIndex}-${questionIndex}`;
      const response = await fetch(
        `/api/dsa/sheets/${sheetId}/questions/${globalIndex}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      const data: DSAQuestionUpdateResponse = await response.json();

      if (data.success && selectedSheet) {
        // Update local state
        const updatedSheet = { ...selectedSheet };
        const topic = updatedSheet.problems[topicIndex];
        const question = topic.questions[questionIndex];

        Object.assign(question, updates);

        // Recalculate topic stats
        topic.doneQuestions = topic.questions.filter((q) => q.Done).length;
        topic.started = topic.doneQuestions > 0;

        // Recalculate sheet stats
        updatedSheet.solvedQuestions = updatedSheet.problems.reduce(
          (total, topic) => total + topic.doneQuestions,
          0,
        );

        setSelectedSheet(updatedSheet);

        // Update sheets overview
        setSheets((prev) =>
          prev.map((sheet) =>
            sheet.id === sheetId
              ? { ...sheet, solvedQuestions: updatedSheet.solvedQuestions }
              : sheet,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const toggleTopic = (topicName: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedTopics(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filterQuestions = (questions: DSAQuestion[]) => {
    return questions.filter((question) => {
      const matchesSearch = question.Problem.toLowerCase().includes(
        searchTerm.toLowerCase(),
      );
      const matchesDifficulty =
        difficultyFilter === "all" || question.difficulty === difficultyFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "solved" && question.Done) ||
        (statusFilter === "unsolved" && !question.Done) ||
        (statusFilter === "bookmarked" && question.Bookmark);

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  };

  const QuestionItem: React.FC<{
    question: DSAQuestion;
    sheetId: string;
    topicIndex: number;
    questionIndex: number;
  }> = ({ question, sheetId, topicIndex, questionIndex }) => {
    const [notes, setNotes] = useState(question.Notes);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const saveNotes = () => {
      if (notes !== question.Notes) {
        updateQuestion(sheetId, topicIndex, questionIndex, { Notes: notes });
      }
      setIsEditingNotes(false);
    };

    return (
      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={question.Done}
              onCheckedChange={(checked) =>
                updateQuestion(sheetId, topicIndex, questionIndex, {
                  Done: checked as boolean,
                })
              }
              className="mt-1"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4
                  className={`font-medium ${question.Done ? "line-through text-gray-500" : ""}`}
                >
                  {question.Problem}
                </h4>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(question.difficulty)}
                >
                  {question.difficulty}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(question.URL, "_blank")}
                  className="text-xs"
                >
                  <ExternalLinkIcon className="w-3 h-3 mr-1" />
                  Practice
                </Button>

                {question.URL2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(question.URL2, "_blank")}
                    className="text-xs"
                  >
                    <ExternalLinkIcon className="w-3 h-3 mr-1" />
                    Alternative
                  </Button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="mt-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes..."
                    className="text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={saveNotes}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNotes(question.Notes);
                        setIsEditingNotes(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {question.Notes && (
                    <div
                      className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded cursor-pointer"
                      onClick={() => setIsEditingNotes(true)}
                    >
                      {question.Notes}
                    </div>
                  )}
                  {!question.Notes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-gray-500 p-0 h-auto"
                    >
                      Add notes...
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateQuestion(sheetId, topicIndex, questionIndex, {
                Bookmark: !question.Bookmark,
              })
            }
            className={question.Bookmark ? "text-yellow-500" : "text-gray-400"}
          >
            <BookmarkIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading && !selectedSheet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DSA Sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DSA Practice Sheets
          </h1>
          <p className="text-gray-600">
            Master Data Structures and Algorithms with curated problem sets
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Sheets Overview</TabsTrigger>
            <TabsTrigger value="problems">Practice Problems</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {sheet.sheetName}
                      </CardTitle>
                      <Badge variant="secondary">{sheet.author}</Badge>
                    </div>
                    <CardDescription>
                      {sheet.topicsCount} topics • {sheet.totalQuestions}{" "}
                      problems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>
                            {sheet.solvedQuestions}/{sheet.totalQuestions}
                          </span>
                        </div>
                        <Progress
                          value={
                            (sheet.solvedQuestions / sheet.totalQuestions) * 100
                          }
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(
                            (sheet.solvedQuestions / sheet.totalQuestions) *
                              100,
                          )}
                          % Complete
                        </div>
                      </div>

                      <Button
                        onClick={() => fetchSheet(sheet.id)}
                        className="w-full"
                      >
                        Start Practicing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="problems" className="mt-6">
            {selectedSheet ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedSheet.sheetName}
                        </CardTitle>
                        <CardDescription>
                          by {selectedSheet.author}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("overview")}
                      >
                        Back to Overview
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedSheet.totalQuestions}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Problems
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedSheet.solvedQuestions}
                        </div>
                        <div className="text-sm text-gray-600">Solved</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(
                            (selectedSheet.solvedQuestions /
                              selectedSheet.totalQuestions) *
                              100,
                          )}
                          %
                        </div>
                        <div className="text-sm text-gray-600">Progress</div>
                      </div>
                    </div>

                    <Progress
                      value={
                        (selectedSheet.solvedQuestions /
                          selectedSheet.totalQuestions) *
                        100
                      }
                      className="h-3"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FilterIcon className="w-5 h-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Search Problems
                        </label>
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Difficulty
                        </label>
                        <select
                          value={difficultyFilter}
                          onChange={(e) => setDifficultyFilter(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="all">All Difficulties</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="all">All Problems</option>
                          <option value="solved">Solved</option>
                          <option value="unsolved">Unsolved</option>
                          <option value="bookmarked">Bookmarked</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {selectedSheet.problems.map((topic, topicIndex) => {
                    const filteredQuestions = filterQuestions(topic.questions);
                    const isExpanded = expandedTopics.has(topic.topicName);

                    if (filteredQuestions.length === 0) return null;

                    return (
                      <Card key={topic.topicName}>
                        <CardHeader
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleTopic(topic.topicName)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDownIcon className="w-5 h-5" />
                              ) : (
                                <ChevronRightIcon className="w-5 h-5" />
                              )}
                              <div>
                                <CardTitle className="text-lg">
                                  {topic.topicName}
                                </CardTitle>
                                <CardDescription>
                                  {topic.doneQuestions}/{topic.questions.length}{" "}
                                  completed
                                </CardDescription>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {topic.started && (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              )}
                              <Progress
                                value={
                                  (topic.doneQuestions /
                                    topic.questions.length) *
                                  100
                                }
                                className="w-24 h-2"
                              />
                            </div>
                          </div>
                        </CardHeader>

                        {isExpanded && (
                          <CardContent>
                            <div className="space-y-3">
                              {filteredQuestions.map(
                                (question, questionIndex) => {
                                  const originalIndex =
                                    topic.questions.findIndex(
                                      (q) => q === question,
                                    );
                                  return (
                                    <QuestionItem
                                      key={originalIndex}
                                      question={question}
                                      sheetId={selectedSheet.id}
                                      topicIndex={topicIndex}
                                      questionIndex={originalIndex}
                                    />
                                  );
                                },
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Select a DSA sheet to start practicing
                  </p>
                  <Button onClick={() => setActiveTab("overview")}>
                    View All Sheets
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DSASheets;
