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
import { MenuItem } from '@/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  discount: z.number().min(0).max(100).optional(),
  description: z.string().max(500).optional(),
  available: z.boolean(),
  image: z.string().url().optional().or(z.literal('')),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemSheetProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  editItem?: MenuItem;
}

export function MenuItemSheet({ open, onClose, editItem }: MenuItemSheetProps) {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      category: '',
      subCategory: '',
      price: 0,
      discount: 0,
      description: '',
      available: true,
      image: '',
    },
  });

  useEffect(() => {
    if (editItem) {
      form.reset({
        name: editItem.name,
        category: editItem.category,
        subCategory: editItem.subCategory || '',
        price: editItem.price,
        discount: 0,
        description: editItem.description || '',
        available: editItem.available,
        image: editItem.image || '',
      });
    } else {
      form.reset({
        name: '',
        category: '',
        subCategory: '',
        price: 0,
        discount: 0,
        description: '',
        available: true,
        image: '',
      });
    }
  }, [editItem, form]);

  const onSubmit = (data: MenuItemFormValues) => {
    const finalPrice = data.discount 
      ? data.price - (data.price * data.discount / 100)
      : data.price;

    if (editItem) {
      store.updateMenuItem(editItem.id, { ...data, price: finalPrice });
      toast.success('Menu item updated successfully');
    } else {
      const newItem: MenuItem = {
        id: crypto.randomUUID(),
        name: data.name,
        category: data.category,
        subCategory: data.subCategory,
        price: finalPrice,
        description: data.description,
        available: data.available,
        image: data.image,
      };
      store.addMenuItem(newItem);
      toast.success('Menu item added successfully');
    }
    onClose(true);
  };

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chicken Biryani" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Sub Category in One Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mains" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price and Discount in One Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (PKR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Show Final Price if Discount Applied */}
              {form.watch('discount') > 0 && form.watch('price') > 0 && (
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground">Final Price:</p>
                  <p className="text-2xl font-bold text-accent">
                    PKR {(form.watch('price') - (form.watch('price') * form.watch('discount') / 100)).toFixed(0)}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
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
                        <Input placeholder="https://example.com/image.jpg" {...field} />
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
                          alt="Preview"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your dish..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
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
                        Customers can order this item
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
                  {editItem ? 'Update Item' : 'Create Item'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
