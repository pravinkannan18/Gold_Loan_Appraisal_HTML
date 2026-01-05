import { User, Camera, Shield, FlaskConical, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Appraiser', icon: User },
  { number: 2, label: 'Customer', icon: Camera },
  { number: 3, label: 'Compliance', icon: Shield },
  { number: 4, label: 'Purity', icon: FlaskConical },
  { number: 5, label: 'Summary', icon: FileText },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center justify-between px-4">

          {/* Background Line */}
          <div className="absolute left-0 top-1/2 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0 rounded-full" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">

                {/* Progress Line Color Overlay */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[50%] top-[35%] h-[2px] w-full -z-10 transition-all duration-500",
                      currentStep > step.number ? "bg-blue-600" : "bg-transparent"
                    )}
                    style={{ width: 'calc(100% + 4rem)' }}
                  />
                )}

                <div
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 shadow-sm",
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isActive
                        ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50"
                        : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                    isActive || isCompleted ? "text-blue-900" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
