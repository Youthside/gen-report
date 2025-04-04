import { useGeminiChat } from "@/hooks/use-gemini-chat";

export default function GeminiExample() {
  const { sendMessage, response, loading, error } = useGeminiChat(`
## 📄 Modelfile.md – Potansiyel Satın Alıcı Analizcisi
... (diğer prompt kurallarını buraya yapıştırabilirsin)
  `);

  const handleAnalyze = () => {
    const input = `
Ad: Halil Murat Yıldız
Eğitim Durumu: Lisans Öğrencisi
Üniversite: Trakya Üniversitesi
Bölüm: İşletme
Sınıf: 2. Sınıf
Seçtiği Dersler: Satış, Pazarlama ve Marka Yaratma
Şehir: Edirne
Mail: halilmurat97@gmail.com
    `;
    sendMessage(input);
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Analiz Et
      </button>

      {loading && <p>İşleniyor...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {response && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
          {response}
        </pre>
      )}
    </div>
  );
}
