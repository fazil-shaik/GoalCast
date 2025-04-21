import { ReactNode, useContext } from "react";
import { Sidebar } from "@/components/sidebar";
import { AuthContext } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, isLoading } = useContext(AuthContext);
  const [_, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    setLocation("/sign-in");
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen md:flex-row">
        <div className="bg-white border-r border-gray-200 md:w-64 w-full md:h-screen md:fixed sticky top-0 z-10">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <i className="ri-flag-line text-white"></i>
              </div>
              <span className="text-xl font-bold">GoalCast</span>
            </div>
          </div>
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <main className="flex-1 md:ml-64 p-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg mb-8" />
          <Skeleton className="h-64 rounded-lg" />
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  );
}
