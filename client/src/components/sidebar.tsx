import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useContext(AuthContext);
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: 'ri-dashboard-line' 
    },
    { 
      name: 'My Goals', 
      path: '/goals', 
      icon: 'ri-target-line' 
    },
    { 
      name: 'Feed', 
      path: '/feed', 
      icon: 'ri-group-line' 
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: 'ri-bar-chart-line' 
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: 'ri-user-line' 
    },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="bg-white border-r border-gray-200 md:w-64 w-full md:h-screen md:fixed sticky top-0 z-10">
      <div className="flex flex-col h-full">
        {/* Logo and Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <i className="ri-flag-line text-white"></i>
              </div>
              <span className="text-xl font-bold">GoalCast</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={toggleMobileMenu}
            >
              <i className={`ri-${isMobileMenuOpen ? 'close' : 'menu'}-line text-2xl`}></i>
            </Button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={cn(
          "flex-1 px-2 py-4 space-y-1",
          isMobileMenuOpen ? "block" : "hidden md:block"
        )}>
          {navItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <a className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive(item.path)
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <i className={`${item.icon} text-lg mr-3 ${
                  isActive(item.path)
                    ? "text-primary-600"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}></i>
                {item.name}
              </a>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        {auth?.user && (
          <div className="p-4 border-t border-gray-200">
            <Link href="/profile">
              <a className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-medium">
                    {auth.user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {auth.user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    View profile
                  </p>
                </div>
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
