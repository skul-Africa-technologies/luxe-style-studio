// Session Wrapper Component - Main entry point for session management
import React from 'react';
import { useSession } from '@/context/SessionContext';
import { EmailForm } from './EmailForm';
import { UserDashboard } from './UserDashboard';
import { SessionLoader } from './SessionLoader';
import { SessionSkeleton } from './SessionLoader';
import { Card } from '@/components/ui/card';
import { Toaster } from 'sonner';

interface SessionWrapperProps {
  children?: React.ReactNode;
  showDashboard?: boolean;
  customLogin?: React.ReactNode;
  customDashboard?: React.ReactNode;
}

export function SessionWrapper({
  children,
  showDashboard = true,
  customLogin,
  customDashboard,
}: SessionWrapperProps) {
  const { isAuthenticated, isLoading, error } = useSession();

  // Show loading state
  if (isLoading) {
    return (
      <SessionLoader fullScreen>
        <div className="min-h-screen flex items-center justify-center p-4">
          <SessionSkeleton className="w-full max-w-md" />
        </div>
      </SessionLoader>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Session Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }

  // Show email form for unauthenticated users
  if (!isAuthenticated) {
    return (
      <SessionLoader>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
          {customLogin || (
            <div className="w-full">
              <EmailForm />
            </div>
          )}
        </div>
        <Toaster position="top-center" />
      </SessionLoader>
    );
  }

  // Show dashboard and/or children for authenticated users
  return (
    <SessionLoader>
      {showDashboard ? (
        <div className="min-h-screen p-4 md:p-8">
          {customDashboard || <UserDashboard />}
          {children}
        </div>
      ) : (
        children
      )}
      <Toaster position="top-right" />
    </SessionLoader>
  );
}

// Hook for using session in components
export { useSession } from '@/context/SessionContext';

// Export individual components
export { EmailForm } from './EmailForm';
export { UserDashboard } from './UserDashboard';
export { SessionLoader, InlineLoader, SessionSkeleton } from './SessionLoader';

export default SessionWrapper;
