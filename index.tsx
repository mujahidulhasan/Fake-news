import React, { ReactNode, Component, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLanding } from './pages/PublicLanding';
import { CardGenerator } from './pages/CardGenerator';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TemplateEditor } from './pages/admin/TemplateEditor';
import { ChannelManager } from './pages/admin/ChannelManager';
import { FontService } from './services/fontService';

// Simple Error Boundary to catch render crashes
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-600 text-center">
            <h1 className="text-xl font-bold mb-2">Something went wrong.</h1>
            <p>Please refresh the page.</p>
            <pre className="mt-4 bg-gray-100 p-4 rounded text-left text-xs overflow-auto max-w-2xl mx-auto">
                {this.state.error?.toString()}
            </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
};

const App = () => {
  // Load custom fonts on app boot
  useEffect(() => {
    FontService.loadSavedFonts();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen font-sans text-gray-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/create/:channelId" element={<CardGenerator />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
                <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/editor" element={
            <ProtectedRoute>
                <TemplateEditor />
            </ProtectedRoute>
          } />

          <Route path="/admin/channels" element={
            <ProtectedRoute>
                <ChannelManager />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </HashRouter>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}