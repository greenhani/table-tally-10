import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import { store } from '@/lib/store';
import { OrderSheet } from '@/components/orders/OrderSheet';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sales = store.getSales();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setOrders(store.getOrders());
  };

  const handleSheetClose = (refresh?: boolean) => {
    setIsSheetOpen(false);
    if (refresh) {
      loadOrders();
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(-5).reverse();

  // Generate sales chart data (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, 'MMM dd');
    const daySales = sales.filter(
      (s) => format(new Date(s.date), 'MMM dd') === dateStr
    );
    const revenue = daySales.reduce((sum, s) => sum + s.amount, 0);
    return { date: dateStr, revenue };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to SetRestGo</p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">PKR {totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">From {sales.length} sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting preparation</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Graph and Recent Orders - Side by Side on Large Screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {order.orderType === 'table'
                          ? `Table ${order.tableNumber}`
                          : order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">PKR {order.total.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OrderSheet open={isSheetOpen} onClose={handleSheetClose} />
    </div>
  );
}
