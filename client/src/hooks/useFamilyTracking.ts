import { useState, useEffect } from 'react';
import { familyTrackingService, FamilyMember } from '../services/firebase';

export function useFamilyTracking(familyGroupId?: number) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyGroupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Subscribe to real-time location updates
      const unsubscribe = familyTrackingService.subscribeToFamilyLocations(
        familyGroupId,
        (members) => {
          setFamilyMembers(members);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error subscribing to family locations:', err);
      setError('Failed to load family locations');
      setLoading(false);
    }
  }, [familyGroupId]);

  const updateMyLocation = async (location: {
    x: number;
    y: number;
    zone?: string;
  }) => {
    try {
      // In real app, get user ID from auth
      const userId = 1; // Mock user ID
      await familyTrackingService.updateLocation(userId, location);
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  return {
    familyMembers,
    loading,
    error,
    updateMyLocation,
  };
}

