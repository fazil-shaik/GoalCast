import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  if (!user && location !== "/landing") {
    window.location.href = "/landing";
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
