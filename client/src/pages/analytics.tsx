import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { DashboardStats, GoalWithProgress } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Goal, CheckIn } from "@shared/schema";
import { calculateGoalProgress } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export default function Analytics() {
  // Fetch stats data
  const statsQuery = useQuery({
    queryKey: ['/api/stats'],
  });
  
  // Fetch goals and check-ins data
  const goalsQuery = useQuery({
    queryKey: ['/api/goals'],
  });
  
  const checkInsQuery = useQuery({
    queryKey: ['/api/checkins'],
  });
  
  const stats = statsQuery.data as DashboardStats || {
    activeGoals: { count: 0, limit: 2 },
    currentStreak: { days: 0, isLongest: false },
    socialEngagement: { count: 0, percentChange: 0 },
    checkInRate: { percentage: 0, status: "On track" as const }
  };
  
  // Process goals and check-ins data
  const goals = goalsQuery.data as Goal[] || [];
  const checkIns = checkInsQuery.data as CheckIn[] || [];
  
  // Create goal with progress objects
  const goalsWithProgress: GoalWithProgress[] = goals.map((goal) => {
    const goalCheckIns = checkIns.filter((checkIn) => checkIn.goalId === goal.id);
    return calculateGoalProgress(goal, goalCheckIns);
  });
  
  // Filter active goals
  const activeGoals = goalsWithProgress.filter((goal) => goal.originalStatus === "active");
  
  // Generate completion data by day of week
  const completionDataByDay = generateCompletionDataByDay(checkIns);
  
  // Generate engagement data
  const engagementData = generateEngagementData(checkIns);
  
  // Generate goal progress data
  const goalProgressData = activeGoals.map(goal => ({
    name: goal.title,
    progress: goal.progress
  }));
  
  const isLoading = statsQuery.isLoading || goalsQuery.isLoading || checkInsQuery.isLoading;
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Analytics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Insights about your goal progress and social accountability
        </p>
      </div>
      
      {/* Overview Stats */}
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
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="performance">Goal Performance</TabsTrigger>
          <TabsTrigger value="engagement">Social Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Completion Rate by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Completion Rate</CardTitle>
                <CardDescription>Your check-in completion by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {completionDataByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionDataByDay}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completed" fill="hsl(var(--chart-1))">
                          {completionDataByDay.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.completed ? "hsl(var(--chart-1))" : "hsl(var(--chart-4))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No check-in data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>Current progress of your active goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {goalProgressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={goalProgressData}
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                        <Bar dataKey="progress" fill="hsl(var(--chart-2))" barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No active goals to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 gap-6">
            {/* Social Engagement Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Social Engagement Trend</CardTitle>
                <CardDescription>Likes, claps, and comments over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {engagementData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={engagementData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="hsl(var(--chart-3))" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No engagement data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Premium Feature Card */}
            <Card className="bg-primary-50 border-primary-100">
              <CardHeader>
                <CardTitle className="text-primary-800">Unlock Advanced Analytics</CardTitle>
                <CardDescription className="text-primary-700">
                  Upgrade to Premium to access deeper insights and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <i className="ri-check-line text-success-500 mr-2"></i>
                        <span>Goal correlation analysis</span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-check-line text-success-500 mr-2"></i>
                        <span>Social engagement optimization</span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-check-line text-success-500 mr-2"></i>
                        <span>Custom reporting and exports</span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-check-line text-success-500 mr-2"></i>
                        <span>Behavioral patterns insights</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex justify-center items-center sm:justify-end w-full sm:w-auto mt-4 sm:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to generate completion data by day of week
function generateCompletionDataByDay(checkIns: CheckIn[]) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = daysOfWeek.map(day => ({ name: day, completed: 0 }));
  
  if (checkIns.length === 0) {
    return result;
  }
  
  // Count completed check-ins by day of week
  checkIns.forEach(checkIn => {
    if (checkIn.isCompleted) {
      const date = new Date(checkIn.date);
      const dayIndex = date.getDay();
      result[dayIndex].completed++;
    }
  });
  
  return result;
}

// Helper function to generate engagement data
function generateEngagementData(checkIns: CheckIn[]) {
  if (checkIns.length === 0) {
    return [];
  }
  
  // Group check-ins by date
  const checkInsByDate = checkIns.reduce((acc, checkIn) => {
    const date = new Date(checkIn.date);
    const dateStr = formatDate(date);
    
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    
    // Simulate engagement (in a real app, this would come from likes, claps, etc.)
    acc[dateStr] += checkIn.isCompleted ? 5 : 0;
    
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array format for chart
  return Object.entries(checkInsByDate)
    .map(([date, engagement]) => ({ date, engagement }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Show last 7 days
}
