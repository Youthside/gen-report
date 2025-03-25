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
        "/all-data.php"
      );
      if (response.status === 200 && response.data) {
        dispatch(setAllData(response.data));
      } else {
        console.error("PHP API yanıtı boş veya geçersiz:", response);
      }
    } catch (error: any) {
      console.error(
        "PHP API veri çekme hatası:",
        error?.response?.data || error
      );
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
      if (response.status === 200 && response.data) {
        dispatch(setAllData(response.data));
        console.log("✅ PHP Refresh Başarılı");
      } else {
        console.error("PHP API refresh yanıtı boş veya geçersiz:", response);
      }
    } catch (error: any) {
      console.error(
        "❌ PHP API yenileme hatası:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const lastSenkronDateFromPhp = async () => {
    try {
      const response = await httpClientPHP.get<LastSyncData | null>(
        "/last-senkron-date.php"
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
