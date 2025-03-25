"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <div className="text-primary font-extrabold text-2xl tracking-tight">GEN</div>
          <div className="ml-1 text-gray-600 text-xs mt-1 font-semibold tracking-widest">ACADEMY</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="font-medium text-sm">
          Yardım
        </Button>
        <Button variant="outline" size="sm" className="font-medium text-sm">
          Profiller
        </Button>
      </div>
    </header>
  )
}

