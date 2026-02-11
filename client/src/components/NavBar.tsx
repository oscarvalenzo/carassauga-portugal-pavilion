import { Home, Map, Trophy, User } from 'lucide-react';

type Screen = 'landing' | 'home' | 'map' | 'quests' | 'profile';

interface NavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function NavBar({ currentScreen, onNavigate }: NavBarProps) {
  const navItems: { id: Exclude<Screen, 'landing'>; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'quests', icon: Trophy, label: 'Quests' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-porcelain/95 backdrop-blur-xl border-t border-grey/20 flex justify-around px-2 py-1 pb-6 shadow-sm z-40">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 font-sf-text ${
            currentScreen === id
              ? 'text-primary'
              : 'text-text-secondary hover:text-dark hover:bg-grey/10'
          }`}
        >
          {currentScreen === id && (
            <div className="absolute inset-0 bg-primary/10 rounded-xl" />
          )}
          <Icon 
            size={24} 
            strokeWidth={currentScreen === id ? 2.5 : 2}
            className="relative z-10"
          />
          <span className={`text-sf-xs font-semibold relative z-10 tracking-sf-normal ${
            currentScreen === id ? 'text-primary' : 'text-text-secondary'
          }`}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
