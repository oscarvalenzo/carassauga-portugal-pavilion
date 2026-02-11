import { X, Clock, MapPin, Users, Music, UtensilsCrossed } from 'lucide-react';

interface Artist {
  name: string;
  role: string;
  image?: string;
}

interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

interface Event {
  id: number;
  name: string;
  description?: string;
  location: string;
  start_time: string;
  end_time: string;
  event_type: string;
  is_live: boolean;
  artists?: Artist[];
  menu?: MenuItem[];
}

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function EventDetailModal({ event, onClose, showToast }: EventDetailModalProps) {
  if (!event) return null;

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  // Mock data for artists and menu (in production, this would come from the API)
  const artists: Artist[] = event.artists || [
    { name: 'Ana Moura', role: 'Fado Singer', image: '🎤' },
    { name: 'Pedro Silva', role: 'Portuguese Guitar', image: '🎸' },
    { name: 'Carlos Santos', role: 'Classical Guitar', image: '🎵' }
  ];

  const menuItems: MenuItem[] = event.menu || [
    { name: 'Pastéis de Nata', price: '$3.50', description: 'Traditional custard tarts' },
    { name: 'Bacalhau à Brás', price: '$12.00', description: 'Shredded cod with eggs & potatoes' },
    { name: 'Caldo Verde', price: '$6.00', description: 'Traditional kale soup' },
    { name: 'Vinho Verde', price: '$8.00', description: 'Portuguese green wine' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fadeIn">
      <div className="bg-white w-full max-h-[85vh] rounded-t-[32px] overflow-hidden animate-slideUp font-sf-text">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-primary to-primary/90 text-white px-6 py-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            {event.is_live && (
              <span className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-1 rounded-full font-sf-text font-bold text-sf-xs mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
            <h2 className="font-sf-display text-sf-3xl font-bold tracking-tight mb-2">
              {event.name}
            </h2>
            <div className="flex items-center gap-4 font-sf-text text-sf-sm opacity-90">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={2} />
                {event.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={2} />
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-6 py-6">
          {/* Description */}
          {event.description && (
            <div className="mb-8">
              <p className="font-sf-text text-sf-base text-secondary leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Artist Lineup */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Music size={20} className="text-primary" strokeWidth={2} />
              <h3 className="font-sf-display text-sf-xl font-bold tracking-tight text-primary-dark">
                Artist Lineup
              </h3>
            </div>
            <div className="space-y-3">
              {artists.map((artist, index) => (
                <div
                  key={index}
                  className="bg-background border border-secondary/10 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-2xl">
                    {artist.image || '🎭'}
                  </div>
                  <div className="flex-1">
                    <div className="font-sf-text font-bold text-sf-base text-primary-dark">
                      {artist.name}
                    </div>
                    <div className="font-sf-text text-sf-sm text-secondary">
                      {artist.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed size={20} className="text-primary" strokeWidth={2} />
              <h3 className="font-sf-display text-sf-xl font-bold tracking-tight text-primary-dark">
                Available Menu
              </h3>
            </div>
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-background border border-secondary/10 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-sf-text font-bold text-sf-base text-primary-dark">
                      {item.name}
                    </div>
                    <div className="font-sf-text font-bold text-sf-base text-primary">
                      {item.price}
                    </div>
                  </div>
                  {item.description && (
                    <div className="font-sf-text text-sf-sm text-secondary">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-8 mb-4">
            <button
              onClick={() => {
                showToast('🎵 Added to your schedule!', 'success');
                onClose();
              }}
              className="bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-2xl font-sf-text font-bold text-sf-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Add to Schedule
            </button>
            <button
              onClick={() => {
                showToast('📤 Shared on social media!', 'success');
                onClose();
              }}
              className="bg-white border-2 border-primary text-primary py-4 rounded-2xl font-sf-text font-bold text-sf-sm hover:bg-primary/5 transition-all active:scale-95"
            >
              Share Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

