"use client";

import { useState, useEffect } from "react";
import { useGeminiChat } from "@/hooks/use-gemini-chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// Define the submission data type
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

// Define the Gemini response type
interface GeminiResponse {
  payment_possibility: string;
  justification: string;
  buyer_persona: string;
  conversion_score: number;
  recommended_strategy: string;
  next_action: string;
}

// Define the analysis status type
interface AnalysisStatus {
  submission_id: string;
  status: "pending" | "processing" | "completed" | "error";
  response?: GeminiResponse;
  error?: string;
}

export default function GeminiAnalyzer({
  submissions,
}: {
  submissions: SubmissionData[];
}) {
  const [analysisStatuses, setAnalysisStatuses] = useState<AnalysisStatus[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize the Gemini chat hook with the system prompt
  const { sendMessage, response, loading, error } = useGeminiChat();

  // Initialize analysis statuses when submissions change
  useEffect(() => {
    if (submissions.length > 0) {
      setAnalysisStatuses(
        submissions.map((submission) => ({
          submission_id: submission.submission_id,
          status: "pending",
        }))
      );
    }
  }, [submissions]);

  // Process the next submission when the current one completes
  useEffect(() => {
    if (response && currentIndex >= 0 && currentIndex < submissions.length) {
      try {
        const parsedResponse = JSON.parse(response) as GeminiResponse;

        setAnalysisStatuses((prev) => {
          const updated = [...prev];
          updated[currentIndex] = {
            ...updated[currentIndex],
            status: "completed",
            response: parsedResponse,
          };
          return updated;
        });

        // Move to the next submission
        const nextIndex = currentIndex + 1;
        if (nextIndex < submissions.length && isAnalyzing) {
          setCurrentIndex(nextIndex);
          analyzeSubmission(submissions[nextIndex], nextIndex);
        } else {
          setIsAnalyzing(false);
          setCurrentIndex(-1);
        }

        // Update progress
        setProgress(((currentIndex + 1) / submissions.length) * 100);
      } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        setAnalysisStatuses((prev) => {
          const updated = [...prev];
          updated[currentIndex] = {
            ...updated[currentIndex],
            status: "error",
            error: "Gemini yanıtı işlenemedi",
          };
          return updated;
        });
      }
    }
  }, [response, currentIndex, submissions, isAnalyzing]);

  // Handle errors from Gemini
  useEffect(() => {
    if (error && currentIndex >= 0) {
      setAnalysisStatuses((prev) => {
        const updated = [...prev];
        updated[currentIndex] = {
          ...updated[currentIndex],
          status: "error",
          error: error,
        };
        return updated;
      });

      // Move to the next submission despite the error
      const nextIndex = currentIndex + 1;
      if (nextIndex < submissions.length && isAnalyzing) {
        setCurrentIndex(nextIndex);
        analyzeSubmission(submissions[nextIndex], nextIndex);
      } else {
        setIsAnalyzing(false);
        setCurrentIndex(-1);
      }
    }
  }, [error, currentIndex, submissions, isAnalyzing]);

  // Function to analyze a single submission
  const analyzeSubmission = (submission: SubmissionData, index: number) => {
    setAnalysisStatuses((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: "processing",
      };
      return updated;
    });

    const input = `
Ad: ${submission.Ad} ${submission.Soyad}
Eğitim Durumu: ${submission.Egitim_Durumu}
Üniversite: ${submission.Universite}
Bölüm: ${submission.Bolum}
Sınıf: ${submission.Sinif}
Seçtiği Dersler: ${submission.Aldigi_Dersler}
Mail: ${submission.Mail_Adresi}
Telefon: ${submission.Telefon}
    `;

    sendMessage(input);
  };

  // Start analyzing all submissions
  const startAnalysis = () => {
    if (submissions.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);

    // Reset all statuses to pending
    setAnalysisStatuses(
      submissions.map((submission) => ({
        submission_id: submission.submission_id,
        status: "pending",
      }))
    );

    // Start with the first submission
    setCurrentIndex(0);
    analyzeSubmission(submissions[0], 0);
  };

  // Stop the analysis process
  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setCurrentIndex(-1);
  };

  // Get the color for payment possibility badge
  const getPaymentPossibilityColor = (possibility: string) => {
    switch (possibility.toLowerCase()) {
      case "yüksek":
        return "bg-secondary-500 text-secondary-foreground";
      case "orta":
        return "bg-amber-500 text-white";
      case "düşük":
        return "bg-primary-500 text-primary-foreground";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get the status icon
  const getStatusIcon = (
    status: "pending" | "processing" | "completed" | "error"
  ) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
      case "processing":
        return <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-secondary-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-primary-500" />;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gemini AI Analiz</h2>
        <div className="flex space-x-2">
          <Button
            onClick={startAnalysis}
            disabled={isAnalyzing || submissions.length === 0}
            className="bg-secondary-500 hover:bg-secondary-600 text-white"
          >
            Tüm Başvuruları Analiz Et
          </Button>
          {isAnalyzing && (
            <Button
              onClick={stopAnalysis}
              variant="outline"
              className="border-primary-500 text-primary-500 hover:bg-primary-50"
            >
              Analizi Durdur
            </Button>
          )}
        </div>
      </div>

      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              İşleniyor: {currentIndex + 1} / {submissions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisStatuses.map((analysisStatus, index) => {
          const submission = submissions.find(
            (s) => s.submission_id === analysisStatus.submission_id
          );
          if (!submission) return null;

          return (
            <Card
              key={analysisStatus.submission_id}
              className={`
              overflow-hidden transition-all duration-200
              ${
                analysisStatus.status === "processing"
                  ? "border-amber-500 shadow-md"
                  : ""
              }
              ${
                analysisStatus.status === "completed"
                  ? "border-secondary-500 shadow-md"
                  : ""
              }
              ${
                analysisStatus.status === "error"
                  ? "border-primary-500 shadow-md"
                  : ""
              }
            `}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {submission.Ad} {submission.Soyad}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {submission.Universite} - {submission.Bolum}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(analysisStatus.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {analysisStatus.status === "pending" && (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p>Analiz bekliyor...</p>
                  </div>
                )}

                {analysisStatus.status === "processing" && (
                  <div className="flex flex-col items-center justify-center h-32">
                    <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                    <p className="text-amber-600">Gemini AI analiz ediyor...</p>
                  </div>
                )}

                {analysisStatus.status === "error" && (
                  <div className="flex flex-col items-center justify-center h-32 text-primary-500">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>
                      {analysisStatus.error ||
                        "Analiz sırasında bir hata oluştu"}
                    </p>
                  </div>
                )}

                {analysisStatus.status === "completed" &&
                  analysisStatus.response && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={getPaymentPossibilityColor(
                            analysisStatus.response.payment_possibility
                          )}
                        >
                          Ödeme Olasılığı:{" "}
                          {analysisStatus.response.payment_possibility}
                        </Badge>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1 text-secondary-700" />
                          <span className="font-medium">
                            {analysisStatus.response.conversion_score}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Alıcı Profili
                        </p>
                        <p className="text-sm font-medium">
                          {analysisStatus.response.buyer_persona}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Önerilen Strateji
                        </p>
                        <p className="text-sm line-clamp-2">
                          {analysisStatus.response.recommended_strategy}
                        </p>
                      </div>
                    </div>
                  )}
              </CardContent>

              {analysisStatus.status === "completed" &&
                analysisStatus.response && (
                  <CardFooter className="pt-2 flex justify-between">
                    <Badge variant="outline" className="text-xs">
                      {analysisStatus.response.next_action}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary-600 p-0 h-auto"
                    >
                      Detaylar <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                )}
            </Card>
          );
        })}
      </div>

      {submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p>Analiz edilecek veri bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
