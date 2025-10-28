import { Home, UtensilsCrossed, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Menu', url: '/menu', icon: UtensilsCrossed },
  { title: 'Orders', url: '/orders', icon: ShoppingCart },
  { title: 'Sales', url: '/sales', icon: TrendingUp },
];

export function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-20 h-screen bg-card border-r border-border flex flex-col items-center py-8 gap-6">
      {/* App Logo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent via-accent to-accent/80 flex items-center justify-center shadow-lg mb-2 cursor-pointer">
            <span className="text-xl font-bold text-accent-foreground">SRG</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-semibold">SetRestGo</p>
        </TooltipContent>
      </Tooltip>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-3 w-full items-center px-2">
        {menuItems.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.url}
                end={item.url === '/'}
                className={({ isActive }) =>
                  `w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'text-muted-foreground hover:bg-accent/20 hover:text-accent-foreground hover:scale-105'
                  }`
                }
              >
                <item.icon className="h-6 w-6" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Logout Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-14 h-14 rounded-2xl text-muted-foreground hover:bg-destructive/20 hover:text-destructive hover:scale-105 transition-all"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
