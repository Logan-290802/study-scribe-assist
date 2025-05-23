
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Library from "./pages/Library";
import PreviewExport from "./pages/PreviewExport";
import Tools from "./pages/Tools";
import DocumentEditor from "./pages/DocumentEditor";
import { DocumentProvider } from "./store/DocumentStore";
import { AuthProvider } from "./store/AuthContext";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useState } from "react";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <DocumentProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Redirect root path to auth page */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile-setup" element={
                  <ProtectedRoute>
                    <ProfileSetup />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/library" element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                } />
                <Route path="/preview-export" element={
                  <ProtectedRoute>
                    <PreviewExport />
                  </ProtectedRoute>
                } />
                <Route path="/tools" element={
                  <ProtectedRoute>
                    <Tools />
                  </ProtectedRoute>
                } />
                <Route path="/documents/:id" element={
                  <ProtectedRoute>
                    <DocumentEditor />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DocumentProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
