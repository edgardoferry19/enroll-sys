import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Lock, User } from 'lucide-react';
import { UserRole } from '../App';
import { authService } from '../services/auth.service';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await authService.login({ username, password });

      if (response.success) {
        const role = response.data.user.role as UserRole;
        onLogin(role);
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-4">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Informatics College
                </h1>
                <p className="text-2xl text-slate-600">Northgate Campus</p>
                <p className="text-xl text-slate-500">Enrollment System</p>
              </div>
              <p className="text-slate-600 max-w-md">
                Seamlessly manage your academic journey with our modern enrollment platform.
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Welcome Back</h2>
                  <p className="text-slate-500">Sign in to continue</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Roles: superadmin, dean, registrar, admin, or student ID
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </a>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  Need help? Contact support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}