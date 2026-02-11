import { useState } from 'react';
import { LogIn, Mail, User } from 'lucide-react';
import { authAPI } from '../services/api';
import { useUserStore } from '../stores/userStore';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function LoginScreen({ onLoginSuccess, onSwitchToRegister, showToast }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email: email.trim() });
      
      if (response.data.token) {
        // Store token and user data
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        showToast(`Welcome back, ${response.data.user.display_name}!`, 'success');
        onLoginSuccess();
      } else {
        showToast('Login failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 404) {
        showToast('Account not found. Please register first.', 'error');
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Invalid login data';
        showToast(typeof errorMsg === 'string' ? errorMsg : 'Invalid login data', 'error');
      } else if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        showToast(typeof errorMsg === 'string' ? errorMsg : 'Login failed', 'error');
      } else {
        showToast('Login failed. Please check your connection.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center px-6 py-12 font-sf-text">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-sf-4xl">🇵🇹</span>
          </div>
          <h1 className="font-sf-display text-sf-4xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="font-sf-text text-sf-base text-white/80 font-medium">
            Sign in to continue your Portuguese journey
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block font-sf-text text-sf-sm font-semibold text-white/90">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={20} className="text-primary-dark/40" strokeWidth={2} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl font-sf-text text-sf-base text-primary-dark placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg transition-all"
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white px-6 py-4 rounded-2xl font-sf-text font-bold text-sf-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={20} strokeWidth={2.5} />
                Sign In
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sf-sm">
              <span className="px-4 bg-primary text-white/60 font-medium">or</span>
            </div>
          </div>

          {/* Register Link */}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 py-4 rounded-2xl font-sf-text font-bold text-sf-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-white/20"
          >
            <User size={20} strokeWidth={2.5} />
            Create New Account
          </button>
        </form>

        {/* Quick Login (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-sf-xs font-semibold text-white/60 mb-3 text-center">
              Quick Login (Dev Only)
            </p>
            <div className="space-y-2">
              {[
                { email: 'maria@example.com', name: 'Maria Santos', level: 4 },
                { email: 'sofia@example.com', name: 'Sofia Santos', level: 5 },
                { email: 'sam@example.com', name: 'Sam', level: 3 },
              ].map((account) => (
                <button
                  key={account.email}
                  onClick={() => setEmail(account.email)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-xl font-sf-text text-sf-xs font-medium text-left transition-all"
                >
                  {account.name} • Level {account.level}
                  <span className="block text-white/50 text-[10px] mt-0.5">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-sf-xs text-white/50 font-medium">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

