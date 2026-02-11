import { useState } from 'react';
import { User, Mail, Users as UsersIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthScreenProps {
  onComplete: () => void;
}

export default function AuthScreen({ onComplete }: AuthScreenProps) {
  const { register, login, loading, error } = useAuth();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    familyCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register') {
      const result = await register(
        formData.displayName,
        formData.email || undefined,
        formData.familyCode || undefined
      );
      if (result.success) {
        onComplete();
      }
    } else {
      const result = await login(formData.email);
      if (result.success) {
        onComplete();
      }
    }
  };

  return (
    <div className="min-h-screen bg-porcelain flex items-center justify-center p-6 font-sf-text">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
            🇵🇹
          </div>
          <h1 className="font-sf-display text-sf-4xl font-semibold text-dark mb-2 tracking-sf-tight">
            {mode === 'register' ? 'Welcome!' : 'Welcome Back!'}
          </h1>
          <p className="font-sf-text text-sf-base text-text-secondary tracking-sf-normal">
            {mode === 'register' 
              ? 'Join the Portuguese cultural adventure'
              : 'Continue your Portuguese journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-grey/30 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-sf-text text-sf-sm font-semibold text-dark mb-2 tracking-sf-normal">
                Your Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Maria Santos"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-grey/30 rounded-2xl font-sf-text text-sf-base focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-sf-text text-sf-sm font-semibold text-dark mb-2 tracking-sf-normal">
              Email {mode === 'register' && '(Optional)'}
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maria@example.com"
                required={mode === 'login'}
                className="w-full pl-12 pr-4 py-3 border-2 border-grey/30 rounded-2xl font-sf-text text-sf-base focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-sf-text text-sf-sm font-semibold text-dark mb-2 tracking-sf-normal">
                Family Group Code (Optional)
              </label>
              <div className="relative">
                <UsersIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={formData.familyCode}
                  onChange={(e) => setFormData({ ...formData, familyCode: e.target.value })}
                  placeholder="SANTOS2026"
                  className="w-full pl-12 pr-4 py-3 border-2 border-grey/30 rounded-2xl font-sf-text text-sf-base focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <p className="font-sf-text text-sf-xs text-text-secondary mt-2 tracking-sf-normal">
                Join your family to compete together!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <p className="font-sf-text text-sf-sm text-red-600 tracking-sf-normal">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-dark px-6 py-4 rounded-full font-sf-text font-semibold text-sf-base hover:shadow-xl active:scale-[0.98] transition-all duration-300 shadow-md flex items-center justify-center gap-3 tracking-sf-normal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Loading...' : mode === 'register' ? 'Get Started' : 'Sign In'}</span>
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="font-sf-text text-sf-sm text-primary font-semibold tracking-sf-normal hover:underline"
          >
            {mode === 'register' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Skip for Demo */}
        <div className="text-center mt-4">
          <button
            onClick={onComplete}
            className="font-sf-text text-sf-sm text-text-secondary tracking-sf-normal hover:text-dark"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}

