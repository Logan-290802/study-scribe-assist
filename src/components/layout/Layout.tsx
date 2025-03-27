
import React, { useState } from 'react';
import { BookOpen, Library, Wrench, User, Settings, Home, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <SidebarProvider defaultOpen={false} open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen flex flex-col animate-fade-in w-full">
        <header className="border-b shadow-sm bg-white/70 backdrop-blur-md sticky top-0 z-10 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setSidebarOpen(true)}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-lg">StudyScribe</span>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <SidebarTrigger />
                
                <div className="flex items-center border rounded-full px-3 py-1.5 bg-white">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm hidden sm:inline">Student</span>
                </div>
                
                <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors md:ml-2">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex flex-1 relative w-full">
          <Sidebar variant="floating">
            <SidebarRail />
            <SidebarHeader>
              <div className="flex items-center justify-between px-2 py-1.5">
                <div 
                  className="ml-auto cursor-pointer p-1 rounded hover:bg-gray-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Main</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'} tooltip="Dashboard">
                        <Link to="/dashboard">
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/library'} tooltip="Library">
                        <Link to="/library">
                          <Library className="h-4 w-4" />
                          <span>Library</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/tools'} tooltip="Tools">
                        <Link to="/tools">
                          <Wrench className="h-4 w-4" />
                          <span>Tools</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          
          <main className="flex-grow py-6 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        
        <footer className="border-t py-4 bg-white/70 backdrop-blur-md w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} StudyScribe
              </div>
              <div className="text-sm text-gray-500">
                AI Transparency • Privacy • Terms
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
