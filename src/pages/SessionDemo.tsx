// Activity Tracking Demo Page - Demonstrates async activity saving
import React, { useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Search, 
  MousePointer,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  onView: (id: string, name: string) => void;
  onAddToCart: (id: string, name: string, price: number) => void;
}

function ProductCard({ id, name, price, onView, onAddToCart }: ProductCardProps) {
  const { saveActivity } = useSession();

  const handleView = () => {
    onView(id, name);
  };

  const handleAddToCart = () => {
    onAddToCart(id, name, price);
    saveActivity('add_to_cart', { productId: id, productName: name, price });
    toast.success(`${name} added to cart`);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">Product Image</span>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-lg font-bold mt-1">${price.toFixed(2)}</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionDemoPage() {
  const { user, saveActivity } = useSession();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Track page view on mount
  useEffect(() => {
    saveActivity('page_view', { 
      path: '/demo', 
      title: 'Activity Demo Page',
    });
  }, []);

  // Sample products
  const products = [
    { id: 'prod-1', name: 'Designer Jacket', price: 299 },
    { id: 'prod-2', name: 'Leather Handbag', price: 459 },
    { id: 'prod-3', name: 'Silk Scarf', price: 89 },
    { id: 'prod-4', name: 'Classic Watch', price: 599 },
  ];

  const handleProductView = (id: string, name: string) => {
    saveActivity('product_view', { productId: id, productName: name });
    toast.info(`Viewing ${name}`);
  };

  const handleAddToCart = (id: string, name: string, price: number) => {
    saveActivity('add_to_cart', { productId: id, productName: name, price });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveActivity('search_query', { query: searchQuery });
      toast.success(`Searching for "${searchQuery}"`);
      setSearchQuery('');
    }
  };

  const handleInteraction = (type: string) => {
    saveActivity('interaction', { type });
    toast.info(`${type} interaction tracked`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Activity Tracking Demo</h1>
        <p className="text-muted-foreground">
          Logged in as: <Badge variant="secondary">{user.email}</Badge>
        </p>
        <p className="text-sm text-muted-foreground">
          All your interactions are being tracked and saved asynchronously.
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Demo
          </CardTitle>
          <CardDescription>
            Try searching to see the activity being tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Product Interactions
          </CardTitle>
          <CardDescription>
            Click on products to view and add to cart - activities are tracked automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onView={handleProductView}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MousePointer className="w-5 h-5 mr-2" />
            Other Interactions
          </CardTitle>
          <CardDescription>
            Various interaction types that can be tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleInteraction('wishlist_click')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Add to Wishlist
            </Button>
            <Button
              variant="outline"
              onClick={() => handleInteraction('share_click')}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Product
            </Button>
            <Button
              variant="outline"
              onClick={() => handleInteraction('filter_click')}
            >
              Filter Products
            </Button>
            <Button
              variant="outline"
              onClick={() => handleInteraction('sort_click')}
            >
              Sort Products
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">How Activity Tracking Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Activities are saved asynchronously in the background</li>
            <li>• A queue batches multiple activities together</li>
            <li>• Activities are flushed every 30 seconds or when queue reaches 10 items</li>
            <li>• You can continue using the site while activities are being saved</li>
            <li>• Toast notifications confirm successful tracking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionDemoPage;
