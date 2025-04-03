"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Database, Server, CheckCircle2 } from "lucide-react";
import React from "react";

export default function EnhancedLoading() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Change the loadingSteps array to use more user-friendly language
  const loadingSteps = [
    { icon: Database, text: "Bilgileriniz hazırlanıyor..." },
    { icon: Server, text: "Veriler toplanıyor..." },
    { icon: RefreshCw, text: "Her şey düzenleniyor..." },
    { icon: CheckCircle2, text: "Son rötuşlar yapılıyor..." },
  ];

  // Change the useEffect to make the loading last 40 seconds
  useEffect(() => {
    // Simulate progress over 40 seconds
    const totalDuration = 40000; // 40 seconds
    const interval = 50; // Update every 50ms
    const incrementPerInterval = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + incrementPerInterval, 100);

        // Update the current step based on progress
        if (newProgress >= 20 && currentStep < 1) setCurrentStep(1);
        else if (newProgress >= 45 && currentStep < 2) setCurrentStep(2);
        else if (newProgress >= 75 && currentStep < 3) setCurrentStep(3);

        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => setCompleted(true), 500);
        }

        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md p-8 rounded-xl bg-white shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <motion.div
            className="relative w-32 h-32 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background circle */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />

            {/* Progress circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                strokeWidth="8"
                stroke="hsl(var(--primary))"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  strokeDasharray: "360",
                  strokeDashoffset: "0",
                }}
              />
            </svg>

            {/* Current step icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="text-primary"
              >
                {completed ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                ) : (
                  React.createElement(loadingSteps[currentStep].icon, {
                    className: "w-12 h-12",
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Progress percentage */}
          <motion.div
            className="text-2xl font-bold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {completed ? "Tamamlandı!" : `${Math.round(progress)}%`}
          </motion.div>

          {/* Current step text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-600"
            >
              {completed
                ? "Yönlendiriliyorsunuz..."
                : loadingSteps[currentStep].text}
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Subtle animation dots */}
          <div className="flex space-x-2 mt-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0,
              }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.2,
              }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.4,
              }}
            />
          </div>

          {/* Loading tips */}
          {/* Update the AnimatePresence for tips to show more tips during the longer loading time */}
          <AnimatePresence mode="wait">
            <motion.div
              key={Math.floor(progress / 20)} // Change from 25 to 20 to show more tips
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs text-center text-gray-500 italic mt-4"
            >
              {getTip(Math.floor(progress / 20))}
            </motion.div>
          </AnimatePresence>

          {/* Random fun facts to keep users entertained */}
          {progress > 15 && progress < 95 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 p-3 bg-gray-50 rounded-lg max-w-xs mx-auto"
            >
              <p className="text-xs text-center text-gray-600">
                {getRandomFunFact(Math.floor(progress / 10))}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Change the tips to be more engaging and playful
function getTip(index: number): string {
  const tips = [
    "Sizin için en güncel bilgiler getiriliyor...",
    "Biraz zaman alabilir, bu arada belki bir kahve molası verebilirsiniz ☕",
    "Neredeyse hazır! Tüm bilgiler özenle hazırlanıyor...",
    "Son dokunuşlar yapılıyor, birazdan her şey hazır olacak!",
    "Sabırla beklediğiniz için teşekkürler, çok az kaldı...",
  ];

  return tips[Math.min(index, tips.length - 1)];
}

function getRandomFunFact(seed: number): string {
  const funFacts = [
    "Biliyor muydunuz? Bir insan ortalama günde 23.000 kez nefes alır.",
    "İlginç bilgi: Bal, doğal olarak asla bozulmaz. Mısır piramitlerinde bulunan bal hala yenilebilir!",
    "Merak edenler için: Bir yıldırım düştüğünde, sıcaklığı güneşin yüzeyinden daha sıcak olabilir.",
    "Şaşırtıcı gerçek: Koalalar, parmak izlerine sahip tek hayvanlardır ve insan parmak izlerine çok benzerler.",
    "İlginç bilgi: İnsan gözü yaklaşık 10 milyon farklı rengi ayırt edebilir.",
    "Biliyor muydunuz? Bir okyanusun en derin noktası olan Mariana Çukuru, Everest Dağı'nı içine alabilecek kadar derindir.",
    "Şaşırtıcı gerçek: Bir çita, 3 saniyede 0'dan 100 km/s hıza ulaşabilir.",
    "İlginç bilgi: Dünya üzerindeki tüm altınlar bir araya getirilse, yaklaşık 3 olimpik yüzme havuzunu doldurabilir.",
  ];

  return funFacts[seed % funFacts.length];
}
