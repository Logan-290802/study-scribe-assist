
import React, { useState } from 'react';
import { BookOpen, Library, Wrench, User, Settings, Home, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out.",
        variant: "destructive"
      });
    }
  };
  
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center border rounded-full px-3 py-1.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm hidden sm:inline">Student</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Accessibility Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex flex-1 relative w-full">
          <Sidebar variant="floating">
            <SidebarRail className="after:!bg-transparent" />
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
