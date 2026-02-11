import { useState } from 'react';
import { Trophy, Star, QrCode, Sparkles, RefreshCw } from 'lucide-react';
import { useQuestData } from '../hooks/useQuestData';
import { useQuest } from '../hooks/useQuest';
import { useUserStore } from '../stores/userStore';
import QRScanner from '../components/QRScanner';

interface QuestScreenProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function QuestScreen({ showToast }: QuestScreenProps) {
  const [showScanner, setShowScanner] = useState(false);
  const { completeActivity, loading: questLoading } = useQuest();
  const { updatePoints } = useUserStore();
  const { 
    quests, 
    totalActivities, 
    completedActivities, 
    totalPoints, 
    completedBadges, 
    totalBadges, 
    overallProgress,
    loading,
    error,
    refetch 
  } = useQuestData();

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
      {/* Header - Apple Style */}
      <div className="bg-white px-6 py-16 border-b border-secondary/10">
        <div className="flex items-center justify-between">
          <h2 className="font-sf-display text-sf-4xl md:text-sf-5xl font-bold tracking-sf-tighter">The Portuguese Journey</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-br from-accent to-accent/80 text-primary-dark px-4 py-2 rounded-full font-sf-text font-bold text-sf-sm shadow-md">
              <Trophy size={18} strokeWidth={2.5} />
              <span>{totalPoints} pts</span>
            </div>
            <button onClick={refetch} className="text-secondary hover:text-primary-dark transition-colors">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white px-6 py-10 border-b border-secondary/10">
        <div className="flex gap-10 items-center max-w-2xl">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#98ce00"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * overallProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-sf-display text-sf-4xl font-bold text-primary-dark tracking-sf-tight">{overallProgress}%</span>
              <span className="font-sf-text text-sf-xs text-secondary font-medium tracking-tight">Complete</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-5">
            <div>
              <span className="block font-sf-display text-sf-4xl font-bold text-primary-dark tracking-sf-tight">{completedBadges}/{totalBadges}</span>
              <span className="block font-sf-text text-sf-sm text-secondary font-medium tracking-tight">Badges Earned</span>
            </div>
            <div>
              <span className="block font-sf-display text-sf-4xl font-bold text-primary-dark tracking-sf-tight">{completedActivities}</span>
              <span className="block font-sf-text text-sf-sm text-secondary font-medium tracking-tight">Activities Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quest Categories */}
      <div className="px-6 py-10 space-y-5">
        {loading && !quests.length ? (
          // Loading skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-secondary/10 rounded-3xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-6 bg-secondary/10 rounded w-40 mb-2" />
                  <div className="h-4 bg-secondary/10 rounded w-32" />
                </div>
              </div>
            </div>
          ))
        ) : quests.length > 0 ? (
          quests.map((quest) => {
            // Color schemes based on category
            const getColorScheme = (category: string) => {
              switch (category.toLowerCase()) {
                case 'culture':
                  return {
                    bg: 'bg-primary/5',
                    border: 'border-primary/20',
                    gradient: 'from-primary to-primary/80',
                    badgeBg: 'bg-primary',
                  };
                case 'food':
                  return {
                    bg: 'bg-accent/5',
                    border: 'border-accent/20',
                    gradient: 'from-accent to-accent/80',
                    badgeBg: 'bg-accent',
                  };
                case 'sports':
                  return {
                    bg: 'bg-yellow-green/5',
                    border: 'border-yellow-green/20',
                    gradient: 'from-yellow-green to-yellow-green/80',
                    badgeBg: 'bg-yellow-green',
                  };
                default:
                  return {
                    bg: 'bg-secondary/5',
                    border: 'border-secondary/20',
                    gradient: 'from-secondary to-secondary/80',
                    badgeBg: 'bg-secondary',
                  };
              }
            };

            const colors = getColorScheme(quest.category);

            return (
              <div key={quest.quest_id} className={`${colors.bg} border ${colors.border} rounded-3xl p-6 hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center text-[2rem] flex-shrink-0 shadow-md`}>
                    {quest.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sf-display text-sf-xl font-bold tracking-tight">{quest.quest_name}</h3>
                    <p className="font-sf-text text-sf-sm text-secondary font-medium tracking-tight">
                      {quest.completed_activities}/{quest.total_activities} activities • {quest.points_earned} pts
                    </p>
                  </div>
                  {quest.is_complete ? (
                    <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} text-white rounded-full flex items-center justify-center font-bold text-sf-lg shadow-md`}>
                      ✓
                    </div>
                  ) : (
                    <div className={`${colors.badgeBg} text-primary-dark px-4 py-2 rounded-full font-sf-text text-sf-xs font-bold`}>
                      {quest.progress_percentage}%
                    </div>
                  )}
                </div>

                {/* Activity List */}
                {quest.activities && quest.activities.length > 0 && (
                  <div className={`pt-4 border-t ${colors.border} space-y-3`}>
                    {quest.activities.map((activity) => (
                      <div key={activity.id}>
                        {activity.is_completed ? (
                          <div className="font-sf-text text-sf-sm text-primary font-semibold flex items-center gap-3">
                            <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sf-xs">✓</span>
                            {activity.name}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between py-3 bg-white rounded-2xl px-4">
                            <span className="font-sf-text text-sf-sm font-bold text-primary-dark">{activity.name}</span>
                            <button 
                              onClick={() => setShowScanner(true)}
                              className="flex items-center gap-2 bg-primary-dark text-white px-4 py-2.5 rounded-full font-sf-text text-sf-xs font-bold hover:bg-primary-dark/90 transition-colors shadow-sm"
                            >
                              <QrCode size={14} strokeWidth={2.5} />
                              Scan
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-secondary/10 rounded-3xl p-8 text-center">
            <p className="font-sf-text text-secondary">No quests available yet. Start your journey!</p>
          </div>
        )}
      </div>

      {/* Family Leaderboard */}
      <div className="mx-6 mb-10 bg-white border border-secondary/10 rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-5">
          <Star size={20} className="text-accent" strokeWidth={2.5} />
          <span className="font-sf-text font-bold text-sf-base tracking-tight">Family Leaderboard</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-gradient-to-r from-accent to-accent/80 text-primary-dark p-4 rounded-2xl shadow-md">
            <span className="font-sf-text font-bold text-sf-base min-w-8">🥇</span>
            <span className="flex-1 font-sf-text font-bold text-sf-sm">Sofia</span>
            <span className="font-sf-text font-bold text-sf-sm">850 pts</span>
          </div>
          <div className="flex items-center gap-3 bg-secondary/10 p-4 rounded-2xl">
            <span className="font-sf-text font-bold text-sf-base min-w-8">🥈</span>
            <span className="flex-1 font-sf-text font-bold text-sf-sm text-primary-dark">You (Maria)</span>
            <span className="font-sf-text font-bold text-sf-sm text-primary-dark">650 pts</span>
          </div>
          <div className="flex items-center gap-3 bg-secondary/5 p-4 rounded-2xl">
            <span className="font-sf-text font-bold text-sf-base min-w-8">🥉</span>
            <span className="flex-1 font-sf-text font-bold text-sf-sm text-primary-dark">Miguel</span>
            <span className="font-sf-text font-bold text-sf-sm text-primary-dark">480 pts</span>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
