import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user, setUser } = useAuth();
  
  const statsQuery = useQuery({
    queryKey: ['/api/stats'],
  });
  
  const stats = statsQuery.data as DashboardStats || {
    activeGoals: { count: 0, limit: 2 },
    currentStreak: { days: 0, isLongest: false },
    socialEngagement: { count: 0, percentChange: 0 },
    checkInRate: { percentage: 0, status: "On track" as const }
  };
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setUser(null);
        window.location.href = '/landing';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg">{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-lg">{user.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your goal tracking progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Active Goals</p>
                <p className="text-2xl font-bold">{stats.activeGoals.count}/{stats.activeGoals.limit}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Current Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak.days} days</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Social Engagement</p>
                <p className="text-2xl font-bold">{stats.socialEngagement.count}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Check-in Rate</p>
                <p className="text-2xl font-bold">{stats.checkInRate.percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 