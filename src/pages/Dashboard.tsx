import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { store } from '@/lib/store';
import { Order, Sale } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    averageOrder: 0,
  });

  useEffect(() => {
    const orders: Order[] = store.getOrders();
    const sales: Sale[] = store.getSales();
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalOrders = orders.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= today
    ).length;
    
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      todayOrders,
      averageOrder,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: 'All-time earnings',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      description: 'Completed orders',
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders.toString(),
      icon: TrendingUp,
      description: 'Orders today',
    },
    {
      title: 'Average Order',
      value: `$${stats.averageOrder.toFixed(2)}`,
      icon: Users,
      description: 'Per order value',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your restaurant overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/orders"
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 text-accent" />
              <span className="font-medium">Create New Order</span>
            </a>
            <a
              href="/menu"
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <Users className="h-5 w-5 text-accent" />
              <span className="font-medium">Manage Menu</span>
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Start taking orders to see your recent activity here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
