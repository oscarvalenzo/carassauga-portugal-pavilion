import { useState, useEffect } from 'react';
import { eventAPI, questAPI, leaderboardAPI } from '../services/api';

interface LiveEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  is_live: boolean;
  viewer_count?: number;
}

interface QuestProgress {
  quest_id: number;
  quest_name: string;
  category: string;
  emoji: string;
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  is_complete: boolean;
  points_earned: number;
}

interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  total_points: number;
  rank: number;
}

interface HomeData {
  liveEvents: LiveEvent[];
  questProgress: QuestProgress[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching Home Screen data
 * Fetches live events, quest progress, and family leaderboard from the API
 */
export const useHomeData = (): HomeData => {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch live events, quest progress, and family leaderboard in parallel
      const [eventsResponse, progressResponse, leaderboardResponse] = await Promise.all([
        eventAPI.getLive(),
        questAPI.getProgress(),
        leaderboardAPI.getFamily(1), // Family ID 1 (Santos Family)
      ]);

      setLiveEvents(eventsResponse.data.events || []);
      setQuestProgress(progressResponse.data.progress || []);
      
      // Ensure leaderboard is always an array
      const leaderboardData = leaderboardResponse.data.leaderboard || [];
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
    } catch (err: any) {
      console.error('Error fetching home data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
      
      // Set mock data as fallback
      setLiveEvents([
        {
          id: 1,
          name: 'Fado Performance',
          description: 'Traditional Portuguese music',
          location: 'Main Stage',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          is_live: true,
          viewer_count: 35,
        },
      ]);
      
      setQuestProgress([
        {
          quest_id: 1,
          quest_name: 'Foodie Explorer',
          category: 'food',
          emoji: '🍴',
          total_activities: 3,
          completed_activities: 2,
          progress_percentage: 66,
          is_complete: false,
          points_earned: 200,
        },
        {
          quest_id: 2,
          quest_name: 'Culture Keeper',
          category: 'culture',
          emoji: '🎭',
          total_activities: 4,
          completed_activities: 4,
          progress_percentage: 100,
          is_complete: true,
          points_earned: 400,
        },
      ]);
      
      setLeaderboard([
        { user_id: 3, display_name: 'Sofia', total_points: 850, rank: 1 },
        { user_id: 1, display_name: 'Maria', total_points: 650, rank: 2 },
        { user_id: 4, display_name: 'Miguel', total_points: 480, rank: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh data every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    liveEvents,
    questProgress,
    leaderboard,
    loading,
    error,
    refetch: fetchData,
  };
};
