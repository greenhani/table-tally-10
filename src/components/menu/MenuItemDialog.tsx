import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuItem, MenuCategory } from '@/types';
import { store } from '@/lib/store';
import { toast } from 'sonner';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().max(500).optional(),
  available: z.boolean(),
  image: z.string().url().optional().or(z.literal('')),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  editItem?: MenuItem;
}

export function MenuItemDialog({ open, onClose, editItem }: MenuItemDialogProps) {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      category: '',
      subCategory: '',
      price: 0,
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
        description: '',
        available: true,
        image: '',
      });
    }
  }, [editItem, form]);

  const onSubmit = (data: MenuItemFormValues) => {
    if (editItem) {
      store.updateMenuItem(editItem.id, data);
      toast.success('Menu item updated successfully');
    } else {
      const newItem: MenuItem = {
        id: crypto.randomUUID(),
        name: data.name,
        category: data.category,
        subCategory: data.subCategory,
        price: data.price,
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
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Appetizers, Main Course, Desserts" {...field} />
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
                  <FormLabel>Sub Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Rice, Curry, Grilled" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <div className="mt-2">
                      <img
                        src={field.value}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150';
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
                      placeholder="Item description (optional)"
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
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Is this item available for ordering?
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90">
                {editItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
