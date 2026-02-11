import { Users, MapPin, Trophy } from 'lucide-react';
import { useFamilyTracking } from '../hooks/useFamilyTracking';
import { useHomeData } from '../hooks/useHomeData';

interface FamilyTrackerProps {
  familyGroupId?: number;
  familyName?: string;
}

export default function FamilyTracker({
  familyGroupId = 1,
  familyName = 'Santos Family',
}: FamilyTrackerProps) {
  const { familyMembers, loading: trackingLoading } = useFamilyTracking(familyGroupId);
  const { leaderboard, loading: leaderboardLoading } = useHomeData();

  // Ensure arrays are always arrays
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const safeFamilyMembers = Array.isArray(familyMembers) ? familyMembers : [];

  if (trackingLoading && leaderboardLoading) {
    return (
      <div className="bg-white border border-secondary/10 rounded-3xl p-6 shadow-md animate-pulse">
        <div className="h-20 bg-secondary/10 rounded-2xl" />
      </div>
    );
  }

  const activeMembers = safeFamilyMembers.filter((m) => m.status === 'active');

  return (
    <div className="bg-white border border-secondary/10 rounded-3xl p-6 shadow-md font-sf-text">
      <div className="flex items-center gap-3 mb-5">
        <Users size={22} className="text-primary-dark" strokeWidth={2} />
        <span className="font-bold text-sf-base tracking-tight text-primary-dark">{familyName}</span>
        <span className="ml-auto font-sf-text text-sf-sm text-secondary font-medium tracking-tight">
          {activeMembers.length} nearby
        </span>
      </div>

      {/* Family Leaderboard */}
      {safeLeaderboard.length > 0 && (
        <div className="space-y-2.5 mb-5">
          {safeLeaderboard.slice(0, 3).map((entry, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const bgColors = ['bg-gradient-to-r from-accent to-accent/80', 'bg-secondary/10', 'bg-secondary/5'];
            const textColors = ['text-primary-dark', 'text-primary-dark', 'text-primary-dark'];
            
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 ${bgColors[index]} p-3 rounded-2xl ${index === 0 ? 'shadow-sm' : ''}`}
              >
                <span className="font-sf-text font-bold text-sf-sm min-w-6">{medals[index]}</span>
                <span className={`flex-1 font-sf-text font-bold text-sf-sm ${textColors[index]} tracking-tight`}>
                  {entry.display_name}
                </span>
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className={textColors[index]} strokeWidth={2.5} />
                  <span className={`font-sf-text font-bold text-sf-sm ${textColors[index]} tracking-tight`}>
                    {entry.total_points}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Location Details */}
      {safeFamilyMembers.length > 0 && (
        <div className="pt-4 border-t border-secondary/10 space-y-2.5">
          {safeFamilyMembers.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2.5 font-sf-text text-sf-xs text-secondary font-medium tracking-tight"
            >
              <MapPin size={14} className="text-primary" strokeWidth={2} />
              <span className="font-bold text-primary-dark">{member.name.split(' ')[0]}</span>
              <span className="text-secondary/50">•</span>
              <span>{member.location.zone || 'Unknown'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
