// Session Context and Provider with Cookie Management
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { toast } from 'sonner';
import type { User, UserActivity, ActivityType, SessionState } from '@/types/session';
import {
  initializeUserSession,
  activityApi,
  transactionApi,
  activityQueue,
  debounce,
} from '@/services/sessionApi';

// Cookie configuration
const SESSION_COOKIE_NAME = 'luxe_session_email';
const SESSION_COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  sameSite: 'lax' as const,
  secure: import.meta.env.PROD,
};

// Context interface
interface SessionContextValue extends SessionState {
  submitEmail: (email: string) => Promise<boolean>;
  logout: () => void;
  saveActivity: (type: ActivityType, data: Record<string, unknown>) => void;
  saveTransaction: (amount: number, currency: string, items: TransactionItem[]) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

interface TransactionItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

// Create context with default values
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Custom hook to use session context
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Session Provider Component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [cookies, setCookie, removeCookie] = useCookies([SESSION_COOKIE_NAME]);
  const [state, setState] = useState<SessionState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    email: null,
    error: null,
  });

  // Track if we've tried to restore session to prevent duplicate calls
  const sessionRestored = useRef(false);

  // Restore session from cookie on mount
  useEffect(() => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;

    const savedEmail = cookies[SESSION_COOKIE_NAME];
    
    if (savedEmail) {
      restoreSession(savedEmail);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }

    // Cleanup activity queue on unmount
    return () => {
      activityQueue.destroy();
    };
  }, [cookies]);

  // Restore session from saved email
  const restoreSession = async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, email }));

    const response = await initializeUserSession(email);
    
    if (response.success && response.data) {
      setState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
        email,
        error: null,
      });

      // Fetch user activities and transactions in background
      fetchUserDataAsync(response.data.user.id);
    } else {
      // Cookie is invalid, remove it
      removeCookie(SESSION_COOKIE_NAME, { path: '/' });
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        email: null,
        error: null,
      });
    }
  };

  // Fetch user data asynchronously
  const fetchUserDataAsync = async (userId: string) => {
    try {
      const [activitiesResponse, transactionsResponse] = await Promise.all([
        activityApi.getUserActivities(userId),
        transactionApi.getUserTransactions(userId),
      ]);

      if (activitiesResponse.success && activitiesResponse.data) {
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, activities: activitiesResponse.data } : null,
        }));
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, transactions: transactionsResponse.data } : null,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Submit email for new session
  const submitEmail = async (email: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      setState((prev) => ({ ...prev, isLoading: false, error: 'Invalid email format' }));
      return false;
    }

    // Save email to cookie
    setCookie(SESSION_COOKIE_NAME, email, SESSION_COOKIE_OPTIONS);

    const response = await initializeUserSession(email);
    
    if (response.success && response.data) {
      setState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
        email,
        error: null,
      });

      toast.success(
        response.data.isNewUser 
          ? 'Welcome! Your account has been created.' 
          : 'Welcome back! Session restored.'
      );

      // Track initial activity
      saveActivity('page_view', { path: '/', action: 'session_start' });
      
      return true;
    } else {
      toast.error(response.error || 'Failed to create session');
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: response.error || 'Session creation failed' 
      }));
      return false;
    }
  };

  // Logout and clear session
  const logout = useCallback(() => {
    removeCookie(SESSION_COOKIE_NAME, { path: '/' });
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      email: null,
      error: null,
    });
    toast.info('You have been logged out');
  }, [removeCookie]);

  // Save activity (async, non-blocking)
  const saveActivity = useCallback(
    debounce((type: ActivityType, data: Record<string, unknown>) => {
      if (!state.user) return;

      const activityRequest = {
        userId: state.user.id,
        type,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      };

      // Add to queue for batch processing
      activityQueue.add(activityRequest);
    }, 1000),
    [state.user]
  );

  // Save transaction (async, with loading feedback)
  const saveTransaction = async (
    amount: number,
    currency: string,
    items: TransactionItem[]
  ): Promise<boolean> => {
    if (!state.user) {
      toast.error('No active session');
      return false;
    }

    const toastId = toast.loading('Saving transaction...');

    try {
      const response = await transactionApi.createTransaction({
        userId: state.user.id,
        amount,
        currency,
        items,
      });

      if (response.success && response.data) {
        toast.dismiss(toastId);
        toast.success('Transaction saved successfully');
        
        // Update local state
        setState((prev) => ({
          ...prev,
          user: prev.user 
            ? { 
                ...prev.user, 
                transactions: [...(prev.user.transactions || []), response.data!] 
              } 
            : null,
        }));

        // Track purchase activity
        saveActivity('purchase_completed', {
          transactionId: response.data.id,
          amount,
          currency,
          itemCount: items.length,
        });

        return true;
      } else {
        toast.dismiss(toastId);
        toast.error(response.error || 'Failed to save transaction');
        return false;
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Network error while saving transaction');
      return false;
    }
  };

  // Refresh user data manually
  const refreshUserData = async () => {
    if (!state.user) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    
    await fetchUserDataAsync(state.user.id);
    
    setState((prev) => ({ ...prev, isLoading: false }));
    toast.success('Data refreshed');
  };

  const contextValue: SessionContextValue = {
    ...state,
    submitEmail,
    logout,
    saveActivity,
    saveTransaction,
    refreshUserData,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export default SessionContext;
