import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { AccountabilityFeed } from "@/components/dashboard/accountability-feed";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { DashboardStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  
  // Fetch stats
  const statsQuery = useQuery({
    queryKey: ['/api/stats'],
  });
  
  // Process data
  const stats = statsQuery.data as DashboardStats || {
    activeGoals: { count: 0, limit: 2 },
    currentStreak: { days: 0, isLongest: false },
    socialEngagement: { count: 0, percentChange: 0 },
    checkInRate: { percentage: 0, status: "On track" as const }
  };
  
  // UI loading states
  const isLoading = statsQuery.isLoading;
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            onClick={() => setIsCreateGoalModalOpen(true)}
            className="inline-flex items-center"
          >
            <i className="ri-add-line mr-2"></i>
            Create Goal
          </Button>
        </div>
      </div>

      {/* User Goal Summary */}
      <div className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ) : (
          <SummaryStats stats={stats} />
        )}
      </div>
      
      {/* Accountability Feed */}
      <AccountabilityFeed />
      
      {/* Create Goal Modal */}
      <CreateGoalModal 
        isOpen={isCreateGoalModalOpen} 
        onClose={() => setIsCreateGoalModalOpen(false)} 
      />
    </div>
  );
}
