import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { MenuItem } from '@/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  selectedItems: z.array(z.string()).min(1, 'Select at least one item'),
  available: z.boolean(),
  image: z.string().url().optional().or(z.literal('')),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface DealsSheetProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  menuItems: MenuItem[];
}

export function DealsSheet({ open, onClose, menuItems }: DealsSheetProps) {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      selectedItems: [],
      available: true,
      image: '',
    },
  });

  const regularMenuItems = menuItems.filter(item => !item.isDeal);
  const selectedItems = form.watch('selectedItems');

  const calculateOriginalPrice = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = regularMenuItems.find(i => i.id === itemId);
      return total + (item?.price || 0);
    }, 0);
  };

  const onSubmit = (data: DealFormValues) => {
    const newDeal: MenuItem = {
      id: crypto.randomUUID(),
      name: data.name,
      category: 'deals',
      price: data.price,
      description: data.description,
      available: data.available,
      image: data.image,
      isDeal: true,
      dealItems: data.selectedItems,
    };
    
    store.addMenuItem(newDeal);
    toast.success('Deal created successfully');
    onClose(true);
  };

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Create New Deal</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Family Feast, Lunch Special" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what's included in this deal..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selectedItems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Items for This Deal</FormLabel>
                    <div className="space-y-3 mt-3">
                      {regularMenuItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No menu items available. Add menu items first.</p>
                      ) : (
                        regularMenuItems.map((item) => (
                          <Card key={item.id} className="p-3">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={field.value.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, item.id]);
                                  } else {
                                    field.onChange(field.value.filter(id => id !== item.id));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{item.name}</p>
                                  <Badge variant="secondary">PKR {item.price.toFixed(0)}</Badge>
                                </div>
                                {item.subCategory && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.subCategory}</p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedItems.length > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Total:</span>
                    <span className="font-medium line-through">PKR {calculateOriginalPrice().toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Items Selected:</span>
                    <span className="font-medium">{selectedItems.length} items</span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Price (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    {selectedItems.length > 0 && form.watch('price') > 0 && (
                      <div className="mt-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-sm text-muted-foreground">You Save:</p>
                        <p className="text-xl font-bold text-accent">
                          PKR {(calculateOriginalPrice() - form.watch('price')).toFixed(0)}
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Image</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant={imageMode === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageMode('url')}
                      >
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={imageMode === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageMode('upload')}
                      >
                        Upload
                      </Button>
                    </div>
                    <FormControl>
                      {imageMode === 'url' ? (
                        <Input placeholder="https://example.com/deal-image.jpg" {...field} />
                      ) : (
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                field.onChange(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      )}
                    </FormControl>
                    {field.value && (
                      <div className="mt-3">
                        <img
                          src={field.value}
                          alt="Deal Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300';
                          }}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-card">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Available for Orders</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Customers can order this deal
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onClose()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  Create Deal
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
