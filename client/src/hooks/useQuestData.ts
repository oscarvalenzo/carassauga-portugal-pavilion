import { useState, useEffect } from 'react';
import { questAPI, activityAPI } from '../services/api';

interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  points: number;
  qr_code: string;
  location?: string;
  is_completed?: boolean;
}

interface Quest {
  quest_id: number;
  quest_name: string;
  category: string;
  emoji: string;
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  is_complete: boolean;
  points_earned: number;
  activities?: Activity[];
}

interface QuestData {
  quests: Quest[];
  totalActivities: number;
  completedActivities: number;
  totalPoints: number;
  completedBadges: number;
  totalBadges: number;
  overallProgress: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching Quest Screen data
 * Fetches all quests and activities progress
 */
export const useQuestData = (): QuestData => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch quest progress and all activities
      const [progressResponse, activitiesResponse] = await Promise.all([
        questAPI.getProgress(),
        activityAPI.getAll(),
      ]);

      const questData = progressResponse.data.progress || [];
      const allActivities = activitiesResponse.data.activities || [];

      // Ensure questData is an array
      if (!Array.isArray(questData)) {
        console.warn('Quest data is not an array:', questData);
        throw new Error('Invalid quest data format');
      }

      // Group activities by category
      const activityMap = new Map<string, Activity[]>();
      if (Array.isArray(allActivities)) {
        allActivities.forEach((activity: Activity) => {
          const category = activity.category;
          if (!activityMap.has(category)) {
            activityMap.set(category, []);
          }
          activityMap.get(category)!.push(activity);
        });
      }

      // Attach activities to quests
      const enrichedQuests = questData.map((quest: Quest) => ({
        ...quest,
        activities: activityMap.get(quest.category.toLowerCase()) || [],
      }));

      setQuests(enrichedQuests);

      // Calculate totals
      const total = questData.reduce((sum: number, q: Quest) => sum + q.total_activities, 0);
      const completed = questData.reduce((sum: number, q: Quest) => sum + q.completed_activities, 0);
      const points = questData.reduce((sum: number, q: Quest) => sum + q.points_earned, 0);

      setTotalActivities(total);
      setCompletedActivities(completed);
      setTotalPoints(points);
    } catch (err: any) {
      console.error('Error fetching quest data:', err);
      setError(err.response?.data?.error || 'Failed to load quests');
      
      // Set mock data as fallback
      const mockQuests: Quest[] = [
        {
          quest_id: 1,
          quest_name: 'Culture Keeper',
          category: 'culture',
          emoji: '🎭',
          total_activities: 3,
          completed_activities: 3,
          progress_percentage: 100,
          is_complete: true,
          points_earned: 300,
          activities: [
            { id: 1, name: 'Watch Fado Performance', description: '', category: 'culture', points: 100, qr_code: 'CARA_ACT_001', is_completed: true },
            { id: 2, name: 'Visit Heritage Display', description: '', category: 'culture', points: 100, qr_code: 'CARA_ACT_002', is_completed: true },
            { id: 3, name: 'Learn Portuguese Phrases', description: '', category: 'culture', points: 100, qr_code: 'CARA_ACT_003', is_completed: true },
          ],
        },
        {
          quest_id: 2,
          quest_name: 'Foodie Explorer',
          category: 'food',
          emoji: '🍴',
          total_activities: 3,
          completed_activities: 2,
          progress_percentage: 66,
          is_complete: false,
          points_earned: 200,
          activities: [
            { id: 4, name: 'Try Pastéis de Nata', description: '', category: 'food', points: 100, qr_code: 'CARA_ACT_004', is_completed: true },
            { id: 5, name: 'Taste Bacalhau à Brás', description: '', category: 'food', points: 100, qr_code: 'CARA_ACT_005', is_completed: true },
            { id: 6, name: 'Sample Port Wine', description: '', category: 'food', points: 100, qr_code: 'CARA_ACT_006', is_completed: false },
          ],
        },
        {
          quest_id: 3,
          quest_name: 'Futebol Fan',
          category: 'sports',
          emoji: '⚽',
          total_activities: 2,
          completed_activities: 1,
          progress_percentage: 50,
          is_complete: false,
          points_earned: 100,
          activities: [
            { id: 7, name: 'Play Panna Game', description: '', category: 'sports', points: 100, qr_code: 'CARA_ACT_007', is_completed: true },
            { id: 8, name: 'Soccer Trivia Challenge', description: '', category: 'sports', points: 100, qr_code: 'CARA_ACT_008', is_completed: false },
          ],
        },
      ];
      
      setQuests(mockQuests);
      setTotalActivities(8);
      setCompletedActivities(6);
      setTotalPoints(600);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completedBadges = quests.filter(q => q.is_complete).length;
  const totalBadges = quests.length;
  const overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  return {
    quests,
    totalActivities,
    completedActivities,
    totalPoints,
    completedBadges,
    totalBadges,
    overallProgress,
    loading,
    error,
    refetch: fetchData,
  };
};

