"use client";

import Link from "next/link";
import { LayoutDashboard, Download, Share2 } from "lucide-react";

export function CVActions() {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="absolute top-4 right-4 flex gap-3 items-center no-print z-50">
      <Link 
        href="/dashboard"
        className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        Dashboard
      </Link>
      <div className="flex gap-2">
        <button 
          onClick={handlePrint}
          title="Download PDF"
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10"
        >
          <Download className="w-4 h-4" />
        </button>
        <button 
          onClick={handleShare}
          title="Share CV"
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
