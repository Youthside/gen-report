"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { RefreshCw, X } from "lucide-react"

interface TopLoadingAlertProps {
  onClose?: () => void
  showCloseButton?: boolean
  duration?: number
}

export default function TopLoadingAlert({ onClose, showCloseButton = false, duration = 40000 }: TopLoadingAlertProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = 50 // Update every 50ms
    const incrementPerInterval = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + incrementPerInterval, 100)

        if (newProgress >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsVisible(false), 1000)
        }

        return newProgress
      })
    }, interval)

    return () => clearInterval(timer)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 mx-auto p-2 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="container mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {progress < 100 ? "Veriler yükleniyor..." : "Yükleme tamamlandı!"}
                </span>
                <span className="text-xs text-gray-500 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {showCloseButton && (
            <button
              onClick={handleClose}
              className="ml-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

