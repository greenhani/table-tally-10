import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale, SalesStats } from '@/types';
import { store } from '@/lib/store';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    popularItems: [],
  });
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    loadSales();
  }, [dateRange]);

  const loadSales = () => {
    let allSales = store.getSales();

    // Filter by date range if selected
    if (dateRange.from || dateRange.to) {
      allSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(saleDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else if (dateRange.from) {
          return saleDate >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          return saleDate <= endOfDay(dateRange.to);
        }
        return true;
      });
    }

    setSales(allSales);

    // Calculate stats
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalOrders = allSales.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate popular items
    const itemCounts = new Map<string, { item: any; quantity: number }>();
    
    allSales.forEach((sale) => {
      sale.items.forEach((orderItem) => {
        const existing = itemCounts.get(orderItem.menuItem.id);
        if (existing) {
          existing.quantity += orderItem.quantity;
        } else {
          itemCounts.set(orderItem.menuItem.id, {
            item: orderItem.menuItem,
            quantity: orderItem.quantity,
          });
        }
      });
    });

    const popularItems = Array.from(itemCounts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setStats({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      popularItems,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sales Analytics</h1>
          <p className="text-muted-foreground">Track your revenue and performance</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                'Pick a date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange(range || {})}
              numberOfMonths={2}
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${stats.averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.popularItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {stats.popularItems.map((popularItem, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{popularItem.item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {popularItem.item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{popularItem.quantity}</p>
                      <p className="text-xs text-muted-foreground">sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sales in selected period</p>
            ) : (
              <div className="space-y-3">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{sale.orderId.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.date), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                    <p className="font-bold text-accent">${sale.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
