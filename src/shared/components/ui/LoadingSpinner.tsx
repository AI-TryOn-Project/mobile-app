import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = "" }) => {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
