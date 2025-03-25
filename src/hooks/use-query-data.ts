import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/plugins/http-client-flask";

//@ts-ignore
interface UseQueryDataProps<T> {
  endpoint: string;
  enabled?: boolean; // Fetch'in otomatik başlayıp başlamayacağını kontrol etmek için
}

export default function useQueryData<T>({ endpoint, enabled = true }: UseQueryDataProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const controller = new AbortController(); // Gereksiz istekleri iptal etmek için
    const signal = controller.signal;

    try {
      const response = await httpClient.get<T>(endpoint, { signal });
      setData(response.data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort(); // Bileşen unmount olduğunda istek iptal edilir
  }, [endpoint]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return { data, loading, error, refetch: fetchData };
}