import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast.success('Welcome to SetRestGo!');
      navigate('/');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-accent to-accent/80 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-accent-foreground">SRG</span>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">SetRestGo</CardTitle>
            <CardDescription className="text-base mt-2">Restaurant Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" size="lg">
              Sign In
            </Button>
          </form>
          <div className="mt-8 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <a
              href="https://www.creativeenergy.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline inline-block"
            >
              Powered by Creative Energy
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
