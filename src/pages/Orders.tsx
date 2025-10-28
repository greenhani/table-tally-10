import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Check, X, Edit, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Order, OrderStatus } from '@/types';
import { store } from '@/lib/store';
import { OrderSheet } from '@/components/orders/OrderSheet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      setOrders((prev) => [...prev]); // Force re-render for timer updates
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    setOrders(store.getOrders().filter(o => o.status !== 'completed'));
  };

  const handleSheetClose = (refresh?: boolean) => {
    setIsSheetOpen(false);
    setSelectedOrder(undefined);
    if (refresh) {
      loadOrders();
    }
  };

  const handleCompleteOrder = (order: Order) => {
    const completedOrder = { ...order, status: 'completed' as OrderStatus, completedAt: new Date() };
    store.updateOrder(completedOrder);
    
    // Add to sales
    store.addSale({
      id: crypto.randomUUID(),
      orderId: order.id,
      amount: order.total,
      date: new Date(),
      items: order.items,
    });

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    
    toast.success('Order completed successfully! 🎉');
    loadOrders();
  };

  const handleCancelOrder = (order: Order) => {
    store.updateOrder({ ...order, status: 'cancelled' });
    toast.success('Order cancelled');
    loadOrders();
  };

  const handleModifyOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const getOrderTypeLabel = (order: Order) => {
    if (order.orderType === 'table') {
      return `Table ${order.tableNumber}`;
    }
    return order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      'in-progress': 'default',
      completed: 'default',
      cancelled: 'destructive',
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getRemainingTime = (order: Order) => {
    if (!order.estimatedTime) return null;
    const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
    const remaining = order.estimatedTime - elapsed;
    return remaining;
  };

  const isTimeUp = (order: Order) => {
    const remaining = getRemainingTime(order);
    return remaining !== null && remaining <= 0;
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>
          <Button onClick={() => setIsSheetOpen(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No active orders</p>
              <Button onClick={() => setIsSheetOpen(true)} className="bg-accent hover:bg-accent/90">
                Create First Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const remaining = getRemainingTime(order);
              const timeUp = isTimeUp(order);

              return (
                <Card key={order.id} className={`shadow-lg hover:shadow-xl transition-all ${timeUp ? 'border-accent border-2' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{getOrderTypeLabel(order)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a')}
                        </p>
                        {order.estimatedTime && (
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className={`text-sm font-medium ${timeUp ? 'text-accent' : 'text-muted-foreground'}`}>
                              {remaining !== null && remaining > 0
                                ? `${remaining} min remaining`
                                : 'Ready!'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleCompleteOrder(order)}>
                                <Check className="h-4 w-4 mr-2" />
                                Complete
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'cancelled' && (
                              <DropdownMenuItem onClick={() => handleCancelOrder(order)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleModifyOrder(order)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modify
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="font-medium">
                            PKR {(item.quantity * item.menuItem.price).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold text-accent">
                          PKR {order.total.toFixed(0)}
                        </span>
                      </div>
                      {timeUp && order.status !== 'completed' && (
                        <Button 
                          onClick={() => handleCompleteOrder(order)}
                          className="w-full bg-accent hover:bg-accent/90"
                        >
                          Complete Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <OrderSheet open={isSheetOpen} onClose={handleSheetClose} order={selectedOrder} />
      </div>
    </>
  );
}
