import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuItem } from '@/types';
import { store } from '@/lib/store';
import { MenuItemSheet } from '@/components/menu/MenuItemSheet';
import { DealsSheet } from '@/components/menu/DealsSheet';
import { toast } from 'sonner';

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDealsSheetOpen, setIsDealsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = () => {
    setMenuItems(store.getMenuItems());
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return ['all', ...cats.filter(cat => cat !== 'deals'), 'deals'];
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    store.deleteMenuItem(id);
    loadMenuItems();
    toast.success('Menu item deleted successfully');
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const handleSheetClose = (refresh?: boolean) => {
    setIsSheetOpen(false);
    setEditingItem(undefined);
    if (refresh) {
      loadMenuItems();
    }
  };

  const handleDealsSheetClose = (refresh?: boolean) => {
    setIsDealsSheetOpen(false);
    if (refresh) {
      loadMenuItems();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and deals</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsDealsSheetOpen(true)} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
          <Button onClick={() => setIsSheetOpen(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === 'all' ? 'All Items' : cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {selectedCategory === 'deals' ? 'No deals created yet. Click "Add Deal" to create one.' : 'No menu items found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredItems.map((item) => (
                <Card key={item.id} className="shadow-md hover:shadow-lg transition-all overflow-hidden">
                  {item.isDeal && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-accent text-white shadow-md text-xs px-2 py-0.5">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Deal
                      </Badge>
                    </div>
                  )}
                  {item.image && (
                    <div className="w-full h-32 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{item.name}</CardTitle>
                        {item.subCategory && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {item.subCategory}
                          </Badge>
                        )}
                        {item.isDeal && item.dealItems && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.dealItems.length} items
                          </p>
                        )}
                      </div>
                      <Badge variant={item.available ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {item.available ? 'Available' : 'Out'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        PKR {item.price.toFixed(0)}
                      </span>
                      <div className="flex gap-1">
                        {!item.isDeal && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MenuItemSheet
        open={isSheetOpen}
        onClose={handleSheetClose}
        editItem={editingItem}
      />

      <DealsSheet
        open={isDealsSheetOpen}
        onClose={handleDealsSheetClose}
        menuItems={menuItems}
      />
    </div>
  );
}
