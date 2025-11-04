import { Home, UtensilsCrossed, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

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
    <div className="w-24 h-screen bg-card border-r border-border flex flex-col items-center py-8 gap-6">
      {/* App Logo */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 cursor-pointer">
        <img src={logo} alt="SRG Logo" className="w-full h-full object-contain" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full items-center px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === '/'}
            className={({ isActive }) =>
              `w-full flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-transparent'
                  : 'bg-transparent hover:bg-muted/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={`h-6 w-6 transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`}
                />
                <span 
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`}
                >
                  {item.title}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
      >
        <LogOut className="h-6 w-6" />
        <span className="text-xs font-medium">Logout</span>
      </Button>
    </div>
  );
}
