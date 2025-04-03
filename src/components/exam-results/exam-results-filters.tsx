"use client"

import { Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { useEffect, useState } from "react"

interface ExamResultsFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onRefresh: () => void
}

export function ExamResultsFilters({ searchQuery, setSearchQuery, onRefresh }: ExamResultsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debouncedSearch = useDebounce(localSearch, 300)

  useEffect(() => {
    setSearchQuery(debouncedSearch)
  }, [debouncedSearch, setSearchQuery])

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="ID, e-posta veya puan ara..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>
      <Button variant="outline" size="icon" onClick={onRefresh} className="h-10 w-10">
        <RefreshCw className="h-4 w-4" />
        <span className="sr-only">Yenile</span>
      </Button>
    </div>
  )
}

