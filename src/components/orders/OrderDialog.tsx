import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MenuItem, Order, OrderItem } from '@/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface OrderDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

export function OrderDialog({ open, onClose }: OrderDialogProps) {
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (open) {
      setMenuItems(store.getMenuItems().filter(item => item.available));
      setSelectedItems([]);
      setTableNumber(1);
    }
  }, [open]);

  const addItem = (menuItem: MenuItem) => {
    const existingItem = selectedItems.find(
      (item) => item.menuItem.id === menuItem.id
    );

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, change: number) => {
    setSelectedItems(
      selectedItems
        .map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (menuItemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItem.id !== menuItemId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (tableNumber < 1) {
      toast.error('Please enter a valid table number');
      return;
    }

    const newOrder: Order = {
      id: crypto.randomUUID(),
      tableNumber,
      items: selectedItems,
      status: 'pending',
      total: calculateTotal(),
      createdAt: new Date(),
    };

    store.addOrder(newOrder);
    
    // Add to sales
    store.addSale({
      id: crypto.randomUUID(),
      orderId: newOrder.id,
      amount: newOrder.total,
      date: new Date(),
      items: selectedItems,
    });

    toast.success('Order created successfully');
    onClose(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="tableNumber">Table Number</Label>
            <Input
              id="tableNumber"
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(parseInt(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Select Items</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => addItem(item)}
                >
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-lg font-bold text-accent mt-2">
                    ${item.price.toFixed(2)}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.menuItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-accent">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-accent hover:bg-accent/90"
              disabled={selectedItems.length === 0}
            >
              Create Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
