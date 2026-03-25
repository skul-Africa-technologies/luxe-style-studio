// Session API Service for Backend Integration
import type {
  User,
  UserActivity,
  Transaction,
  ActivitySaveRequest,
  TransactionSaveRequest,
  ApiResponse,
} from '@/types/session';

// ====================
// API Configuration
// ====================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not defined. Please set it in your .env file.'
  );
}

// ====================
// Helpers
// ====================

// Prevent double slashes in URLs
function buildUrl(endpoint: string): string {
  return `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}

// Simple in-memory cache
const cache = new Map<string, unknown>();

// ====================
// Generic Fetch Wrapper
// ====================
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildUrl(endpoint);

  const isGet = !options.method || options.method === 'GET';

  // ✅ Return cached data instantly
  if (isGet && cache.has(url)) {
    return { success: true, data: cache.get(url) as T };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    // ✅ Cache GET responses
    if (isGet) {
      cache.set(url, data);
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// ====================
// User API
// ====================
export const userApi = {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return fetchApi<User[]>('/users');
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return fetchApi<User>(`/users/${id}`);
  },

  async getUserByEmail(email: string): Promise<ApiResponse<User | null>> {
    const response = await this.getAllUsers();
    if (response.success && response.data) {
      const user = response.data.find((u) => u.email === email);
      return { success: true, data: user || null };
    }
    return { success: false, error: response.error || 'User not found' };
  },

  async createOrUpdateUser(
    id: string,
    email: string
  ): Promise<ApiResponse<User>> {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ====================
// Activity API
// ====================
export const activityApi = {
  async getUserActivities(
    userId: string
  ): Promise<ApiResponse<UserActivity[]>> {
    return fetchApi<UserActivity[]>(`/users/${userId}/activities`);
  },

  async saveActivity(
    request: ActivitySaveRequest
  ): Promise<ApiResponse<UserActivity>> {
    return fetchApi<UserActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async saveActivitiesBatch(
    requests: ActivitySaveRequest[]
  ): Promise<ApiResponse<UserActivity[]>> {
    return fetchApi<UserActivity[]>('/activities/batch', {
      method: 'POST',
      body: JSON.stringify(requests),
    });
  },
};

// ====================
// Transaction API
// ====================
export const transactionApi = {
  async getUserTransactions(
    userId: string,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<Transaction[]>> {
    return fetchApi<Transaction[]>(
      `/users/${userId}/transactions?page=${page}&pageSize=${pageSize}`
    );
  },

  async createTransaction(
    request: TransactionSaveRequest
  ): Promise<ApiResponse<Transaction>> {
    return fetchApi<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateTransactionStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Transaction>> {
    return fetchApi<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ====================
// Session Initialization
// ====================
export async function initializeUserSession(
  email: string
): Promise<ApiResponse<{ user: User; isNewUser: boolean }>> {
  const existingUser = await userApi.getUserByEmail(email);

  if (existingUser.success && existingUser.data) {
    return {
      success: true,
      data: { user: existingUser.data, isNewUser: false },
    };
  }

  const newUserId = crypto.randomUUID();
  const createResponse = await userApi.createOrUpdateUser(
    newUserId,
    email
  );

  if (createResponse.success && createResponse.data) {
    return {
      success: true,
      data: { user: createResponse.data, isNewUser: true },
    };
  }

  return {
    success: false,
    error: createResponse.error || 'Failed to create user',
  };
}

// ====================
// Activity Queue
// ====================
class ActivityQueue {
  private queue: ActivitySaveRequest[] = [];
  private isProcessing = false;
  private flushInterval: number | null = null;

  constructor() {
    this.flushInterval = window.setInterval(() => this.flush(), 30000);
  }

  add(request: ActivitySaveRequest): void {
    this.queue.push(request);

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, 10);

    try {
      await activityApi.saveActivitiesBatch(batch);
    } catch (error) {
      console.error('Failed to flush activity queue:', error);
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const activityQueue = new ActivityQueue();

// ====================
// Debounce Utility
// ====================
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func(...args), wait);
  };
}