import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { GoalWithProgress } from "@/lib/types";
import { getStatusColor, getProgressColor } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { SocialSharePreview } from "@/components/dashboard/social-share-preview";
import { useAIEnhancementStore, enhanceCheckInNote, canEnhanceMore } from "@/lib/ai-service";
import { toast } from "sonner";

interface GoalCardProps {
  goal: GoalWithProgress;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [checkInNote, setCheckInNote] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const { remainingResponses, decrementRemainingResponses } = useAIEnhancementStore();
  
  // Add a check-in mutation
  const addCheckIn = useMutation({
    mutationFn: async (data: { goalId: number; isCompleted: boolean; note: string }) => {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to check in');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear input and refetch goals
      setCheckInNote("");
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/checkins'] });
    },
  });

  // Add mutation for launching MVP
  const launchMVPMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/goals/${goal.id}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to launch MVP');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast.success('MVP launched successfully!');
    },
    onError: (error) => {
      toast.error('Failed to launch MVP: ' + error.message);
    },
  });

  // Handle AI enhancement
  const handleEnhanceNote = async () => {
    if (!checkInNote.trim()) {
      toast.error("Please enter a note first");
      return;
    }

    if (!canEnhanceMore(useAIEnhancementStore.getState())) {
      toast.error("You've reached the limit of AI enhancements. Please try again in an hour.");
      return;
    }

    try {
      setIsEnhancing(true);
      const enhancedNote = await enhanceCheckInNote(checkInNote);
      setCheckInNote(enhancedNote);
      decrementRemainingResponses();
      toast.success("Note enhanced successfully!");
    } catch (error) {
      toast.error("Failed to enhance note. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle MVP launch
  const handleLaunchMVP = async () => {
    setIsLaunching(true);
    try {
      await launchMVPMutation.mutateAsync();
    } finally {
      setIsLaunching(false);
    }
  };

  // Calculate text values based on goal type
  const typeText = goal.type === 'challenge' ? 'Challenge' : goal.type === 'recurring' ? 'Recurring goal' : 'One-time goal';
  
  // Generate date info text
  let dateInfo = "";
  if (goal.type === 'one-time') {
    // Show "Due Date" for one-time goals
    dateInfo = goal.endDate ? `Due ${new Date(goal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '';
  } else {
    // Show "days left" for challenges and recurring
    const endDate = new Date(goal.endDate || '');
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 0) {
      dateInfo = `${daysLeft} days left`;
    } else {
      dateInfo = "Completed";
    }
  }
  
  // Handle check-in
  const handleCheckIn = (isCompleted: boolean) => {
    addCheckIn.mutate({
      goalId: goal.id,
      isCompleted,
      note: checkInNote,
    });
  };
  
  // Generate social post content
  const socialPostContent = `Day ${goal.daysCompleted}/${goal.totalDays}: ${checkInNote || `Making progress on my ${goal.title}!`} 🚀 #BuildInPublic #GoalCast`;
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center">
              <h4 className="text-lg font-medium text-gray-900">{goal.title}</h4>
              {goal.type === 'challenge' && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Challenge
                </Badge>
              )}
              {goal.title.toLowerCase().includes('mvp') && (
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                  MVP
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{typeText} • {dateInfo}</p>
          </div>
          <div className="relative">
            <ProgressRing 
              progress={goal.progress} 
              size={64} 
              strokeWidth={4}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="font-mono font-medium">
                <i className={`${goal.type === 'challenge' ? 'ri-fire-line text-warning-500' : 'ri-calendar-check-line text-success-500'} mr-1`}></i>
                {goal.daysCompleted}/{goal.totalDays}
              </span>
              <span className="ml-2 text-gray-500">
                {goal.type === 'challenge' ? 'days completed' : 'days on track'}
              </span>
            </div>
            <div>
              <Badge variant="outline" className={getStatusColor(goal.status)}>
                {goal.status}
              </Badge>
            </div>
          </div>
          
          {goal.type === 'challenge' && (
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      Weekly Streak
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {goal.weeklyProgress.map((day, index) => (
                    <div 
                      key={index} 
                      className={`h-2 rounded-sm ${day ? 'bg-success-500' : 'bg-danger-500'}`}
                      style={{ width: 'calc(100% / 7)' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-5 border-t border-gray-200 pt-4">
          {goal.title.toLowerCase().includes('mvp') && goal.progress >= 100 ? (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700">Ready to Launch</h5>
                <p className="text-xs text-gray-500">Your MVP is ready to be launched!</p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleLaunchMVP}
                disabled={isLaunching}
              >
                {isLaunching ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-1"></i>
                    Launching...
                  </>
                ) : (
                  <>
                    <i className="ri-rocket-line mr-1"></i>
                    Launch MVP
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-700">Today's Check-in</h5>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="bg-success-500 hover:bg-success-600"
                  onClick={() => handleCheckIn(true)}
                  disabled={addCheckIn.isPending}
                >
                  <i className="ri-check-line mr-1"></i> 
                  {goal.type === 'challenge' ? 'Completed' : 'On Track'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCheckIn(false)}
                  disabled={addCheckIn.isPending}
                >
                  {goal.type === 'challenge' ? 'Skip' : 'Not Today'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <div className="relative">
              <Input
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                placeholder={
                  goal.type === 'challenge' 
                    ? "What did you do today?" 
                    : "Add a note about today's progress..."
                }
                className="pr-24"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEnhanceNote}
                  disabled={isEnhancing || !checkInNote.trim()}
                  className="h-8 px-2 text-xs"
                >
                  {isEnhancing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-1"></i>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <i className="ri-magic-line mr-1"></i>
                      Enhance ({remainingResponses})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {goal.type !== 'challenge' ? (
            <div className="mt-4">
              <SocialSharePreview content={socialPostContent} />
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">246 people</span> are doing this challenge
                </div>
                <button className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500">
                  View challenge board
                  <i className="ri-arrow-right-line ml-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
