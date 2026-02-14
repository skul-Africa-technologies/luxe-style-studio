// User Dashboard Component - Displays Activities and Transactions
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  ShoppingCart, 
  RefreshCw, 
  LogOut, 
  Clock,
  CreditCard,
  Package,
  Eye,
} from 'lucide-react';
import type { ActivityType, Transaction } from '@/types/session';

// Activity type labels and colors
const activityLabels: Record<ActivityType, { label: string; color: string }> = {
  page_view: { label: 'Page View', color: 'bg-blue-100 text-blue-800' },
  product_view: { label: 'Product View', color: 'bg-purple-100 text-purple-800' },
  add_to_cart: { label: 'Added to Cart', color: 'bg-green-100 text-green-800' },
  remove_from_cart: { label: 'Removed from Cart', color: 'bg-red-100 text-red-800' },
  checkout_started: { label: 'Checkout Started', color: 'bg-yellow-100 text-yellow-800' },
  purchase_completed: { label: 'Purchase Completed', color: 'bg-emerald-100 text-emerald-800' },
  form_submitted: { label: 'Form Submitted', color: 'bg-indigo-100 text-indigo-800' },
  search_query: { label: 'Search', color: 'bg-orange-100 text-orange-800' },
  interaction: { label: 'Interaction', color: 'bg-gray-100 text-gray-800' },
};

// Transaction status badges
const getStatusBadge = (status: Transaction['status']) => {
  const styles: Record<Transaction['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
};

export function UserDashboard() {
  const { user, isLoading, logout, refreshUserData, saveActivity } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={100} className="animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUserData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    saveActivity('interaction', { action: 'logout' });
    logout();
  };

  const trackProductView = (productId: string, productName: string) => {
    saveActivity('product_view', { productId, productName });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* User Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Welcome back!</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {format(new Date(user.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Activity and Transactions Tabs */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">
            <Activity className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Your recent interactions and page views
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.activities && user.activities.length > 0 ? (
                <div className="space-y-4">
                  {user.activities.slice(0, 10).map((activity) => {
                    const label = activityLabels[activity.type];
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={label?.color || 'bg-gray-100'}>
                            {label?.label || activity.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => trackProductView(
                            String(activity.data.productId || ''),
                            String(activity.data.productName || '')
                          )}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No activities recorded yet</p>
                  <p className="text-sm">Start browsing to see your activities here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Your purchases and orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.transactions && user.transactions.length > 0 ? (
                <div className="space-y-4">
                  {user.transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">
                            Order #{transaction.id.slice(0, 8)}
                          </span>
                        </div>
                        <Badge className={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {transaction.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span className="text-muted-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between mt-3 pt-3 border-t">
                        <span className="font-medium">Total</span>
                        <span className="font-medium">
                          {transaction.currency === 'USD' ? '$' : transaction.currency}
                          {transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(transaction.createdAt), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your purchases will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserDashboard;
