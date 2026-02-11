import { useState, useEffect, useCallback } from 'react';
import { badgeAPI } from '../services/api';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  icon_emoji?: string;
  badge_type: 'quest' | 'special' | 'hidden';
  quest_category?: string;
  earned_at?: string;
  earned?: boolean;
}

export function useBadges() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    console.log('[useBadges] Starting fetch...');
    setLoading(true);
    setError(null);
    try {
      // Fetch both all badges and earned badges in parallel
      const [allResponse, earnedResponse] = await Promise.all([
        badgeAPI.getAll(),
        badgeAPI.getEarned(),
      ]);

      console.log('[useBadges] API responses:', { allResponse, earnedResponse });

      // Ensure we always have arrays
      const allBadgesData = allResponse.data.badges || [];
      const earnedBadgesData = earnedResponse.data.badges || [];
      
      console.log('[useBadges] Processed data:', { allBadgesData, earnedBadgesData });
      
      setAllBadges(Array.isArray(allBadgesData) ? allBadgesData : []);
      setEarnedBadges(Array.isArray(earnedBadgesData) ? earnedBadgesData : []);
    } catch (err: any) {
      console.error('[useBadges] Error fetching badges:', err);
      setError(err.response?.data?.error || 'Failed to fetch badges');
      
      // Set mock badges as fallback
      console.log('[useBadges] Setting mock badges as fallback');
      setAllBadges([
        { id: 1, name: 'Culture Keeper', description: 'Complete all culture activities', icon_emoji: '🎭', badge_type: 'quest', quest_category: 'culture' },
        { id: 2, name: 'Foodie Explorer', description: 'Try all traditional dishes', icon_emoji: '🍴', badge_type: 'quest', quest_category: 'food' },
        { id: 3, name: 'Futebol Fan', description: 'Complete all sports activities', icon_emoji: '⚽', badge_type: 'quest', quest_category: 'sports' },
        { id: 4, name: 'Social Connector', description: 'Connect with other visitors', icon_emoji: '🤝', badge_type: 'quest', quest_category: 'social' },
        { id: 5, name: 'First Steps', description: 'Complete your first activity', icon_emoji: '👣', badge_type: 'special' },
        { id: 6, name: 'Early Bird', description: 'Visit during opening hour', icon_emoji: '🌅', badge_type: 'special' },
      ]);
      setEarnedBadges([
        { id: 1, name: 'Culture Keeper', description: 'Complete all culture activities', icon_emoji: '🎭', badge_type: 'quest', earned_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
      console.log('[useBadges] Fetch complete');
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const isBadgeEarned = useCallback(
    (badgeId: number) => {
      return earnedBadges.some((badge) => badge.id === badgeId);
    },
    [earnedBadges]
  );

  const getBadgesByType = useCallback(
    (type: 'quest' | 'special') => {
      return allBadges.filter((badge) => badge.badge_type === type);
    },
    [allBadges]
  );

  const getEarnedBadgesByType = useCallback(
    (type: 'quest' | 'special') => {
      return earnedBadges.filter((badge) => badge.badge_type === type);
    },
    [earnedBadges]
  );

  return {
    allBadges: Array.isArray(allBadges) ? allBadges : [],
    earnedBadges: Array.isArray(earnedBadges) ? earnedBadges : [],
    loading,
    error,
    fetchBadges,
    isBadgeEarned,
    getBadgesByType,
    getEarnedBadgesByType,
  };
}

