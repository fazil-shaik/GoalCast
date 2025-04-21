import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SpotlightUser } from "@/lib/types";

interface SpotlightSectionProps {
  fullWidth?: boolean;
}

export function SpotlightSection({ fullWidth = false }: SpotlightSectionProps) {
  // Fetch spotlight users
  const spotlightQuery = useQuery({
    queryKey: ['/api/spotlight'],
    queryFn: async () => {
      const response = await fetch('/api/spotlight', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch spotlight users');
      }
      
      return response.json();
    }
  });
  
  const spotlightUsers = spotlightQuery.data as SpotlightUser[] || [];
  
  if (spotlightQuery.isLoading) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Spotlight</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (spotlightUsers.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Spotlight</h3>
        <p className="text-sm text-gray-500">No spotlight users available.</p>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Spotlight</h3>
      <div className={`space-y-4 ${fullWidth ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
        {spotlightUsers.map((user) => (
          <div key={user.user.id} className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage 
                src={user.user.avatarUrl || `https://ui-avatars.com/api/?name=${user.user.fullName}&background=random`}
                alt={user.user.fullName} 
              />
              <AvatarFallback>{user.user.fullName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{user.user.fullName}</span>
                {user.isBuilderOfTheWeek && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Builder of the Week
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <div>{user.streak} day streak</div>
                <div>{user.completedGoals}/{user.totalGoals} goals completed</div>
                <div>{user.checkInRate}% check-in rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 