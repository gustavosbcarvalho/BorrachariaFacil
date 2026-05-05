"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface Props {
  message: string;
  type: "success" | "error" | "info";
}

const STYLES = {
  success: { bg: "bg-green-50 border-green-400", text: "text-green-800", Icon: CheckCircle, iconColor: "text-green-500" },
  error:   { bg: "bg-red-50 border-red-400",   text: "text-red-800",   Icon: XCircle,     iconColor: "text-red-500" },
  info:    { bg: "bg-blue-50 border-blue-400",  text: "text-blue-800",  Icon: Info,         iconColor: "text-blue-500" },
};

export function FlashMessage({ message, type }: Props) {
  const [visible, setVisible] = useState(true);
  const { bg, text, Icon, iconColor } = STYLES[type];

  // Remove the cookie after reading so it doesn't reappear on refresh
  useEffect(() => {
    document.cookie = "flash=; Max-Age=0; path=/";
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed top-16 left-4 right-4 z-50 border rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg ${bg}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button onClick={() => setVisible(false)} className={`flex-shrink-0 ${text}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
