import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, GraduationCap, TrendingUp, Users, Code2 } from "lucide-react"

export default function HRResponseDrawer() {
  const evaluationData = [
    { name: "Deneyim Uyumu", value: 95, icon: TrendingUp },
    { name: "Kişisel Beceriler", value: 88, icon: Users },
    { name: "Teknik Uyum", value: 92, icon: Code2 },
  ]

  return (
    <div className="max-w-[1200px] mx-auto">
      <Card className="bg-white shadow-lg border-0 overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 px-8 pt-12 pb-20">
          <div className="absolute inset-0 bg-grid-white/[0.1] [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Aday Değerlendirme Raporu</h1>
                <p className="text-orange-100">CV ve pozisyon gereksinimleri karşılaştırma analizi</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <span className="text-orange-100 mr-2">Değerlendirme Tarihi:</span>
                  <span className="text-white font-medium">14 Şubat 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-8 -mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {evaluationData.map((item, index) => (
              <Card key={index} className="border border-orange-100 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-orange-50">
                      <item.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{item.value}%</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">{item.name}</h3>
                  <Progress value={item.value} className="mt-2 bg-orange-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                      style={{ width: `${item.value}%` }}
                    />
                  </Progress>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Genel Değerlendirme</h2>
              <p className="text-gray-600 leading-relaxed">
                Adayın teknik becerileri ve kişisel özellikleri iş ilanı gereksinimlerine büyük ölçüde uymaktadır.
                Özellikle proaktif yaklaşımı ve yenilikçi düşünce yapısı öne çıkmaktadır.
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pozisyon Uyumu</h2>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-5xl font-bold text-orange-600">90%</div>
                  <div className="text-sm text-orange-600 font-medium">Mükemmel Uyum</div>
                </div>
                <div className="w-24 h-24 rounded-full border-8 border-orange-200 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-8 border-orange-500 border-t-transparent transform -rotate-45" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="col-span-1 border-orange-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-orange-500" />
                  Güçlü Yönler
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-gray-600">Proaktif davranışlar ve yenilikçi yaklaşımlar</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-gray-600">Proje yönetimi ve takım koordinasyonu</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-orange-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Gelişim Alanları
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-gray-600">SQL/NoSQL veritabanı bilgisi</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-gray-600">JavaScript ve Node.js deneyimi</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-orange-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <GraduationCap className="w-5 h-5 mr-2 text-orange-500" />
                  Önerilen Eğitim
                </h2>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">Yazılım Teknolojileri ve Yapay Zeka Eğitimi</h3>
                  <p className="text-sm text-gray-600 mt-2 mb-4">
                    JavaScript, Node.js ve veritabanı teknolojilerinde ileri seviye eğitim programı
                  </p>
                  <a
                    href="https://www.genacademy.co/yazilim-teknolojilerive-yapay-zeka-egitimi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Program Detayları
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}

