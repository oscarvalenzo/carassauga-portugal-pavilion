import { useState, useCallback } from 'react';
import { questAPI } from '../services/api';

interface QuestProgress {
  quest_id: number;
  quest_name: string;
  completed_activities: number;
  total_activities: number;
  points_earned: number;
  completed: boolean;
}

interface CompleteActivityResult {
  success: boolean;
  points_earned: number;
  new_badges?: string[];
  message: string;
}

export function useQuest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeActivity = useCallback(
    async (activityId: number, qrCode: string): Promise<CompleteActivityResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await questAPI.completeActivity(activityId, qrCode);
        setLoading(false);
        return {
          success: true,
          points_earned: response.data.points_earned,
          new_badges: response.data.new_badges,
          message: response.data.message || 'Activity completed!',
        };
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Failed to complete activity';
        setError(errorMessage);
        setLoading(false);
        return {
          success: false,
          points_earned: 0,
          message: errorMessage,
        };
      }
    },
    []
  );

  const getProgress = useCallback(async (): Promise<QuestProgress[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await questAPI.getProgress();
      setLoading(false);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Failed to fetch quest progress';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, []);

  return {
    completeActivity,
    getProgress,
    loading,
    error,
  };
}

