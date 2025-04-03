"use client";

import { useEffect, useState } from "react";
import { ExamResultsTable } from "@/components/exam-results/exam-results-table";
import { ExamResultsHeader } from "@/components/exam-results/exam-results-header";
import { ExamResultsFilters } from "@/components/exam-results/exam-results-filters";

import { Skeleton } from "@/components/ui/skeleton";
import useDataManager from "@/hooks/use-data-manager";

export default function ExamResultsPage() {
  const {
    examFetchAllData,
    examAllData,
    loading: isLoading,
    examFetchAllData: refetch,
  } = useDataManager();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (examAllData.length === 0) {
      examFetchAllData();
    }
  }, [examAllData]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <ExamResultsHeader />

      <div className="bg-white rounded-lg shadow-md p-6">
        <ExamResultsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={() => refetch()}
        />

        {isLoading ? (
          <div className="space-y-3 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ExamResultsTable data={examAllData} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
