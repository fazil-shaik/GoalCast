import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AppShell from "./layouts/app-shell";
import Dashboard from "./pages/dashboard";
import MyGoals from "./pages/my-goals";
import Feed from "./pages/feed";
import Analytics from "./pages/analytics";
import Profile from "./pages/profile";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Landing from "./pages/landing";
import NotFound from "@/pages/not-found";
import { WebSocketProvider, useWebSocket } from "./lib/websocket";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { User } from "@shared/schema";

function AppContent() {
  const { user, setUser, isLoading } = useAuth();
  const { connect, disconnect } = useWebSocket();

  useEffect(() => {
    if (user) {
      // Connect to WebSocket when user logs in
      connect(user.id);
    }

    // Cleanup WebSocket connection on unmount
    return () => {
      disconnect();
    };
  }, [user]);

  return (
    <Switch>
      {/* Public landing page */}
      <Route path="/landing" component={Landing} />
      
      {/* Auth routes */}
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected routes - redirect to landing if not logged in */}
      <Route path="/">
        {() => (
          user ? (
            <AppShell>
              <Dashboard />
            </AppShell>
          ) : (
            isLoading ? <div>Loading...</div> : <Landing />
          )
        )}
      </Route>
      <Route path="/goals">
        {() => (
          user ? (
            <AppShell>
              <MyGoals />
            </AppShell>
          ) : (
            isLoading ? <div>Loading...</div> : <Landing />
          )
        )}
      </Route>
      <Route path="/feed">
        {() => (
          user ? (
            <AppShell>
              <Feed />
            </AppShell>
          ) : (
            isLoading ? <div>Loading...</div> : <Landing />
          )
        )}
      </Route>
      <Route path="/analytics">
        {() => (
          user ? (
            <AppShell>
              <Analytics />
            </AppShell>
          ) : (
            isLoading ? <div>Loading...</div> : <Landing />
          )
        )}
      </Route>
      <Route path="/profile">
        {() => (
          user ? (
            <AppShell>
              <Profile />
            </AppShell>
          ) : (
            isLoading ? <div>Loading...</div> : <Landing />
          )
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
