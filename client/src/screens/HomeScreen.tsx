import { Clock, Users, MapPin, Share2, Trophy, QrCode, Camera, Gift, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import FamilyTracker from '../components/FamilyTracker';
import EventDetailModal from '../components/EventDetailModal';
import { useQuest } from '../hooks/useQuest';
import { useUserStore } from '../stores/userStore';
import { useHomeData } from '../hooks/useHomeData';

interface HomeScreenProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function HomeScreen({ showToast }: HomeScreenProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { completeActivity, loading: questLoading } = useQuest();
  const { updatePoints } = useUserStore();
  const { liveEvents, questProgress, loading, error, refetch } = useHomeData();

  const handleScan = async (code: string) => {
    setShowScanner(false);
    
    // Parse QR code format: CARA_ACT_XXX or CARA_FOOD_001, etc.
    const parts = code.split('_');
    if (parts.length < 3 || parts[0] !== 'CARA') {
      showToast('❌ Invalid QR code format', 'error');
      return;
    }

    // Extract activity ID from QR code
    // Format: CARA_ACT_001 -> activity_id = 1
    // or CARA_FOOD_001 -> need to look up by qr_code string
    const activityIdStr = parts[2];
    const activityId = parseInt(activityIdStr, 10);

    if (isNaN(activityId)) {
      showToast('❌ Invalid activity ID', 'error');
      return;
    }

    showToast('🔄 Processing QR code...', 'info');

    try {
      const result = await completeActivity(activityId, code);
      
      if (result.success) {
        showToast(
          `✅ +${result.points_earned} points! ${result.new_badges ? '🏆 Badge unlocked!' : ''}`,
          'success'
        );
        
        // Update local store
        updatePoints(result.points_earned);
        
        // Refresh data to show updated progress
        await refetch();
        
        // Show badge notification if any
        if (result.new_badges && result.new_badges.length > 0) {
          setTimeout(() => {
            showToast(`🎉 New Badge: ${result.new_badges![0]}`, 'success');
          }, 1500);
        }
      } else {
        showToast(`❌ ${result.message}`, 'error');
      }
    } catch (err) {
      showToast('❌ Failed to process QR code', 'error');
    }
  };

  return (
    <div className="animate-fadeIn bg-background min-h-full font-sf-text text-primary-dark">
      {/* Hero Banner - Full Viewport Height */}
      <div className="relative min-h-screen h-screen flex flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=800&q=80"
          alt="Portugal Pavilion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Darker gradient overlay for perfect text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        
        <div className="relative z-10 p-8 text-white pb-32">
          <h1 className="font-sf-display text-[2.5rem] font-bold mb-3 tracking-tight leading-tight drop-shadow-2xl animate-slideUp">
            Bem-vindo!
          </h1>
          <p className="font-sf-text text-[1.125rem] font-medium drop-shadow-lg tracking-tight animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Experience Portuguese culture and heritage
          </p>
        </div>
      </div>

      {/* Family Group Status - More Space */}
      <div className="-mt-20 mx-6 mb-10 relative z-20">
        <FamilyTracker familyGroupId={1} familyName="Santos Family" />
      </div>

      {/* Happening Now Section - Increased Spacing */}
      <div className="px-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sf-display text-[1.75rem] font-bold tracking-tight">Happening Now</h2>
          <button onClick={refetch} className="text-secondary hover:text-primary-dark transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} strokeWidth={2} />
          </button>
        </div>

        {loading && !liveEvents.length ? (
          <div className="bg-white border border-secondary/10 rounded-3xl p-6 mb-5 shadow-md animate-pulse">
            <div className="h-6 bg-secondary/10 rounded w-24 mb-4" />
            <div className="h-8 bg-secondary/10 rounded w-3/4 mb-2" />
            <div className="h-4 bg-secondary/10 rounded w-1/2 mb-5" />
            <div className="h-12 bg-secondary/10 rounded" />
          </div>
        ) : liveEvents.length > 0 ? (
          liveEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white border border-secondary/10 rounded-3xl p-6 mb-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-sf-text text-xs font-bold tracking-wide mb-4">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
              <h3 className="font-sf-display text-[1.375rem] font-bold mb-2 tracking-tight">{event.name}</h3>
              <p className="font-sf-text text-[0.9375rem] text-secondary mb-5 font-medium tracking-tight">
                {event.location} {event.viewer_count && `• ${event.viewer_count} watching`}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('Opening map...', 'info');
                  }}
                  className="flex-1 bg-primary-dark text-white px-5 py-3.5 rounded-full font-sf-text font-bold text-[0.9375rem] hover:bg-primary-dark/90 transition-colors flex items-center justify-center gap-2 tracking-tight shadow-sm"
                >
                  <MapPin size={18} strokeWidth={2.5} />
                  <span>Navigate</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('Link copied!', 'success');
                  }}
                  className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
                >
                  <Share2 size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-secondary/10 rounded-3xl p-6 mb-5 text-center">
            <p className="font-sf-text text-secondary">No live events right now. Check back soon!</p>
          </div>
        )}

        {/* Virtual Queue Card - Enhanced */}
        <div className="bg-white border border-secondary/10 rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Users size={22} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <span className="block font-sf-text font-bold text-[0.9375rem] tracking-tight">Virtual Queue</span>
              <span className="block font-sf-text text-[0.875rem] text-secondary font-medium tracking-tight mt-1">Bacalhau à Brás • 8 min</span>
            </div>
          </div>
          <button 
            onClick={() => showToast('Joined queue!', 'success')}
            className="w-full border-2 border-primary-dark text-primary-dark px-5 py-3.5 rounded-full font-sf-text font-bold text-[0.9375rem] hover:bg-primary-dark hover:text-white transition-all tracking-tight"
          >
            Join Queue
          </button>
        </div>
      </div>

      {/* Your Quests - Increased Spacing */}
      <div className="px-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sf-display text-[1.75rem] font-bold tracking-tight">Your Quests</h2>
          <Trophy size={22} className="text-secondary" strokeWidth={2} />
        </div>

        {loading && !questProgress.length ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-secondary/10 rounded-3xl p-5 flex gap-4 animate-pulse">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-secondary/10 rounded w-32 mb-3" />
                  <div className="h-2.5 bg-secondary/10 rounded mb-2" />
                  <div className="h-3 bg-secondary/10 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : questProgress.length > 0 ? (
          <div className="space-y-4">
            {questProgress.map((quest) => {
              // Determine gradient color based on category
              const getGradient = (category: string) => {
                switch (category.toLowerCase()) {
                  case 'food':
                    return 'from-accent to-accent/80';
                  case 'culture':
                    return 'from-primary to-primary/80';
                  case 'sports':
                    return 'from-yellow-green to-yellow-green/80';
                  default:
                    return 'from-primary to-primary/80';
                }
              };

              const getBorderColor = (category: string) => {
                switch (category.toLowerCase()) {
                  case 'food':
                    return 'border-accent/20';
                  case 'culture':
                    return 'border-primary/20';
                  case 'sports':
                    return 'border-yellow-green/20';
                  default:
                    return 'border-primary/20';
                }
              };

              const gradient = getGradient(quest.category);
              const borderColor = getBorderColor(quest.category);

              return (
                <div key={quest.quest_id} className={`bg-white border ${borderColor} rounded-3xl p-5 flex gap-4 hover:shadow-md transition-shadow`}>
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-[1.75rem] flex-shrink-0 shadow-md`}>
                    {quest.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="block font-sf-text font-bold text-[0.9375rem] tracking-tight">{quest.quest_name}</span>
                      {quest.is_complete && <span className="font-sf-text text-lg text-primary">✓</span>}
                    </div>
                    <div className="h-2.5 bg-secondary/10 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`} 
                        style={{ width: `${quest.progress_percentage}%` }} 
                      />
                    </div>
                    <span className={`font-sf-text text-xs font-semibold tracking-tight ${quest.is_complete ? 'text-primary font-bold' : 'text-secondary'}`}>
                      {quest.is_complete ? 'Complete!' : `${quest.completed_activities}/${quest.total_activities} completed`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-secondary/10 rounded-3xl p-6 text-center">
            <p className="font-sf-text text-secondary">No quests available. Start scanning QR codes!</p>
          </div>
        )}
      </div>

      {/* Quick Actions - Enhanced Spacing */}
      <div className="mx-6 mb-10 grid grid-cols-3 gap-4">
        {[
          { icon: QrCode, label: 'Scan QR', action: () => setShowScanner(true) },
          { icon: Camera, label: 'AR Photo', action: () => showToast('AR Photo coming soon!', 'info') },
          { icon: Gift, label: 'Rewards', action: () => showToast('Check Profile for rewards!', 'info') },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-3 bg-white border border-secondary/10 p-5 rounded-3xl hover:shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Icon size={26} className="text-primary-dark" strokeWidth={2} />
            <span className="font-sf-text text-xs font-bold tracking-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
