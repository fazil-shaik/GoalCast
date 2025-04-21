import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/components/dashboard/goal-card";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { GoalWithProgress } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Goal, CheckIn } from "@shared/schema";
import { calculateGoalProgress } from "@/lib/utils";

export default function MyGoals() {
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  
  // Fetch goals and check-ins
  const goalsQuery = useQuery({
    queryKey: ['/api/goals'],
    staleTime: 0, // Always fetch fresh data
  });
  
  const checkInsQuery = useQuery({
    queryKey: ['/api/checkins'],
    staleTime: 0, // Always fetch fresh data
  });
  
  // Process data
  const goals = goalsQuery.data as Goal[] || [];
  const checkIns = checkInsQuery.data as CheckIn[] || [];
  
  // Create goal with progress objects
  const goalsWithProgress: GoalWithProgress[] = goals.map((goal) => {
    const goalCheckIns = checkIns.filter((checkIn) => checkIn.goalId === goal.id);
    return calculateGoalProgress(goal, goalCheckIns);
  });
  
  // Filter goals by status
  const activeGoals = goalsWithProgress.filter((goal) => 
    goal.originalStatus === "active"
  );
  const completedGoals = goalsWithProgress.filter((goal) => 
    goal.originalStatus === "completed"
  );
  
  // UI loading state
  const isLoading = goalsQuery.isLoading || checkInsQuery.isLoading;
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Goals
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

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedGoals.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <Skeleton className="h-96 rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <i className="ri-target-line text-xl text-primary-600"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No active goals</h3>
              <p className="text-gray-500 mb-4">Create your first goal to start tracking your progress</p>
              <Button onClick={() => setIsCreateGoalModalOpen(true)}>
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <Skeleton className="h-96 rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
          ) : completedGoals.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <i className="ri-check-double-line text-xl text-primary-600"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No completed goals yet</h3>
              <p className="text-gray-500">Your completed goals will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Goal Modal */}
      <CreateGoalModal 
        isOpen={isCreateGoalModalOpen} 
        onClose={() => setIsCreateGoalModalOpen(false)} 
      />
    </div>
  );
}
