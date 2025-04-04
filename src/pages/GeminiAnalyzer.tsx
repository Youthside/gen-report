"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGeminiChat } from "@/hooks/use-gemini-chat";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  BarChart3,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  FileText,
  TrendingUp,
  Target,
  Zap,
  Award,
  RefreshCw,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the types based on your provided data structure
interface SubmissionData {
  submission_id: string;
  Ad: string;
  Soyad: string;
  Mail_Adresi: string;
  Telefon: string;
  Egitim_Durumu: string;
  Universite: string;
  Bolum: string;
  Sinif: string;
  Aldigi_Dersler: string;
  Tarih: string;
}

interface AnalysisResult {
  submission_id: string;
  payment_possibility: "yüksek" | "orta" | "düşük";
  justification: string;
  buyer_persona: string;
  conversion_score: number;
  recommended_strategy: string;
  next_action: string;
  isAnalyzing: boolean;
  error?: string;
}

interface FilterOptions {
  searchTerm: string;
  paymentPossibility: string[];
  buyerPersona: string[];
  minScore: number;
  maxScore: number;
  educationStatus: string[];
  nextAction: string[];
}

export default function GeminiAnalyzer({
  submissions = [],
}: {
  submissions?: SubmissionData[];
}) {
  const [results, setResults] = useState<AnalysisResult[]>(() => {
    // Try to load saved results from localStorage on component mount
    if (typeof window !== "undefined") {
      const savedResults = localStorage.getItem("gemini-analysis-results");
      if (savedResults) {
        try {
          return JSON.parse(savedResults);
        } catch (e) {
          console.error("Failed to parse saved results:", e);
        }
      }
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionData | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: "",
    paymentPossibility: [],
    buyerPersona: [],
    minScore: 0,
    maxScore: 100,
    educationStatus: [],
    nextAction: [],
  });
  const [analysisInProgress, setAnalysisInProgress] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gemini-analysis-in-progress") === "true";
    }
    return false;
  });
  const [lastAnalyzedIndex, setLastAnalyzedIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gemini-analysis-last-index");
      return saved ? Number.parseInt(saved, 10) : -1;
    }
    return -1;
  });
  const { sendMessage } = useGeminiChat();

  // Test amaçlı gönderim verileri, eğer gönderim sağlanmamışsa kullanılacak
  const mockSubmissions: SubmissionData[] = submissions;

  // Initialize results array with submission IDs
  useEffect(() => {
    // Initialize results from localStorage if available
    if (mockSubmissions.length > 0 && results.length === 0) {
      const savedResults = localStorage.getItem("gemini-analysis-results");
      if (savedResults) {
        try {
          const parsedResults = JSON.parse(savedResults);
          // Verify the saved results match our current submissions
          if (parsedResults.length === mockSubmissions.length) {
            setResults(parsedResults);
            return; // Skip initializing with empty results
          }
        } catch (e) {
          console.error("Failed to parse saved results:", e);
        }
      }

      // If no valid saved results, initialize with empty results
      const initialResults = mockSubmissions.map((submission) => ({
        submission_id: submission.submission_id,
        payment_possibility: "düşük" as const,
        justification: "",
        buyer_persona: "",
        conversion_score: 0,
        recommended_strategy: "",
        next_action: "",
        isAnalyzing: false,
      }));
      setResults(initialResults);
    }
  }, [mockSubmissions, results.length]);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem("gemini-analysis-results", JSON.stringify(results));
    }
  }, [results]);

  // Extract unique values for filter options
  const uniqueEducationStatuses = useMemo(() => {
    return [...new Set(mockSubmissions.map((s) => s.Egitim_Durumu))];
  }, [mockSubmissions]);

  const uniqueBuyerPersonas = useMemo(() => {
    return [
      ...new Set(
        results.filter((r) => r.buyer_persona).map((r) => r.buyer_persona)
      ),
    ];
  }, [results]);

  const uniqueNextActions = useMemo(() => {
    return [
      ...new Set(
        results.filter((r) => r.next_action).map((r) => r.next_action)
      ),
    ];
  }, [results]);

  // Apply filters to results
  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const submission = mockSubmissions.find(
        (s) => s.submission_id === result.submission_id
      );
      if (!submission) return false;

      // Search term filter
      const searchLower = filterOptions.searchTerm.toLowerCase();
      const nameMatches = `${submission.Ad} ${submission.Soyad}`
        .toLowerCase()
        .includes(searchLower);
      const universityMatches =
        submission.Universite.toLowerCase().includes(searchLower);
      const departmentMatches =
        submission.Bolum.toLowerCase().includes(searchLower);
      const searchMatches =
        nameMatches || universityMatches || departmentMatches;
      if (filterOptions.searchTerm && !searchMatches) return false;

      // Payment possibility filter
      if (
        filterOptions.paymentPossibility.length > 0 &&
        !filterOptions.paymentPossibility.includes(result.payment_possibility)
      ) {
        return false;
      }

      // Buyer persona filter
      if (
        filterOptions.buyerPersona.length > 0 &&
        !filterOptions.buyerPersona.includes(result.buyer_persona)
      ) {
        return false;
      }

      // Score range filter
      if (
        result.conversion_score < filterOptions.minScore ||
        result.conversion_score > filterOptions.maxScore
      ) {
        return false;
      }

      // Education status filter
      if (
        filterOptions.educationStatus.length > 0 &&
        !filterOptions.educationStatus.includes(submission.Egitim_Durumu)
      ) {
        return false;
      }

      // Next action filter
      if (
        filterOptions.nextAction.length > 0 &&
        !filterOptions.nextAction.includes(result.next_action)
      ) {
        return false;
      }

      return true;
    });
  }, [results, mockSubmissions, filterOptions]);

  // Format submission data for Gemini
  const formatSubmissionForGemini = (submission: SubmissionData) => {
    return `
Ad: ${submission.Ad} ${submission.Soyad}
Eğitim Durumu: ${submission.Egitim_Durumu}
Üniversite: ${submission.Universite}
Bölüm: ${submission.Bolum}
Sınıf: ${submission.Sinif}
Seçtiği Dersler: ${submission.Aldigi_Dersler}
Mail: ${submission.Mail_Adresi}
    `;
  };

  // Parse Gemini response (JSON string) to object
  const parseGeminiResponse = (response: string): Partial<AnalysisResult> => {
    try {
      // Try to parse the JSON directly
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return {
        error: "Analiz sonucu işlenemedi. Lütfen tekrar deneyin.",
      };
    }
  };

  // Analyze a single submission
  const analyzeSubmission = async (index: number) => {
    const submission = mockSubmissions[index];

    // Update state to show this submission is being analyzed
    setResults((prev) =>
      prev.map((result, i) =>
        i === index ? { ...result, isAnalyzing: true } : result
      )
    );

    // Save the current analysis state
    saveAnalysisState(true, index);

    try {
      // Send to Gemini
      const formattedInput = formatSubmissionForGemini(submission);
      const response = await sendMessage(formattedInput);

      // Parse response
      const analysisResult = parseGeminiResponse(response);

      // Update results
      setResults((prev) => {
        const newResults = prev.map((result, i) =>
          i === index
            ? {
                ...result,
                ...analysisResult,
                isAnalyzing: false,
              }
            : result
        );
        // Save to localStorage
        localStorage.setItem(
          "gemini-analysis-results",
          JSON.stringify(newResults)
        );
        return newResults;
      });

      return true;
    } catch (error) {
      console.error("Error analyzing submission:", error);

      // Update results with error
      setResults((prev) => {
        const newResults = prev.map((result, i) =>
          i === index
            ? {
                ...result,
                error: "Analiz sırasında bir hata oluştu.",
                isAnalyzing: false,
              }
            : result
        );
        // Save to localStorage
        localStorage.setItem(
          "gemini-analysis-results",
          JSON.stringify(newResults)
        );
        return newResults;
      });

      return false;
    } finally {
      // Clear the in-progress state
      saveAnalysisState(false, index);
    }
  };

  // Start analyzing all submissions
  const startAnalysis = async () => {
    setIsAnalyzing(true);

    // Determine if we should resume or start fresh
    let startIndex = 0;
    let initialProgress = 0;

    if (analysisInProgress && lastAnalyzedIndex >= 0) {
      // Ask user if they want to resume
      const shouldResume = window.confirm(
        `Önceki analiz işlemi yarıda kalmış görünüyor. Kaldığınız yerden (${
          lastAnalyzedIndex + 1
        }/${mockSubmissions.length}) devam etmek ister misiniz?`
      );

      if (shouldResume) {
        startIndex = lastAnalyzedIndex + 1;
        initialProgress = (startIndex / mockSubmissions.length) * 100;
      } else {
        // Reset if user doesn't want to resume
        localStorage.removeItem("gemini-analysis-in-progress");
        localStorage.removeItem("gemini-analysis-last-index");
        setAnalysisInProgress(false);
        setLastAnalyzedIndex(-1);
      }
    }

    setProgress(initialProgress);

    // If starting fresh, reset all results
    if (startIndex === 0) {
      const initialResults = mockSubmissions.map((submission) => ({
        submission_id: submission.submission_id,
        payment_possibility: "düşük" as const,
        justification: "",
        buyer_persona: "",
        conversion_score: 0,
        recommended_strategy: "",
        next_action: "",
        isAnalyzing: false,
      }));
      setResults(initialResults);
      localStorage.setItem(
        "gemini-analysis-results",
        JSON.stringify(initialResults)
      );
    }

    // Analyze each submission sequentially, starting from startIndex
    for (let i = startIndex; i < mockSubmissions.length; i++) {
      setCurrentIndex(i);
      saveAnalysisState(true, i);
      await analyzeSubmission(i);
      setProgress(((i + 1) / mockSubmissions.length) * 100);
    }

    setCurrentIndex(null);
    setIsAnalyzing(false);
    saveAnalysisState(false, null);
  };

  // Open drawer with selected result details
  const openDrawer = (result: AnalysisResult) => {
    const submission = mockSubmissions.find(
      (s) => s.submission_id === result.submission_id
    );
    if (submission) {
      setSelectedResult(result);
      setSelectedSubmission(submission);
      setIsDrawerOpen(true);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterOptions({
      searchTerm: "",
      paymentPossibility: [],
      buyerPersona: [],
      minScore: 0,
      maxScore: 100,
      educationStatus: [],
      nextAction: [],
    });
  };

  // Toggle filter selection
  const toggleFilter = (type: keyof FilterOptions, value: string) => {
    setFilterOptions((prev) => {
      const currentValues = prev[type] as string[];
      return {
        ...prev,
        [type]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      };
    });
  };

  // Get color based on payment possibility
  const getPossibilityColor = (possibility: string) => {
    switch (possibility) {
      case "yüksek":
        return "bg-secondary-500";
      case "orta":
        return "bg-primary-300";
      case "düşük":
        return "bg-primary-100";
      default:
        return "bg-gray-300";
    }
  };

  // Get color for conversion score
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-secondary-500";
    if (score >= 40) return "text-primary-500";
    return "text-primary-300";
  };

  // Get icon for buyer persona
  const getPersonaIcon = (persona: string) => {
    if (persona.includes("kariyer")) return <Briefcase className="h-4 w-4" />;
    if (persona.includes("akademik"))
      return <GraduationCap className="h-4 w-4" />;
    if (persona.includes("hobi")) return <BookOpen className="h-4 w-4" />;
    if (persona.includes("zorunlu")) return <FileText className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  // Get icon for next action
  const getActionIcon = (action: string) => {
    if (action.includes("mail")) return <Mail className="h-4 w-4" />;
    if (action.includes("telefon")) return <Phone className="h-4 w-4" />;
    if (action.includes("indirim")) return <Zap className="h-4 w-4" />;
    return <ArrowRight className="h-4 w-4" />;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const analyzedResults = results.filter((r) => r.justification);
    if (analyzedResults.length === 0)
      return {
        avgScore: 0,
        highPotential: 0,
        mediumPotential: 0,
        lowPotential: 0,
      };

    const avgScore =
      analyzedResults.reduce((sum, r) => sum + r.conversion_score, 0) /
      analyzedResults.length;
    const highPotential = analyzedResults.filter(
      (r) => r.payment_possibility === "yüksek"
    ).length;
    const mediumPotential = analyzedResults.filter(
      (r) => r.payment_possibility === "orta"
    ).length;
    const lowPotential = analyzedResults.filter(
      (r) => r.payment_possibility === "düşük"
    ).length;

    return { avgScore, highPotential, mediumPotential, lowPotential };
  }, [results]);

  // Save analysis state
  const saveAnalysisState = useCallback(
    (inProgress: boolean, index: number | null) => {
      localStorage.setItem(
        "gemini-analysis-in-progress",
        inProgress ? "true" : "false"
      );
      if (index !== null) {
        localStorage.setItem("gemini-analysis-last-index", index.toString());
      }
      setAnalysisInProgress(inProgress);
      if (index !== null) {
        setLastAnalyzedIndex(index);
      }
    },
    []
  );

  // Add a cleanup function to handle page unload during analysis
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAnalyzing) {
        // Standard way to show a confirmation dialog before leaving
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAnalyzing]);

  // Add a reset function to clear all saved data
  const resetAllData = () => {
    if (
      window.confirm(
        "Tüm analiz verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      localStorage.removeItem("gemini-analysis-results");
      localStorage.removeItem("gemini-analysis-in-progress");
      localStorage.removeItem("gemini-analysis-last-index");

      // Reset state
      setResults(
        mockSubmissions.map((submission) => ({
          submission_id: submission.submission_id,
          payment_possibility: "düşük" as const,
          justification: "",
          buyer_persona: "",
          conversion_score: 0,
          recommended_strategy: "",
          next_action: "",
          isAnalyzing: false,
        }))
      );
      setAnalysisInProgress(false);
      setLastAnalyzedIndex(-1);
    }
  };

  useEffect(() => {
    // Check if there was an analysis in progress
    if (analysisInProgress && lastAnalyzedIndex >= 0 && !isAnalyzing) {
      // Show a notification that analysis was interrupted
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-primary-500 text-white p-4 rounded-md shadow-lg z-50";
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <span>Önceki analiz işlemi yarıda kalmış. Devam etmek için "Tümünü Analiz Et" butonuna tıklayın.</span>
          <button class="ml-2 bg-white text-primary-500 px-2 py-1 rounded-sm text-xs">Kapat</button>
        </div>
      `;

      document.body.appendChild(notification);

      const closeButton = notification.querySelector("button");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          document.body.removeChild(notification);
        });
      }

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 10000);
    }
  }, [analysisInProgress, lastAnalyzedIndex, isAnalyzing]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Potansiyel Müşteri Analizi
            </h1>
            <p className="text-muted-foreground">
              Gemini AI ile potansiyel müşteri değerlendirmesi ve dönüşüm
              analizi
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtrele
              {Object.values(filterOptions).some((v) =>
                Array.isArray(v)
                  ? v.length > 0
                  : typeof v === "string"
                  ? v !== ""
                  : false
              ) && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {
                    Object.values(filterOptions).filter((v) =>
                      Array.isArray(v)
                        ? v.length > 0
                        : typeof v === "string"
                        ? v !== ""
                        : false
                    ).length
                  }
                </Badge>
              )}
            </Button>

            <Button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analiz Ediliyor
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tümünü Analiz Et
                </>
              )}
            </Button>
            {results.some((r) => r.justification) && (
              <Button
                variant="outline"
                className="flex items-center gap-2 border-red-200 text-red-500 hover:bg-red-50"
                onClick={resetAllData}
              >
                <X className="h-4 w-4" />
                Verileri Sıfırla
              </Button>
            )}
          </div>
        </div>

        {isFilterOpen && (
          <Card className="mb-6 border-primary-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtreleme Seçenekleri
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Arama
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="İsim, üniversite veya bölüm ara..."
                      className="pl-8"
                      value={filterOptions.searchTerm}
                      onChange={(e) =>
                        setFilterOptions({
                          ...filterOptions,
                          searchTerm: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ödeme Olasılığı
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["yüksek", "orta", "düşük"].map((possibility) => (
                      <Badge
                        key={possibility}
                        variant={
                          filterOptions.paymentPossibility.includes(possibility)
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer ${
                          filterOptions.paymentPossibility.includes(possibility)
                            ? getPossibilityColor(possibility)
                            : "hover:bg-muted"
                        }`}
                        onClick={() =>
                          toggleFilter("paymentPossibility", possibility)
                        }
                      >
                        {possibility.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Eğitim Durumu
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueEducationStatuses.map((status) => (
                      <Badge
                        key={status}
                        variant={
                          filterOptions.educationStatus.includes(status)
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer ${
                          filterOptions.educationStatus.includes(status)
                            ? "bg-primary-500"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => toggleFilter("educationStatus", status)}
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                {uniqueBuyerPersonas.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Alıcı Profili
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueBuyerPersonas.map((persona) => (
                        <Badge
                          key={persona}
                          variant={
                            filterOptions.buyerPersona.includes(persona)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer ${
                            filterOptions.buyerPersona.includes(persona)
                              ? "bg-secondary-500"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleFilter("buyerPersona", persona)}
                        >
                          {persona}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {uniqueNextActions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sonraki Adım
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueNextActions.map((action) => (
                        <Badge
                          key={action}
                          variant={
                            filterOptions.nextAction.includes(action)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer ${
                            filterOptions.nextAction.includes(action)
                              ? "bg-primary-500"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleFilter("nextAction", action)}
                        >
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Dönüşüm Skoru Aralığı
                  </label>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 100]}
                      min={0}
                      max={100}
                      step={1}
                      value={[filterOptions.minScore, filterOptions.maxScore]}
                      onValueChange={(value) =>
                        setFilterOptions({
                          ...filterOptions,
                          minScore: value[0],
                          maxScore: value[1],
                        })
                      }
                      className="my-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{filterOptions.minScore}</span>
                      <span>{filterOptions.maxScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isAnalyzing && (
          <div className="mb-6">
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {currentIndex !== null
                ? `${currentIndex + 1}/${
                    mockSubmissions.length
                  } analiz ediliyor`
                : ""}
            </p>
          </div>
        )}

        {results.some((r) => r.justification) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-primary-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <BarChart3 className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ortalama Skor
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.avgScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary-100 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Yüksek Potansiyel
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.highPotential}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Target className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Orta Potansiyel
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.mediumPotential}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Award className="h-5 w-5 text-primary-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Düşük Potansiyel
                      </p>
                      <p className="text-2xl font-bold">{stats.lowPotential}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((result, index) => {
          const submission = mockSubmissions.find(
            (s) => s.submission_id === result.submission_id
          );
          if (!submission) return null;

          return (
            <Card
              key={result.submission_id}
              className="overflow-hidden border-t-4 shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{
                borderTopColor:
                  result.conversion_score >= 70
                    ? "#008C45"
                    : result.conversion_score >= 40
                    ? "#B80012"
                    : "#FFBFC3",
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {submission.Ad} {submission.Soyad}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {submission.Egitim_Durumu} - {submission.Sinif}
                    </CardDescription>
                  </div>
                  {result.isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  ) : result.error ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : result.justification ? (
                    <CheckCircle className="h-5 w-5 text-secondary-500" />
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Üniversite / Bölüm
                  </p>
                  <p className="text-sm">
                    {submission.Universite} / {submission.Bolum}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Seçilen Dersler
                  </p>
                  <p className="text-sm line-clamp-2">
                    {submission.Aldigi_Dersler}
                  </p>
                </div>

                {result.justification ? (
                  <>
                    <div className="flex items-center justify-between mb-3 mt-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Ödeme Olasılığı
                        </p>
                        <Badge
                          className={`mt-1 ${getPossibilityColor(
                            result.payment_possibility
                          )} text-white`}
                        >
                          {result.payment_possibility.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">
                          Dönüşüm Skoru
                        </p>
                        <p
                          className={`text-xl font-bold ${getScoreColor(
                            result.conversion_score
                          )}`}
                        >
                          {result.conversion_score}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Alıcı Profili
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-gray-50 flex items-center gap-1"
                      >
                        {getPersonaIcon(result.buyer_persona)}
                        {result.buyer_persona}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Sonraki Adım
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-gray-50 flex items-center gap-1"
                      >
                        {getActionIcon(result.next_action)}
                        {result.next_action}
                      </Badge>
                    </div>
                  </>
                ) : result.error ? (
                  <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm mt-3">
                    {result.error}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      Henüz analiz edilmedi
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2">
                {result.justification ? (
                  <Button
                    variant="outline"
                    className="w-full text-primary-500 border-primary-200 hover:bg-primary-50 flex items-center gap-2"
                    onClick={() => openDrawer(result)}
                  >
                    Detaylı Analizi Görüntüle <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : !result.isAnalyzing && !result.error ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => analyzeSubmission(index)}
                  >
                    Analiz Et
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}

        {filteredResults.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-primary-50 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Sonuç Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Arama kriterlerinize uygun potansiyel müşteri bulunamadı.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-bold">
                Potansiyel Müşteri Analizi
              </DrawerTitle>
              <DrawerDescription>
                {selectedSubmission &&
                  `${selectedSubmission.Ad} ${selectedSubmission.Soyad} için detaylı analiz sonuçları`}
              </DrawerDescription>
            </DrawerHeader>

            <ScrollArea className="h-[calc(80vh-10rem)] px-6">
              {selectedSubmission && selectedResult && (
                <div className="pb-8">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                      <TabsTrigger value="details">Detaylı Analiz</TabsTrigger>
                      <TabsTrigger value="profile">
                        Profil Bilgileri
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Ödeme Olasılığı
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${getPossibilityColor(
                                  selectedResult.payment_possibility
                                )} text-white`}
                              >
                                {selectedResult.payment_possibility.toUpperCase()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Dönüşüm Skoru
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <div
                                className={`text-3xl font-bold ${getScoreColor(
                                  selectedResult.conversion_score
                                )}`}
                              >
                                {selectedResult.conversion_score}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                / 100
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Alıcı Profili
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge
                              variant="outline"
                              className="bg-gray-50 flex items-center gap-1"
                            >
                              {getPersonaIcon(selectedResult.buyer_persona)}
                              {selectedResult.buyer_persona}
                            </Badge>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="mb-6">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Değerlendirme
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {selectedResult.justification}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Önerilen Strateji
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {selectedResult.recommended_strategy}
                          </p>

                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                Sonraki Adım
                              </p>
                              <Badge
                                variant="outline"
                                className="bg-gray-50 flex items-center gap-1"
                              >
                                {getActionIcon(selectedResult.next_action)}
                                {selectedResult.next_action}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="details" className="pt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Detaylı Analiz Raporu</CardTitle>
                          <CardDescription>
                            Gemini AI tarafından gerçekleştirilen kapsamlı
                            değerlendirme
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary-500" />
                                Ödeme Olasılığı Değerlendirmesi
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedResult.justification}
                              </p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary-500" />
                                Alıcı Profili Analizi
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className="bg-gray-50 flex items-center gap-1"
                                >
                                  {getPersonaIcon(selectedResult.buyer_persona)}
                                  {selectedResult.buyer_persona}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Bu profil, adayın eğitim durumu, seçtiği dersler
                                ve kariyer hedefleri göz önünde bulundurularak
                                belirlenmiştir.
                              </p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary-500" />
                                Dönüşüm Skoru Detayları
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className={`text-2xl font-bold ${getScoreColor(
                                    selectedResult.conversion_score
                                  )}`}
                                >
                                  {selectedResult.conversion_score}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  / 100
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {selectedResult.conversion_score >= 70
                                  ? "Yüksek dönüşüm potansiyeli. Adayın satın alma olasılığı oldukça yüksek."
                                  : selectedResult.conversion_score >= 40
                                  ? "Orta seviye dönüşüm potansiyeli. Doğru stratejilerle satın alma olasılığı artırılabilir."
                                  : "Düşük dönüşüm potansiyeli. Satın alma olasılığı düşük, uzun vadeli ilişki kurulması önerilir."}
                              </p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary-500" />
                                Önerilen Pazarlama Stratejisi
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedResult.recommended_strategy}
                              </p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-primary-500" />
                                Sonraki Adım Önerisi
                              </h4>
                              <Badge
                                variant="outline"
                                className="bg-gray-50 flex items-center gap-1"
                              >
                                {getActionIcon(selectedResult.next_action)}
                                {selectedResult.next_action}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-2">
                                {selectedResult.next_action.includes("mail")
                                  ? "Adaya özel hazırlanmış bir kampanya e-postası gönderilmesi önerilir."
                                  : selectedResult.next_action.includes(
                                      "telefon"
                                    )
                                  ? "Adayla telefon görüşmesi yapılarak daha detaylı bilgi verilmesi önerilir."
                                  : "Adaya özel indirim veya teklif sunulması önerilir."}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="profile" className="pt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Aday Profil Bilgileri</CardTitle>
                          <CardDescription>
                            Başvuru formunda belirtilen bilgiler
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary-500" />
                                  Ad Soyad
                                </h4>
                                <p className="text-sm">
                                  {selectedSubmission.Ad}{" "}
                                  {selectedSubmission.Soyad}
                                </p>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-primary-500" />
                                  E-posta Adresi
                                </h4>
                                <p className="text-sm">
                                  {selectedSubmission.Mail_Adresi}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-primary-500" />
                                  Telefon
                                </h4>
                                <p className="text-sm">
                                  {selectedSubmission.Telefon}
                                </p>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary-500" />
                                  Başvuru Tarihi
                                </h4>
                                <p className="text-sm">
                                  {selectedSubmission.Tarih}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-primary-500" />
                                Eğitim Bilgileri
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Eğitim Durumu
                                  </p>
                                  <p className="text-sm">
                                    {selectedSubmission.Egitim_Durumu}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Sınıf
                                  </p>
                                  <p className="text-sm">
                                    {selectedSubmission.Sinif}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Üniversite
                                  </p>
                                  <p className="text-sm">
                                    {selectedSubmission.Universite}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Bölüm
                                  </p>
                                  <p className="text-sm">
                                    {selectedSubmission.Bolum}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary-500" />
                                Seçilen Dersler
                              </h4>
                              <p className="text-sm">
                                {selectedSubmission.Aldigi_Dersler}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </ScrollArea>

            <DrawerFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                Kapat
              </Button>
              {selectedResult && (
                <Button
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={() => {
                    // Here you could implement an action like exporting the analysis
                    alert("Analiz raporu indiriliyor...");
                  }}
                >
                  Raporu İndir
                </Button>
              )}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
