"use client";

import React from "react";
import {
  FileText,
  LogOut,
  Menu,
  House,
  ArrowUpNarrowWide,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all",
        "focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2",
        active
          ? "bg-primary-100 text-primary-800 font-semibold"
          : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
      )}
    >
      {React.cloneElement(icon as React.ReactElement<any>, {
        size: 20,
        className: cn(
          "flex-shrink-0",
          active ? "text-primary-700" : "text-gray-500"
        ),
      })}
      <span className="text-sm">{text}</span>
    </button>
  );
};

interface SidebarContentProps {
  onItemClick?: () => void;
}

const menuItems = [
  { text: "Ana Sayfa", icon: <House />, path: "/" },
  { text: "Tüm Veriler", icon: <FileText />, path: "/tum-veriler" },
  {
    text: "Gösterge Paneli Analiz",
    icon: <ArrowUpNarrowWide />,
    path: "/gosterge-paneli-analiz",
  },
];
//@ts-ignore
const SidebarContent: React.FC<SidebarContentProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-center">
          <img
            src="https://i0.wp.com/www.genacademy.co/wp-content/uploads/2023/03/gen_logo.png?w=768&ssl=1"
            alt="Youthside Logo"
            className="w-1/2"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300">
          <LogOut size={20} />
          <span className="text-sm font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent onItemClick={handleItemClick} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex h-screen w-64 bg-white border-r border-gray-100 flex-col shadow-sm",
          className
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
