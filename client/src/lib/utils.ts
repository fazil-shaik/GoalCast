import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Goal, CheckIn } from "@shared/schema";
import { GoalWithProgress } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateGoalProgress(goal: Goal, checkIns: CheckIn[]): GoalWithProgress {
  const startDate = new Date(goal.startDate);
  const endDate = goal.endDate ? new Date(goal.endDate) : addDurationToDate(startDate, goal.duration, goal.durationUnit);
  
  // Calculate total days in goal
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate elapsed days
  const now = new Date();
  const elapsedDays = Math.min(
    totalDays,
    Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  
  // Count completed check-ins
  const completedCheckIns = checkIns.filter(checkIn => checkIn.isCompleted);
  const daysCompleted = completedCheckIns.length;
  
  // Calculate progress percentage
  const progress = Math.round((daysCompleted / totalDays) * 100);
  
  // Calculate status
  const expectedProgress = Math.round((elapsedDays / totalDays) * 100);
  const progressDifference = progress - expectedProgress;
  
  let status: GoalWithProgress["status"];
  if (progressDifference >= -5) {
    status = "On Schedule";
  } else if (progressDifference >= -15) {
    status = "Catching Up";
  } else {
    status = "At Risk";
  }
  
  // Calculate current streak
  let streak = 0;
  const sortedCheckIns = [...checkIns].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get weekly progress (last 7 days)
  const weeklyProgress: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const checkIn = checkIns.find(ci => {
      const ciDate = new Date(ci.date);
      ciDate.setHours(0, 0, 0, 0);
      return ciDate.getTime() === date.getTime();
    });
    
    weeklyProgress.push(checkIn?.isCompleted || false);
  }
  
  // Calculate streak
  for (let i = 0; i < sortedCheckIns.length; i++) {
    if (sortedCheckIns[i].isCompleted) {
      streak++;
    } else {
      break;
    }
  }
  
  return {
    ...goal,
    checkIns,
    progress,
    daysCompleted,
    totalDays,
    status,
    streak,
    weeklyProgress,
    originalStatus: goal.status,
  };
}

export function addDurationToDate(date: Date, duration: number, unit: string): Date {
  const result = new Date(date);
  
  switch (unit.toLowerCase()) {
    case 'days':
      result.setDate(result.getDate() + duration);
      break;
    case 'weeks':
      result.setDate(result.getDate() + (duration * 7));
      break;
    case 'months':
      result.setMonth(result.getMonth() + duration);
      break;
    default:
      result.setDate(result.getDate() + duration);
  }
  
  return result;
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const pastDate = new Date(date);
  const diffMs = now.getTime() - pastDate.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'just now';
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

export const getStatusColor = (status: GoalWithProgress["status"]) => {
  switch (status) {
    case "On Schedule":
      return "bg-green-100 text-green-800";
    case "Catching Up":
      return "bg-yellow-100 text-yellow-800";
    case "At Risk":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getProgressColor = (progress: number) => {
  if (progress >= 75) return "stroke-success-500";
  if (progress >= 50) return "stroke-warning-500";
  return "stroke-danger-500";
};
