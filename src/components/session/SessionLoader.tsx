// Session Loader Component - Thin progress bar for async operations
import React from 'react';
import { useSession } from '@/context/SessionContext';
import { Progress } from '@/components/ui/progress';

interface SessionLoaderProps {
  children: React.ReactNode;
  fullScreen?: boolean;
}

export function SessionLoader({ children, fullScreen = false }: SessionLoaderProps) {
  const { isLoading } = useSession();

  if (fullScreen && isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-muted rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Thin progress bar at top when loading */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={100} className="h-0.5 animate-pulse" />
        </div>
      )}
      {children}
    </>
  );
}

// Inline spinner for buttons and small areas
interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoader({ size = 'md', className = '' }: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Skeleton loader for content placeholders
interface SessionSkeletonProps {
  className?: string;
}

export function SessionSkeleton({ className = '' }: SessionSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-4 bg-muted rounded w-1/4" />
      <div className="h-8 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-20 bg-muted rounded" />
        <div className="h-20 bg-muted rounded" />
      </div>
    </div>
  );
}

export default SessionLoader;
