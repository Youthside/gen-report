"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

// Simple media query hook
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  //@ts-ignore
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="font-medium">
              Yardım
            </Button>
            <Button variant="outline" className="font-medium">
              Profiller
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
