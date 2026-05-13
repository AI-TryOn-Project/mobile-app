import React from "react";

interface SubViewProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const SubView: React.FC<SubViewProps> = ({ title, onBack, children, rightAction }) => {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <button onClick={onBack} className="text-sm font-medium text-neutral-600">
          ← Back
        </button>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        <div className="min-w-[40px] text-right">{rightAction}</div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};
