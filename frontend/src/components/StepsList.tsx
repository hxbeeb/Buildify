
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl p-4 h-full overflow-auto border border-purple-700 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-blue-900">
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          border-radius: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1e293b;
        }
      `}</style>
      <h2 className="text-xl font-extrabold tracking-wide text-white drop-shadow mb-4 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 px-4 py-2 rounded-xl shadow-md border border-blue-800">Build Steps</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={`${step.id}-${index}`}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 shadow-md border-2 ${
              currentStep === step.id
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 border-pink-400 scale-105'
                : 'bg-white/5 border-transparent hover:bg-gradient-to-r hover:from-purple-800 hover:to-blue-800 hover:border-blue-400'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center gap-3">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-400 drop-shadow" />
              ) : step.status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500" />
              )}
              <h3 className="font-bold text-white truncate">{step.title}</h3>
            </div>
            <p className="text-sm text-pink-100 mt-2 font-mono whitespace-pre-line">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
