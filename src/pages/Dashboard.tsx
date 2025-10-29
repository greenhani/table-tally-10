import { useState, useEffect } from 'react';
import { Plus, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import { store } from '@/lib/store';
import { OrderSheet } from '@/components/orders/OrderSheet';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DateFilter = 'today' | 'yesterday' | '7days' | 'month' | 'custom';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
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

  const getDateRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case 'today':
        return { from: startOfDay(today), to: endOfDay(today) };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case '7days':
        return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
      case 'month':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'custom':
        return customDateRange;
      default:
        return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    }
  };

  const dateRange = getDateRange();

  // Filter sales based on date range
  const filteredSales = sales.filter((sale) =>
    isWithinInterval(new Date(sale.date), { start: dateRange.from, end: dateRange.to })
  );

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(-5).reverse();

  // Generate sales chart data based on selected filter
  const getDaysInRange = () => {
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(days, 31); // Cap at 31 days for readability
  };

  const chartData = Array.from({ length: getDaysInRange() }, (_, i) => {
    const date = new Date(dateRange.from);
    date.setDate(date.getDate() + i);
    const dateStr = format(date, 'MMM dd');
    const daySales = filteredSales.filter(
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
          <CardHeader className="space-y-4">
            <CardTitle>Sales Trend</CardTitle>
            
            {/* Date Filter Tabs */}
            <Tabs value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Custom Date Picker */}
            {dateFilter === 'custom' && (
              <div className="flex gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal flex-1",
                        !customDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from ? format(customDateRange.from, "PPP") : <span>From date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.from}
                      onSelect={(date) => date && setCustomDateRange({ ...customDateRange, from: startOfDay(date) })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal flex-1",
                        !customDateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.to ? format(customDateRange.to, "PPP") : <span>To date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.to}
                      onSelect={(date) => date && setCustomDateRange({ ...customDateRange, to: endOfDay(date) })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
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
