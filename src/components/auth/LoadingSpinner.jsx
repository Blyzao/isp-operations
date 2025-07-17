import React from "react";
import { Loader2 } from "lucide-react";

function LoadingSpinner({
  message = "Chargement en cours...",
  size = "large",
}) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const containerClasses = {
    small: "my-4",
    medium: "my-6",
    large: "my-8",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${containerClasses[size]}`}
    >
      {/* Animated Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Background circle */}
          <div
            className={`${sizeClasses[size]} absolute inset-0 border-4 border-blue-100 rounded-full`}
          ></div>

          {/* Animated circle */}
          <div
            className={`${sizeClasses[size]} absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin`}
          ></div>

          {/* Inner pulse */}
          <div
            className={`${sizeClasses[size]} absolute inset-2 bg-blue-50 rounded-full animate-pulse`}
          ></div>
        </div>

        {/* Floating dots */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
      </div>

      {/* Loading text */}
      <div className="text-center space-y-1">
        <p className="text-gray-600 font-medium text-sm">{message}</p>
        <div className="flex items-center justify-center space-x-1">
          <div
            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Alternative minimal spinner for inline use
export function InlineSpinner({ className = "" }) {
  return <Loader2 className={`animate-spin text-blue-600 ${className}`} />;
}

export default LoadingSpinner;
