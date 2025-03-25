"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useDataManager from "@/hooks/use-data-manager";

// Simple media query hook that works in React 18
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    // Set initial value
    updateMatch();

    // Setup listeners
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateMatch);
      return () => media.removeEventListener("change", updateMatch);
    } else {
      // Fallback for older browsers
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);

  return matches;
}


export function DashboardContent() {
  //@ts-ignore
  const [isCountingUp, setIsCountingUp] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    allDataCount,
    todayDataCount,
    weeklyDataCount,
    yesterdayDataCount,
    yesterdayDataCountPercentage,
    todayDataCountPercentage,
  } = useDataManager();

  return (
    <>
      <Card className="mt-10 mb-10 border-none shadow-2xl rounded-2xl overflow-visible bg-gradient-to-r from-white to-gray-100">
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex flex-col space-y-3">
                <p className="text-gray-800 font-semibold text-lg md:text-xl">
                  Bugünkü başvurun dünkü başvurundan{" "}
                  <span
                    className={
                      yesterdayDataCountPercentage < 0
                        ? "text-primary-700"
                        : "text-secondary-700"
                    }
                  >
                    {yesterdayDataCountPercentage.toFixed(2)}%
                  </span>{" "}
                  {yesterdayDataCountPercentage < 0 ? "daha az" : "daha fazla"}.
                </p>
                <p className="text-gray-800 font-semibold text-lg md:text-xl">
                  Geçen haftaki başvurun bu haftaki başvurundan{" "}
                  <span
                    className={
                      todayDataCountPercentage < 0
                        ? "text-primary-700"
                        : "text-secondary-700"
                    }
                  >
                    {todayDataCountPercentage.toFixed(2)}%
                  </span>{" "}
                  {todayDataCountPercentage < 0 ? "daha az" : "daha fazla"}.
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <RefreshCw className="h-16 w-16 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-10">
        <PremiumStatCard
          title="TÜM BAŞVURULAR"
          value={allDataCount.toString()}
          subtitle=""
          highlight={true}
          isCountingUp={isCountingUp}
          isMobile={isMobile}
        />

        <PremiumStatCard
          title="BUGÜNKÜ BAŞVURU"
          value={todayDataCount.toString()}
          subtitle="Düne göre"
          change={todayDataCountPercentage.toFixed(2) + "%"}
          trend={todayDataCountPercentage > 0 ? "up" : "down"}
          isCountingUp={isCountingUp}
          isMobile={isMobile}
        />

        <PremiumStatCard
          title="HAFTALIK ORTALAMA"
          value={weeklyDataCount.toString()}
          subtitle="Geçen haftaya göre"
          isCountingUp={isCountingUp}
          isMobile={isMobile}
        />

        <PremiumStatCard
          title="DÜNKÜ BAŞVURU"
          value={yesterdayDataCount.toString()}
          subtitle="Bugüne göre"
          change={yesterdayDataCountPercentage.toFixed(2) + "%"}
          trend={yesterdayDataCountPercentage > 0 ? "up" : "down"}
          isCountingUp={isCountingUp}
          isMobile={isMobile}
        />
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: "up" | "down";
  highlight?: boolean;
  isCountingUp: boolean;
  isMobile: boolean;
}

function PremiumStatCard({
  title,
  value,
  subtitle,
  change,
  trend,
  highlight = false,
  isCountingUp,
  isMobile,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 h-full ${
        highlight ? "border-l-4 border-primary" : ""
      }`}
    >
      <div className="p-5 md:p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {title}
        </h3>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-baseline"
        >
          <CountUpValue
            value={value}
            isCountingUp={isCountingUp}
            isMobile={isMobile}
          />
        </motion.div>

        {subtitle && change && (
          <div className="flex items-center mt-3">
            <span className="text-sm text-gray-500 font-medium mr-2">
              {subtitle}
            </span>
            <div
              className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
                trend === "up"
                  ? "text-secondary-700 bg-secondary-50"
                  : "text-primary-700 bg-primary-50"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 mr-1" />
              )}
              {change}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CountUpValue({
  value,
  isCountingUp,
  isMobile,
}: {
  value: string;
  isCountingUp: boolean;
  isMobile: boolean;
}) {
  // Remove commas for calculation
  const numericValue = parseInt(value.replace(/,/g, ""));
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isCountingUp) return;

    let start = 0;
    const end = numericValue;
    const duration = 1500;
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue, isCountingUp]);

  // Format with commas
  const formattedCount = isCountingUp
    ? new Intl.NumberFormat("tr-TR").format(count)
    : value;

  return (
    <div
      className={`font-bold tracking-tight text-gray-800 ${
        isMobile ? "text-3xl" : "text-4xl"
      }`}
    >
      {formattedCount}
    </div>
  );
}
