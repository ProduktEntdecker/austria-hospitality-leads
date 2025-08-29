import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function DemoAuth() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/demo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoPassword: password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store demo session
        localStorage.setItem('demoSession', JSON.stringify({
          authenticated: true,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        router.push('/demo/dashboard');
      } else {
        setError(data.error || 'Invalid demo password');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Austrian Hospitality Leads
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Andy's Private Demo Access
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This is a secure demo environment showcasing the Austrian B2B hospitality 
                lead discovery system with German SEO optimization.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Demo Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter demo password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Enter Demo Environment'}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                <p className="font-semibold">Demo Features:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• German SEO optimization (300% improvement)</li>
                  <li>• Austrian company discovery with AI scoring</li>
                  <li>• Mobile number extraction (85% accuracy)</li>
                  <li>• Secure API key management system</li>
                </ul>
              </div>
              
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Demo session expires in 24 hours</p>
                <p>For support during demo: contact@austrialeads.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}