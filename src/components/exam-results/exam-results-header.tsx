import { GraduationCapIcon as Graduation } from "lucide-react"

export function ExamResultsHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary-50 p-3 rounded-lg">
          <Graduation className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sınav Sonuçları</h1>
          <p className="text-gray-500 text-sm">Tüm sınav sonuçlarını görüntüleyin ve yönetin</p>
        </div>
      </div>
    </div>
  )
}

