
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isConfigError } = useAuth();
  const [localConfigError, setLocalConfigError] = React.useState(false);

  // Check for configuration error locally
  React.useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setLocalConfigError(true);
    }
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show configuration error message
  if (isConfigError || localConfigError) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
