"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import SyncButton from "./SyncButton";
import useSynchronousManager from "@/hooks/use-synchronous-manager";

export default function RefreshHandler() {
  const [showAlert, setShowAlert] = useState(false);
  const { syncStatus } = useSynchronousManager();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.metaKey && e.key === "r")
      ) {
        e.preventDefault();
        setShowAlert(true);
        return false;
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showAlert) {
        setShowAlert(true);
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showAlert]);

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 overflow-hidden"
        >
          <div className="bg-red-500 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {syncStatus === "syncing" && (
                    <Loader className="h-5 w-5 flex-shrink-0 animate-spin" />
                  )}
                  {syncStatus === "success" && (
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                  )}
                  {syncStatus === "error" && (
                    <XCircle className="h-5 w-5 flex-shrink-0 text-yellow-300" />
                  )}
                  {syncStatus === "idle" && (
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-white" />
                  )}
                  <p className="text-white font-medium">
                    {syncStatus === "syncing" &&
                      "Veriler senkronize ediliyor..."}
                    {syncStatus === "success" &&
                      "Veriler başarıyla senkronize edildi."}
                    {syncStatus === "error" &&
                      "Senkronizasyon sırasında bir hata oluştu."}
                    {syncStatus === "idle" &&
                      "Senkronize etmeden verilerin güncellenmez, yine de sayfayı yenilemek istiyor musunuz?"}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-red-500 transition-colors"
                    onClick={() => {
                      setShowAlert(false);
                    }}
                  >
                    Hayır
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-red-500 border-white hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setShowAlert(false);
                      window.location.reload();
                    }}
                  >
                    Evet
                  </Button>

                  <div>
                    <SyncButton
                      onClick={() => {
                        setShowAlert(false);
                      }}
                      showInfoAlert={false}
                      className="bg-white text-red-500 border-white hover:bg-red-50 transition-colors"
                      showLastSyncTime={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
