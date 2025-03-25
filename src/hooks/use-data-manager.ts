export interface LastSyncData {
  last_sync: string;
  timestamp: number;
}

import SubmissionData from "@/components/premium-data-table";
import { goStreamClient } from "@/plugins/go-stream-client";
import { httpClient } from "@/plugins/http-client-flask";
import { httpClientPHP } from "@/plugins/http-client-php";
import { RootState } from "@/store";
import { setAllData } from "@/store/data";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useDataManager() {
  /*
    const sampleData = [
  {
    submission_id: 125578,
    Ad: "Ferhat",
    Soyad: "Cengiz",
    Mail_Adresi: "ferhat.cengz0@gmail.com",
    Telefon: "05426575124",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "Abdullah Gül Üniversitesi",
    Bolum: "Adli Bilimler",
    Sinif: "2.Sinif",
    Aldigi_Dersler:
      "Yazılım Teknolojileri ve Yapay Zeka, Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik, İnsan Kaynakları ve Yetenek Kazanımı",
    Tarih: "2025-03-19 02:22:34",
  },
  {
    submission_id: 125577,
    Ad: "GÜLCAN",
    Soyad: "Ateş",
    Mail_Adresi: "artemisglcnk@gmail.com",
    Telefon: "5378558675",
    Egitim_Durumu: "Lisans Mezunu",
    Universite: "Niğde Ömer Halisdemir Üniversitesi",
    Bolum: "Biyoteknoloji",
    Sinif: "Mezun",
    Aldigi_Dersler:
      "Yazılım Teknolojileri ve Yapay Zeka, Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik, İnsan Kaynakları ve Yetenek Kazanımı",
    Tarih: "2025-03-19 02:02:06",
  },
  {
    submission_id: 125576,
    Ad: "Shugyla",
    Soyad: "Amankeldykyzy",
    Mail_Adresi: "shugiaman@gmail.com",
    Telefon: "5376651079",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "Dokuz Eylül Üniversitesi",
    Bolum: "İktisadi ve İdari Programlar",
    Sinif: "2.Sinif",
    Aldigi_Dersler:
      "Yazılım Teknolojileri ve Yapay Zeka, Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik",
    Tarih: "2025-03-19 02:01:01",
  },
  {
    submission_id: 125575,
    Ad: "Hena",
    Soyad: "Altun",
    Mail_Adresi: "hena.altunn@gmail.com",
    Telefon: "5340760097",
    Egitim_Durumu: "Yüksek Lisans Öğrencisi",
    Universite: "Trabzon Üniversitesi",
    Bolum: "Psikolojik Danışmanlık ve Rehberlik",
    Sinif: "Mezun",
    Aldigi_Dersler:
      "Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik, İnsan Kaynakları ve Yetenek Kazanımı",
    Tarih: "2025-03-19 01:58:25",
  },
  {
    submission_id: 125574,
    Ad: "Hüseyin",
    Soyad: "Ergin",
    Mail_Adresi: "huseyinergin810@gmail.com",
    Telefon: "5468760965",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "Bandırma Onyedi Eylül Üniversitesi",
    Bolum: "Elektrik-Elektronik Mühendisliği",
    Sinif: "4.Sinif",
    Aldigi_Dersler:
      "Yazılım Teknolojileri ve Yapay Zeka, Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik, İnsan Kaynakları ve Yetenek Kazanımı",
    Tarih: "2025-03-19 01:55:28",
  },
  {
    submission_id: 125573,
    Ad: "ayşegül",
    Soyad: "erdem",
    Mail_Adresi: "erdmaysegul003@gmail.com",
    Telefon: "5078858662",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "Orta Doğu Teknik Üniversitesi",
    Bolum: "Bilgisayar Mühendisliği",
    Sinif: "2.Sinif",
    Aldigi_Dersler:
      "Yazılım Teknolojileri ve Yapay Zeka, Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik, İnsan Kaynakları ve Yetenek Kazanımı",
    Tarih: "2025-03-19 01:52:31",
  },
  {
    submission_id: 125572,
    Ad: "Lamiya",
    Soyad: "Abbaszade",
    Mail_Adresi: "lamiyabbaszada@gmail.com",
    Telefon: "05057851025",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "Ege Üniversitesi",
    Bolum: "Radyo, Televizyon ve Sinema",
    Sinif: "3.Sinif",
    Aldigi_Dersler: "Dijital Pazarlama, Influencer Marketing ve Girişimcilik",
    Tarih: "2025-03-19 01:48:43",
  },
  {
    submission_id: 125571,
    Ad: "Muhammet Mustafa",
    Soyad: "Çelebi",
    Mail_Adresi: "mustaafa.celebi@gmail.com",
    Telefon: "5360740543",
    Egitim_Durumu: "Lisans Mezunu",
    Universite: "Manisa Celâl Bayar Üniversitesi",
    Bolum: "Yazılım Mühendisliği",
    Sinif: "Mezun",
    Aldigi_Dersler: "Yazılım Teknolojileri ve Yapay Zeka, Dijital Pazarlama, Influencer Marketing ve Girişimcilik",
    Tarih: "2025-03-19 01:48:02",
  },
  {
    submission_id: 125570,
    Ad: "Senasu",
    Soyad: "Kanbur",
    Mail_Adresi: "kanbursena0@email.com",
    Telefon: "5330685303",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "İstanbul Ticaret Üniversitesi",
    Bolum: "Psikoloji",
    Sinif: "1.Sinif",
    Aldigi_Dersler: "Dijital Pazarlama, Influencer Marketing ve Girişimcilik",
    Tarih: "2025-03-19 01:47:22",
  },
  {
    submission_id: 125569,
    Ad: "Tuba",
    Soyad: "Akboğa",
    Mail_Adresi: "takbogaa@gmail.com",
    Telefon: "5510851296",
    Egitim_Durumu: "Lisans Öğrencisi",
    Universite: "Mersin Üniversitesi",
    Bolum: "Sosyoloji",
    Sinif: "1.Sinif",
    Aldigi_Dersler:
      "Yazılım Teknolojileri ve Yapay Zeka, Satış, Pazarlama ve Marka Yaratma, Dijital Pazarlama, Influencer Marketing ve Girişimcilik, İnsan Kaynakları ve Yetenek Kazanımı",
    Tarih: "2025-03-19 01:45:06",
  },
]
  
  */
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { allData } = useSelector((state: RootState) => state.data);
  const requestAllDataAsync = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<SubmissionData[]>("/all-data.php");
      dispatch(setAllData(response.data));
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const requestAllDataFromGoAsync = useCallback(async () => {
    setLoading(true);
    try {
      // PHP yerine Go API'den çekiyoruz
      const response = await goStreamClient.get<SubmissionData[]>("/all-data");
      dispatch(setAllData(response.data));
    } catch (error) {
      console.error("GO API veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // tüm veri sayısını hesapla
  const allDataCount = allData.length;

  // BUGÜNKÜ BAŞVURU SAYISI
  const todayDataCount = allData.filter((data) => {
    const today = new Date();
    const dataDate = new Date(data.Tarih);
    return (
      today.getDate() === dataDate.getDate() &&
      today.getMonth() === dataDate.getMonth() &&
      today.getFullYear() === dataDate.getFullYear()
    );
  }).length;

  // HAFTALIK ORTALAMA BAŞVURU SAYISI
  const weeklyDataCount = allData.filter((data) => {
    const today = new Date();
    const dataDate = new Date(data.Tarih);
    return (
      today.getDate() - dataDate.getDate() <= 7 &&
      today.getMonth() === dataDate.getMonth() &&
      today.getFullYear() === dataDate.getFullYear()
    );
  }).length;

  // DÜNKÜ BAŞVURU SAYISI
  const yesterdayDataCount = allData.filter((data) => {
    const today = new Date();
    const dataDate = new Date(data.Tarih);
    return (
      today.getDate() - dataDate.getDate() === 1 &&
      today.getMonth() === dataDate.getMonth() &&
      today.getFullYear() === dataDate.getFullYear()
    );
  }).length;

  // Düne göre artış veya azalış yüzdesi (NaN veya Infinity kontrolü)
  const yesterdayDataCountPercentage =
    yesterdayDataCount > 0
      ? ((todayDataCount - yesterdayDataCount) / yesterdayDataCount) * 100
      : 0;

  // Bugünün dünküne göre artış veya azalış yüzdesi (NaN veya Infinity kontrolü)
  const todayDataCountPercentage =
    yesterdayDataCount > 0
      ? ((todayDataCount - yesterdayDataCount) / yesterdayDataCount) * 100
      : 0;

  // Cache'i zorla yenileyen fonksiyon
  const refreshAllDataAsync = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<SubmissionData[]>(
        "/all-data.php?refresh=1"
      );
      dispatch(setAllData(response.data));
    } catch (error) {
      console.error("Yenileme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const refreshAllDataFromGoAsync = useCallback(async () => {
    setLoading(true);
    try {
      // Go API'den cache refresh'li veri çekiyoruz
      const response = await goStreamClient.get<SubmissionData[]>(
        "/all-data?refresh=1"
      );
      dispatch(setAllData(response.data));
    } catch (error) {
      console.error("GO API yenileme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const lastSenkronDate = async () => {
    try {
      const response = await httpClient.get<LastSyncData | null>(
        "/last-senkron-date.php"
      );

      return response.data || null;
    } catch (error) {
      console.log("Son senkronizasyon tarihi alınamadı:", error);
      return null;
    }
  };

  const lastSenkronDateGoAsync = async () => {
    try {
      const response = await goStreamClient.get<LastSyncData | null>(
        "/last-senkron-date"
      );
      return response.data || null;
    } catch (error) {
      console.log("GO API'den son senkronizasyon tarihi alınamadı:", error);
      return null;
    }
  };

  const requestAllDataFromPhpAsync = useCallback(async () => {
    setLoading(true);
    try {
      // PHP API'den veriyi çekiyoruz
      const response = await httpClientPHP.get<SubmissionData[]>(
        "/?route=all-data"
      );
      dispatch(setAllData(response.data));
    } catch (error) {
      console.error("PHP API veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const refreshAllDataFromPhpAsync = useCallback(async () => {
    setLoading(true);
    try {
      // PHP API'den cache refresh ile veri çekiyoruz
      const response = await httpClientPHP.get<SubmissionData[]>(
        "/?route=all-data&refresh=1"
      );
      dispatch(setAllData(response.data));
    } catch (error) {
      console.error("PHP API yenileme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const lastSenkronDateFromPhp = async () => {
    try {
      const response = await httpClientPHP.get<LastSyncData | null>(
        "/?route=last-senkron-date"
      );
      return response.data || null;
    } catch (error) {
      console.log("PHP Son senkronizasyon tarihi alınamadı:", error);
      return null;
    }
  };

  return {
    allData,
    requestAllDataAsync,
    todayDataCount,
    allDataCount,
    weeklyDataCount,
    yesterdayDataCount,
    lastSenkronDate,
    requestAllDataFromGoAsync,
    lastSenkronDateGoAsync,
    refreshAllDataFromGoAsync,
    yesterdayDataCountPercentage,
    todayDataCountPercentage,
    requestAllDataFromPhpAsync,
    refreshAllDataAsync,
    refreshAllDataFromPhpAsync,
    lastSenkronDateFromPhp,
    loading,
  };
}
