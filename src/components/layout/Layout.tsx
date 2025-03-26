
import React from 'react';
import { Beaker, Book, BookOpen, File, FileText, Home, LogOut, Settings, User, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <header className="border-b shadow-sm bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-lg">StudyScribe</span>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              <NavLink href="/" isActive={location.pathname === '/'}>
                <File className="h-4 w-4" />
                <span>Document</span>
              </NavLink>
              
              <NavLink href="/library" isActive={location.pathname === '/library'}>
                <Library className="h-4 w-4" />
                <span>Library</span>
              </NavLink>
              
              <NavLink href="#">
                <Beaker className="h-4 w-4" />
                <span>Tools</span>
              </NavLink>
            </nav>
            
            <div className="flex items-center gap-3">
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
      
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="border-t py-4 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  );
};

interface NavLinkProps {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, isActive, children }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    )}
  >
    {children}
  </Link>
);

export default Layout;
