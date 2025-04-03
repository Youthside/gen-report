"use client";

import { useEffect, useState } from "react";
import useDataManager from "@/hooks/use-data-manager";
import {
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import useSynchronousManager from "@/hooks/use-synchronous-manager";
import TopLoadingAlert from "./top-loading-alert";

interface ISyncButtonProps {
  showLastSyncTime?: boolean;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  style?: React.HTMLAttributes<HTMLDivElement>["style"];
  showInfoAlert?: boolean;
  onClick?: () => void;
}
export default function SyncButton({
  showLastSyncTime = true,
  className,
  style,
  showInfoAlert = true,
  onClick,
}: ISyncButtonProps) {
  const { refreshAllDataAsync, loading, lastSenkronDateFromPhp } =
    useDataManager();

  const {
    lastSyncTime,
    syncStatus,
    showSuccessAnimation,
    setLastSyncTime,
    setSyncStatus,
    setShowSuccessAnimation,
  } = useSynchronousManager();
  const [showTopAlert, setShowTopAlert] = useState(false);
  const [loadingValue, setLoadingValue] = useState(0);
  const handleSync = async () => {
    if (onClick) {
      onClick();
    }
    setSyncStatus("syncing");
    setShowTopAlert(true); // başlarken göster

    try {
      await refreshAllDataAsync();
      setLoadingValue(100); // senkronizasyon tamamlandığında %100 yap

      // başarı durumunda göstermek ve 1 saniye sonra kapatmak için
      setTimeout(() => {
        setSyncStatus("success");
        setShowSuccessAnimation(true);
        setShowTopAlert(true); // yine göster
        setTimeout(() => {
          setShowTopAlert(false); // 1 saniye sonra gizle
          setShowSuccessAnimation(false);
          setSyncStatus("idle");
        }, 1000);
      }, 500);

      await handleLastSync();
    } catch (error) {
      setSyncStatus("error");
      setShowTopAlert(true); // hata durumunda da göster
      setTimeout(() => {
        setShowTopAlert(false); // sonra kapat
        setSyncStatus("idle");
      }, 3000);
    }
  };

  const handleLastSync = async () => {
    try {
      const time = await lastSenkronDateFromPhp();
      setLastSyncTime(time);
    } catch (error) {
      console.error("Son senkronizasyon zamanı alınamadı:", error);
    }
  };

  useEffect(() => {
    handleLastSync();
  }, []);

  const formatSyncTime = () => {
    if (!lastSyncTime || !lastSyncTime.last_sync) return "Bilgi yok";
    const syncDate = new Date(lastSyncTime.last_sync);
    if (isNaN(syncDate.getTime())) return "Geçersiz tarih";

    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - syncDate.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 60) {
      return formatDistanceToNow(syncDate, { addSuffix: true, locale: tr });
    }

    if (syncDate.toDateString() === now.toDateString()) {
      return `Bugün ${format(syncDate, "HH:mm")}`;
    }

    return format(syncDate, "dd.MM.yyyy HH:mm", { locale: tr });
  };

  const buttonVariants = {
    idle: "bg-primary hover:bg-primary-600 text-white",
    syncing: "bg-primary/80 text-white cursor-not-allowed",
    success: "bg-green-600 hover:bg-green-700 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
  };

  const buttonIcons = {
    idle: <RefreshCw className="mr-2 h-4 w-4" />,
    syncing: <RefreshCw className="mr-2 h-4 w-4 animate-spin" />,
    success: <CheckCircle className="mr-2 h-4 w-4" />,
    error: <AlertCircle className="mr-2 h-4 w-4" />,
  };

  const buttonText = {
    idle: "Senkronize Et",
    syncing: "Senkronize Ediliyor...",
    success: "Senkronizasyon Başarılı",
    error: "Senkronizasyon Hatası",
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <TooltipProvider>
          <Tooltip>
            {showLastSyncTime && (
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="whitespace-nowrap">Son Senkron:</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal",
                      lastSyncTime &&
                        new Date(lastSyncTime.last_sync).getTime() >
                          Date.now() - 10 * 60 * 1000
                        ? "border-green-500 text-green-600"
                        : "border-amber-500 text-amber-600"
                    )}
                  >
                    {formatSyncTime()}
                  </Badge>
                </div>
              </TooltipTrigger>
            )}
            <TooltipContent>
              <p>Son veri senkronizasyonu zamanı</p>
              {lastSyncTime &&
              lastSyncTime.last_sync &&
              !isNaN(new Date(lastSyncTime.last_sync).getTime()) ? (
                <p className="text-xs text-muted-foreground">
                  {format(
                    new Date(lastSyncTime.last_sync),
                    "dd MMMM yyyy HH:mm:ss",
                    {
                      locale: tr,
                    }
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Geçersiz tarih</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          onClick={handleSync}
          disabled={loading || syncStatus === "syncing"}
          className={
            cn(
              "transition-all duration-300 shadow-md hover:shadow-lg",
              buttonVariants[syncStatus],
              showSuccessAnimation && "animate-pulse"
            ) +
            " " +
            className
          }
          style={style}
          size="sm"
        >
          {buttonIcons[syncStatus]}
          {buttonText[syncStatus]}
        </Button>
      </div>

      {showTopAlert && showInfoAlert && (
        <TopLoadingAlert value={loadingValue} />
      )}
    </div>
  );
}
