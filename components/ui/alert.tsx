"use client";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoClose?: number;
}

const alertStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

const alertIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

export default function Alert({ type, message, onClose, autoClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = alertIcons[type];

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg ${alertStyles[type]} animate-slide-up`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
