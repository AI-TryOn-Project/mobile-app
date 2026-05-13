import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bg =
    type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-neutral-900";

  return (
    <div className={`fixed top-4 left-1/2 z-[100] -translate-x-1/2 ${bg} text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2`}>
      {message}
    </div>
  );
};
