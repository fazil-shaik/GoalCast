import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  className,
  showPercentage = true,
  color
}: ProgressRingProps) {
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Determine color based on progress if not provided
  const strokeColor = color || (
    progress >= 75 ? "stroke-success-500" :
    progress >= 50 ? "stroke-warning-500" : 
    "stroke-danger-500"
  );

  return (
    <div className={cn("relative", className)}>
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
      >
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="#F3F4F6" 
          strokeWidth={strokeWidth} 
          fill="transparent" 
        />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          fill="transparent" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={strokeColor}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
