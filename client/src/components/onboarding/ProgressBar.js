import React from "react";

export default function ProgressBar({ currentStep, steps }) {
  const totalSteps = steps.length;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-4">
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className="bg-red-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-sm font-medium text-gray-700">
        {steps.map((step, idx) => {
          const isActive = idx + 1 === currentStep;
          const isCompleted = idx + 1 < currentStep;
          return (
            <span
              key={idx}
              className={`${isActive ? "text-red-600 font-bold" : isCompleted ? "text-red-400" : "text-gray-400"}`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
