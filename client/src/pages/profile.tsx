import { useContext } from "react";
import { AuthContext } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  
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
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Profile
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="inline-flex items-center"
          >
            <i className="ri-logout-box-line mr-2"></i>
            Logout
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img 
                className="h-16 w-16 rounded-full" 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                alt={user.fullName} 
              />
              <div>
                <h3 className="text-lg font-medium">{user.fullName}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Overview of your goal tracking progress</CardDescription>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-500">Active Goals</h4>
                  <p className="mt-1 text-2xl font-semibold">
                    {stats.activeGoals.count}
                    <span className="text-sm text-gray-500">/{stats.activeGoals.limit}</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-500">Current Streak</h4>
                  <p className="mt-1 text-2xl font-semibold">
                    {stats.currentStreak.days}
                    <span className="text-sm text-gray-500"> days</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-500">Social Engagement</h4>
                  <p className="mt-1 text-2xl font-semibold">
                    {stats.socialEngagement.count}
                    <span className="text-sm text-gray-500">
                      ({stats.socialEngagement.percentChange > 0 ? '+' : ''}{stats.socialEngagement.percentChange}%)
                    </span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-500">Check-in Rate</h4>
                  <p className="mt-1 text-2xl font-semibold">
                    {stats.checkInRate.percentage}%
                    <span className={`text-sm ${stats.checkInRate.status === "On track" ? "text-success-600" : "text-warning-500"}`}>
                      ({stats.checkInRate.status})
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 