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
    <div className="w-18 h-screen bg-card border-r border-border flex flex-col items-center py-6 gap-4">
      {/* App Logo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent via-accent to-accent/80 flex items-center justify-center shadow-lg mb-4 cursor-pointer">
            <span className="text-lg font-bold text-accent-foreground">SRG</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-semibold">SetRestGo</p>
        </TooltipContent>
      </Tooltip>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2 w-full items-center">
        {menuItems.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.url}
                end={item.url === '/'}
                className={({ isActive }) =>
                  `w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
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
            className="w-12 h-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
