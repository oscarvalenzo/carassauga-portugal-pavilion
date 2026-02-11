import { useState, useEffect } from 'react';
import { Home, Map, Trophy, User } from 'lucide-react';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import QuestScreen from './screens/QuestScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavBar from './components/NavBar';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { useUserStore } from './stores/userStore';
import { authAPI } from './services/api';

type Screen = 'landing' | 'login' | 'register' | 'home' | 'map' | 'quests' | 'profile';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const { toasts, showToast, removeToast } = useToast();
  const { user, token, setUser, setToken, clearUser } = useUserStore();

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // If user is already logged in, go straight to home
        if (currentScreen === 'landing') {
          setCurrentScreen('home');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Listen for auth logout events
  useEffect(() => {
    const handleLogout = () => {
      clearUser();
      setCurrentScreen('login');
      showToast('Session expired. Please login again.', 'info');
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearUser, showToast]);

  const enterApp = () => {
    // If user is already logged in, go to home
    if (token && user) {
      setCurrentScreen('home');
    } else {
      // Otherwise, show login screen
      setCurrentScreen('login');
    }
  };

  const handleLoginSuccess = () => {
    showToast('Welcome back! 🎉', 'success');
    setCurrentScreen('home');
  };

  const handleRegisterSuccess = () => {
    showToast('Account created! Welcome! 🎉', 'success');
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    authAPI.logout();
    clearUser();
    setCurrentScreen('landing');
    showToast('Logged out successfully', 'info');
  };

  const renderScreen = () => {
    // Auth Screens (full screen, no nav bar)
    if (currentScreen === 'landing') {
      return <LandingScreen onEnter={enterApp} />;
    }

    if (currentScreen === 'login') {
      return (
        <div className="flex-1 overflow-y-auto">
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentScreen('register')}
            showToast={showToast}
          />
        </div>
      );
    }

    if (currentScreen === 'register') {
      return (
        <div className="flex-1 overflow-y-auto">
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentScreen('login')}
            showToast={showToast}
          />
        </div>
      );
    }

    // Protected Screens (require auth)
    if (!token || !user) {
      // Redirect to login if trying to access protected screens
      setCurrentScreen('login');
      showToast('Please login to continue', 'info');
      return null;
    }

    return (
      <>
        {/* App Screens */}
        <div className="flex-1 bg-gray-50 overflow-y-auto pb-20 scroll-smooth">
          {currentScreen === 'home' && <HomeScreen showToast={showToast} />}
          {currentScreen === 'map' && <MapScreen showToast={showToast} />}
          {currentScreen === 'quests' && <QuestScreen showToast={showToast} />}
          {currentScreen === 'profile' && <ProfileScreen showToast={showToast} onLogout={handleLogout} />}
        </div>

        {/* Navigation Bar */}
        <NavBar 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-ink-black to-black flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="w-full max-w-sm h-[844px] bg-porcelain rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative transform hover:scale-[1.02] transition-transform duration-300">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-7 bg-black rounded-b-3xl z-50" />
        
        {/* Screen Content */}
        {renderScreen()}

        {/* Toast Notifications */}
        <div className="absolute top-0 right-0 left-0 z-50 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

