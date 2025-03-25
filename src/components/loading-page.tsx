"use client"
import { motion } from "framer-motion"

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-3xl font-bold tracking-wide text-gray-800 dark:text-white"
      >
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="drop-shadow-md"
        >
          Yükleniyor...
        </motion.span>
      </motion.div>
    </div>
  )
}
