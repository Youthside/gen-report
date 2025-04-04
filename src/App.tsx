"use client";

import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import AllDataPage from "./pages/AllDataPage";
import useDataManager from "./hooks/use-data-manager";
import { useEffect } from "react";
import DashboardAnalyticPage from "./pages/DashboardAnalyticPage";
import SyncButton from "./components/SyncButton";
import EnhancedLoading from "./components/loading-experience";
import ExamInfoPage from "./pages/ExamInfoPage";
import GeminiAnalyzer from "./pages/TestPage";

function App() {
  const { requestAllDataFromPhpAsync, loading } = useDataManager();

  useEffect(() => {
    requestAllDataFromPhpAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <EnhancedLoading />;
  }

  return (
    <Router>
      <div className="flex md:grid md:grid-cols-[250px_auto] h-screen">
        <Sidebar className="hidden md:block" />
        <div className="flex-grow overflow-auto p-4 mt-20 md:mt-10">
          <div className="flex items-center justify-end p-4 border-b border-gray-100">
            <SyncButton />
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tum-veriler" element={<AllDataPage />} />
            <Route
              path="/gosterge-paneli-analiz"
              element={<DashboardAnalyticPage />}
            />
            <Route
              path="/test"
              element={
                <GeminiAnalyzer
                  submissions={[
                    {
                      submission_id: "138168",
                      Ad: "Uğur",
                      Soyad: "Arif",
                      Mail_Adresi: "ugurarif1517@gmail.com",
                      Telefon: "5516335485",
                      Egitim_Durumu: "Lise Öğrencisi",
                      Universite: "Diğer",
                      Bolum: "Acil Yardım ve Afet Yönetimi",
                      Sinif: "3.Sınıf",
                      Aldigi_Dersler:
                        "Yazılım Teknolojileri ve Yapay Zeka, Satış ve 4 daha...",
                      Tarih: "04.04.2025 02:57",
                    },
                  ]}
                />
              }
            />
            <Route path="/sinav-bilgileri" element={<ExamInfoPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
