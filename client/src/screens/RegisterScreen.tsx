import { useState } from 'react';
import { UserPlus, Mail, User, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';
import { useUserStore } from '../stores/userStore';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function RegisterScreen({ onRegisterSuccess, onSwitchToLogin, showToast }: RegisterScreenProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useUserStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!displayName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

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
      const response = await authAPI.register({
        display_name: displayName.trim(),
        email: email.trim(),
      });
      
      if (response.data.token) {
        // Store token and user data
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        showToast(`Welcome, ${response.data.user.display_name}! 🎉`, 'success');
        onRegisterSuccess();
      } else {
        showToast('Registration failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'This email is already registered. Please login.';
        showToast(typeof errorMsg === 'string' ? errorMsg : 'Registration failed', 'error');
      } else if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        showToast(typeof errorMsg === 'string' ? errorMsg : 'Registration failed', 'error');
      } else {
        showToast('Registration failed. Please check your connection.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center px-6 py-12 font-sf-text">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onSwitchToLogin}
          className="mb-8 flex items-center gap-2 text-white/80 hover:text-white font-sf-text text-sf-sm font-semibold transition-colors group"
        >
          <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-sf-4xl">🇵🇹</span>
          </div>
          <h1 className="font-sf-display text-sf-4xl font-bold text-white mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="font-sf-text text-sf-base text-white/80 font-medium">
            Start your Portuguese cultural journey
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Display Name Input */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="block font-sf-text text-sf-sm font-semibold text-white/90">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-primary-dark/40" strokeWidth={2} />
              </div>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Maria Santos"
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl font-sf-text text-sf-base text-primary-dark placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg transition-all"
                disabled={loading}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <p className="font-sf-text text-sf-xs text-white/80 font-medium leading-relaxed">
              ✨ <strong>Quick & Easy:</strong> No password required! We'll send you a magic link to sign in.
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white px-6 py-4 rounded-2xl font-sf-text font-bold text-sf-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={20} strokeWidth={2.5} />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <p className="text-center font-sf-text text-sf-sm text-white/70 font-medium">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-white font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>

        {/* Features Preview */}
        <div className="mt-10 space-y-3">
          {[
            { emoji: '🎭', text: 'Complete cultural quests' },
            { emoji: '🏆', text: 'Earn badges & points' },
            { emoji: '👨‍👩‍👧‍👦', text: 'Track your family' },
            { emoji: '📸', text: 'Unlock AR experiences' },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-white/70 font-sf-text text-sf-sm font-medium"
            >
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-sf-base">{feature.emoji}</span>
              </div>
              {feature.text}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sf-xs text-white/50 font-medium">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

