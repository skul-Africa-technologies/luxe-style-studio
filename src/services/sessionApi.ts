// Session API Service for Backend Integration
import type {
  User,
  UserActivity,
  Transaction,
  ActivitySaveRequest,
  TransactionSaveRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types/session';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// User API Functions
export const userApi = {
  // Get all users
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return fetchApi<User[]>('/users');
  },

  // Get single user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return fetchApi<User>(`/users/${id}`);
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<ApiResponse<User | null>> {
    const response = await this.getAllUsers();
    if (response.success && response.data) {
      const user = response.data.find((u) => u.email === email);
      return { success: true, data: user || null };
    }
    return { success: false, error: response.error || 'User not found' };
  },

  // Create or update user (PATCH /users/{id})
  async createOrUpdateUser(id: string, email: string): Promise<ApiResponse<User>> {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });
  },

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Activity API Functions
export const activityApi = {
  // Get user activities
  async getUserActivities(userId: string): Promise<ApiResponse<UserActivity[]>> {
    return fetchApi<UserActivity[]>(`/users/${userId}/activities`);
  },

  // Save activity asynchronously
  async saveActivity(request: ActivitySaveRequest): Promise<ApiResponse<UserActivity>> {
    return fetchApi<UserActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Save multiple activities in batch
  async saveActivitiesBatch(
    requests: ActivitySaveRequest[]
  ): Promise<ApiResponse<UserActivity[]>> {
    return fetchApi<UserActivity[]>('/activities/batch', {
      method: 'POST',
      body: JSON.stringify(requests),
    });
  },
};

// Transaction API Functions
export const transactionApi = {
  // Get user transactions
  async getUserTransactions(
    userId: string,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<Transaction[]>> {
    return fetchApi<Transaction[]>(`/users/${userId}/transactions?page=${page}&pageSize=${pageSize}`);
  },

  // Create transaction asynchronously
  async createTransaction(
    request: TransactionSaveRequest
  ): Promise<ApiResponse<Transaction>> {
    return fetchApi<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update transaction status
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

// Initialize user session
export async function initializeUserSession(
  email: string
): Promise<ApiResponse<{ user: User; isNewUser: boolean }>> {
  // First, try to find existing user
  const existingUser = await userApi.getUserByEmail(email);
  
  if (existingUser.success && existingUser.data) {
    return { success: true, data: { user: existingUser.data, isNewUser: false } };
  }
  
  // Create new user with email (using a generated ID)
  const newUserId = crypto.randomUUID();
  const createResponse = await userApi.createOrUpdateUser(newUserId, email);
  
  if (createResponse.success && createResponse.data) {
    return { success: true, data: { user: createResponse.data, isNewUser: true } };
  }
  
  return { success: false, error: createResponse.error || 'Failed to create user' };
}

// Async activity queue for offline/batch processing
class ActivityQueue {
  private queue: ActivitySaveRequest[] = [];
  private isProcessing = false;
  private flushInterval: number | null = null;

  constructor() {
    // Flush queue every 30 seconds
    this.flushInterval = window.setInterval(() => this.flush(), 30000);
  }

  add(request: ActivitySaveRequest): void {
    this.queue.push(request);
    
    // Flush immediately if queue reaches 10 items
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
      // Re-add failed items to the front of the queue
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    // Final flush before destroy
    this.flush();
  }
}

// Singleton activity queue instance
export const activityQueue = new ActivityQueue();

// Utility to debounce function calls
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
