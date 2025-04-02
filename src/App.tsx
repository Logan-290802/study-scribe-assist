
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/store/AuthContext';
import { DocumentProvider } from '@/store/DocumentStore';
import { KnowledgeBaseProvider } from '@/store/KnowledgeBaseStore';

import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Library from '@/pages/Library';
import DocumentEditor from '@/pages/DocumentEditor';
import ProfileSetup from '@/pages/ProfileSetup';
import Tools from '@/pages/Tools';
import NotFound from '@/pages/NotFound';
import PreviewExport from '@/pages/PreviewExport';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DocumentProvider>
          <KnowledgeBaseProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/preview/:format" element={<PreviewExport />} />
              
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
              
              <Route path="/document/:id" element={
                <ProtectedRoute>
                  <DocumentEditor />
                </ProtectedRoute>
              } />
              
              <Route path="/document/new" element={
                <ProtectedRoute>
                  <DocumentEditor />
                </ProtectedRoute>
              } />
              
              <Route path="/profile/setup" element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } />
              
              <Route path="/tools" element={
                <ProtectedRoute>
                  <Tools />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </KnowledgeBaseProvider>
        </DocumentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
