import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MenuItem, Order, OrderItem, OrderType } from '@/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Minus, Trash2, Search } from 'lucide-react';

interface OrderSheetProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  order?: Order;
}

export function OrderSheet({ open, onClose, order }: OrderSheetProps) {
  const [orderType, setOrderType] = useState<OrderType>('table');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [estimatedTime, setEstimatedTime] = useState<number>(30);
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerContact, setCustomerContact] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  useEffect(() => {
    if (open) {
      setMenuItems(store.getMenuItems().filter(item => item.available));
      if (order) {
        setSelectedItems(order.items);
        setOrderType(order.orderType);
        setTableNumber(order.tableNumber || 1);
        setEstimatedTime(order.estimatedTime || 30);
        setDiscount(order.discount || 0);
        setCustomerName(order.customerName || '');
        setCustomerContact(order.customerContact || '');
        setDeliveryAddress(order.deliveryAddress || '');
      } else {
        setSelectedItems([]);
        setOrderType('table');
        setTableNumber(1);
        setEstimatedTime(30);
        setDiscount(0);
        setCustomerName('');
        setCustomerContact('');
        setDeliveryAddress('');
      }
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [open, order]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return ['all', ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

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

  const calculateSubtotal = () => {
    return selectedItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (orderType === 'table' && tableNumber < 1) {
      toast.error('Please enter a valid table number');
      return;
    }

    if ((orderType === 'takeaway' || orderType === 'delivery') && !customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    if ((orderType === 'takeaway' || orderType === 'delivery') && !customerContact.trim()) {
      toast.error('Please enter customer contact');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    if (order) {
      // Update existing order
      const updatedOrder: Order = {
        ...order,
        items: selectedItems,
        subtotal,
        discount,
        total,
        estimatedTime,
        customerName: orderType !== 'table' ? customerName : undefined,
        customerContact: orderType !== 'table' ? customerContact : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      };
      store.updateOrder(updatedOrder);
      toast.success('Order updated successfully');
    } else {
      // Create new order
      const newOrder: Order = {
        id: crypto.randomUUID(),
        orderType,
        tableNumber: orderType === 'table' ? tableNumber : undefined,
        items: selectedItems,
        status: 'pending',
        subtotal,
        discount,
        total,
        createdAt: new Date(),
        estimatedTime,
        customerName: orderType !== 'table' ? customerName : undefined,
        customerContact: orderType !== 'table' ? customerContact : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      };

      store.addOrder(newOrder);
      toast.success('Order created successfully');
    }
    
    onClose(true);
  };

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{order ? 'Modify Order' : 'Create New Order'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <Label className="mb-3 block">Order Type</Label>
            <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
              <div className="grid grid-cols-3 gap-3">
                <Label
                  htmlFor="table"
                  className={`flex items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    orderType === 'table' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="table" id="table" className="sr-only" />
                  <span className="font-medium">Table</span>
                </Label>
                <Label
                  htmlFor="takeaway"
                  className={`flex items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    orderType === 'takeaway' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="takeaway" id="takeaway" className="sr-only" />
                  <span className="font-medium">Takeaway</span>
                </Label>
                <Label
                  htmlFor="delivery"
                  className={`flex items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    orderType === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                  <span className="font-medium">Delivery</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {orderType === 'table' && (
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
            )}
            
            <div className={orderType === 'table' ? '' : 'col-span-2'}>
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min="1"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            {orderType === 'table' && (
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {(orderType === 'takeaway' || orderType === 'delivery') && (
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-medium text-sm">Customer Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerContact">Contact Number</Label>
                  <Input
                    id="customerContact"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="mt-1"
                    placeholder="Enter contact"
                  />
                </div>
              </div>
              
              {orderType === 'delivery' && (
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Input
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mt-1"
                    placeholder="Enter full address"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div>
            <Label className="mb-2 block">Search Items</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredItems.map((item) => (
                     <Card
                      key={item.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addItem(item)}
                    >
                      <div className="flex gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                            {item.isDeal && (
                              <Badge className="bg-accent text-white text-xs px-1 py-0">Deal</Badge>
                            )}
                          </div>
                          {item.subCategory && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.subCategory}
                            </Badge>
                          )}
                          <p className="text-sm font-bold text-accent mt-1">
                            PKR {item.price.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        PKR {item.menuItem.price.toFixed(0)} each
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

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>PKR {calculateSubtotal().toFixed(0)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-accent">
                    <span>Discount ({discount}%)</span>
                    <span>- PKR {((calculateSubtotal() * discount) / 100).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-accent">PKR {calculateTotal().toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-accent hover:bg-accent/90"
              disabled={selectedItems.length === 0}
            >
              {order ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
