# Session Management System

A complete persistent user session system for React + TypeScript applications without traditional login/logout.

## Features

- **Persistent Sessions**: Users provide email once, session persists via cookies for 30 days
- **Async Activity Tracking**: All user activities are tracked and saved asynchronously
- **Backend Integration**: Ready-to-use API service for your NestJS backend
- **UI Feedback**: Loading states, progress bars, and toast notifications
- **Error Handling**: Network errors and API failures are gracefully handled
- **Security**: No passwords stored, only email in cookies

## Installation

```bash
npm install react-cookie
```

## Quick Start

### 1. Wrap Your App with SessionProvider

```tsx
// src/App.tsx
import { SessionProvider } from '@/context/SessionContext';

function App() {
  return (
    <SessionProvider>
      {/* Your app content */}
    </SessionProvider>
  );
}
```

### 2. Use Session Components

```tsx
// Simple usage - shows login form or dashboard
import { SessionWrapper } from '@/components/session';

function MyPage() {
  return (
    <SessionWrapper>
      <YourMainContent />
    </SessionWrapper>
  );
}
```

### 3. Track Activities

```tsx
import { useSession } from '@/context/SessionContext';

function ProductPage({ product }) {
  const { saveActivity, user } = useSession();

  const handleAddToCart = () => {
    // Activity is saved asynchronously
    saveActivity('add_to_cart', { 
      productId: product.id, 
      productName: product.name,
      price: product.price 
    });
  };

  return (
    <button onClick={handleAddToCart}>Add to Cart</button>
  );
}
```

### 4. Save Transactions

```tsx
import { useSession } from '@/context/SessionContext';

function Checkout({ cartItems }) {
  const { saveTransaction, user } = useSession();

  const handlePurchase = async () => {
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    const success = await saveTransaction(total, 'USD', cartItems.map(item => ({
      id: item.id,
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })));

    if (success) {
      // Purchase saved successfully
    }
  };

  return <button onClick={handlePurchase}>Complete Purchase</button>;
}
```

## Component Reference

### SessionWrapper
Main wrapper component that handles authentication state.

```tsx
<SessionWrapper
  showDashboard={true}          // Show user dashboard
  customLogin={<Login />}       // Custom login component
  customDashboard={<Dashboard />} // Custom dashboard
>
  <YourContent />
</SessionWrapper>
```

### EmailForm
Standalone email submission form.

```tsx
import { EmailForm } from '@/components/session';

<EmailForm />
```

### UserDashboard
Displays user activities and transactions.

```tsx
import { UserDashboard } from '@/components/session';

<UserDashboard />
```

### useSession Hook
Access session state and methods anywhere in your app.

```tsx
import { useSession } from '@/context/SessionContext';

function MyComponent() {
  const { 
    user,           // Current user or null
    isLoading,      // Loading state
    isAuthenticated, // Boolean session status
    email,          // User email
    error,          // Error message
    submitEmail,    // (email) => Promise<boolean>
    logout,         // () => void
    saveActivity,   // (type, data) => void
    saveTransaction, // (amount, currency, items) => Promise<boolean>
    refreshUserData // () => Promise<void>
  } = useSession();
}
```

## API Configuration

Set your backend URL in environment variables:

```env
VITE_API_URL=http://localhost:3001/api
```

## Backend Endpoints

The system expects these endpoints on your backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get single user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/users/:id/activities` | Get user activities |
| POST | `/activities` | Save single activity |
| POST | `/activities/batch` | Save multiple activities |
| GET | `/users/:id/transactions` | Get user transactions |
| POST | `/transactions` | Create transaction |

## Cookie Configuration

Sessions are stored in cookies with:
- **Name**: `luxe_session_email`
- **Duration**: 30 days
- **Security**: Secure in production
- **SameSite**: Lax

## Activity Types

Available activity types for tracking:

- `page_view` - Page visits
- `product_view` - Product page views
- `add_to_cart` - Items added to cart
- `remove_from_cart` - Items removed from cart
- `checkout_started` - Checkout initiated
- `purchase_completed` - Purchase finished
- `form_submitted` - Form submissions
- `search_query` - Search queries
- `interaction` - General interactions

## Error Handling

The system handles:
- Network errors (offline mode)
- API failures (backend errors)
- Invalid sessions (expired cookies)
- Validation errors (invalid email)

All errors show toast notifications and can be accessed via `error` state.

## License

MIT
