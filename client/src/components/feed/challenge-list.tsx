import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChallengeWithDetails } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ChallengeListProps {
  filter?: {
    sortBy?: string;
    timeRange?: string;
    type?: string;
    tags?: string[];
  };
  searchTerm?: string;
}

export function ChallengeList({ filter = {}, searchTerm = "" }: ChallengeListProps) {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeWithDetails | null>(null);
  
  // Fetch challenges
  const challengesQuery = useQuery({
    queryKey: ['/api/challenges', filter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
      if (filter.timeRange) queryParams.append('timeRange', filter.timeRange);
      if (filter.type) queryParams.append('type', filter.type);
      if (filter.tags?.length) queryParams.append('tags', filter.tags.join(','));
      
      const response = await fetch(`/api/challenges?${queryParams.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      
      return response.json();
    }
  });
  
  const challenges = challengesQuery.data?.challenges as ChallengeWithDetails[] || [];
  
  // Filter challenges based on search
  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.creator.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Join a challenge
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to join challenge');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
  });
  
  // Leave a challenge
  const leaveChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await fetch(`/api/challenges/${challengeId}/leave`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to leave challenge');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
  });
  
  const handleJoinChallenge = (challenge: ChallengeWithDetails) => {
    joinChallengeMutation.mutate(challenge.id);
  };
  
  const handleLeaveChallenge = (challenge: ChallengeWithDetails) => {
    leaveChallengeMutation.mutate(challenge.id);
  };
  
  if (challengesQuery.isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Public Challenges
            </h3>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (filteredChallenges.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <i className="ri-trophy-line text-xl text-primary-600"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No challenges found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search or create a new challenge</p>
        <Button variant="outline">
          Create Challenge
        </Button>
      </Card>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Public Challenges
          </h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.map((challenge) => (
          <Card key={challenge.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium text-gray-900">{challenge.title}</h4>
              <Badge variant={challenge.type === 'one-time' ? 'default' : 'secondary'}>
                {challenge.type}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={challenge.creator.avatarUrl || `https://ui-avatars.com/api/?name=${challenge.creator.fullName}&background=random`}
                  alt={challenge.creator.fullName} 
                />
                <AvatarFallback>{challenge.creator.fullName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-500">by {challenge.creator.fullName}</span>
            </div>
            
            <p className="text-sm text-gray-700 mb-4">{challenge.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <i className="ri-user-line mr-1"></i>
                  {challenge.participantCount} participants
                </span>
                <span className="flex items-center">
                  <i className="ri-time-line mr-1"></i>
                  {formatTimeAgo(challenge.createdAt)}
                </span>
              </div>
              {challenge.tags && challenge.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {challenge.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant={challenge.isParticipating ? "outline" : "default"}
                size="sm"
                onClick={() => challenge.isParticipating ? handleLeaveChallenge(challenge) : handleJoinChallenge(challenge)}
                disabled={joinChallengeMutation.isPending || leaveChallengeMutation.isPending}
              >
                {challenge.isParticipating ? 'Leave Challenge' : 'Join Challenge'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveChallenge(challenge)}
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {filteredChallenges.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline">
            View all challenges
          </Button>
        </div>
      )}
    </div>
  );
} 