import { Share2, ChevronRight, Award, Bookmark, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useBadges } from '../hooks/useBadges';
import { useUserStore } from '../stores/userStore';
import RecipeModal from '../components/RecipeModal';
import type { Recipe } from '../hooks/useRecipes';

interface ProfileScreenProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onLogout: () => void;
}

export default function ProfileScreen({ showToast, onLogout }: ProfileScreenProps) {
  const { user } = useUserStore();
  const { savedRecipes, loading: recipesLoading, saveRecipe, unsaveRecipe, isRecipeSaved } = useRecipes();
  const { allBadges, earnedBadges, loading: badgesLoading, isBadgeEarned } = useBadges();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Ensure arrays are always arrays
  const safeAllBadges = Array.isArray(allBadges) ? allBadges : [];
  const safeEarnedBadges = Array.isArray(earnedBadges) ? earnedBadges : [];
  const safeSavedRecipes = Array.isArray(savedRecipes) ? savedRecipes : [];

  // Debug logging
  console.log('ProfileScreen - badgesLoading:', badgesLoading);
  console.log('ProfileScreen - safeAllBadges:', safeAllBadges);
  console.log('ProfileScreen - safeEarnedBadges:', safeEarnedBadges);
  console.log('ProfileScreen - user:', user);

  const handleSaveToggle = async () => {
    if (!selectedRecipe) return;

    if (isRecipeSaved(selectedRecipe.name)) {
      // Unsave
      if (selectedRecipe.savedId) {
        const success = await unsaveRecipe(selectedRecipe.savedId);
        if (success) {
          showToast('Recipe removed from saved list', 'info');
        } else {
          showToast('Failed to remove recipe', 'error');
        }
      }
    } else {
      // Save
      const success = await saveRecipe(selectedRecipe.name);
      if (success) {
        showToast('✅ Recipe saved!', 'success');
      } else {
        showToast('Failed to save recipe', 'error');
      }
    }
  };

  const handleShare = () => {
    if (selectedRecipe) {
      showToast(`📤 Sharing ${selectedRecipe.name}...`, 'info');
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    return user.display_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate completion percentage for passport
  const passportCompletion = safeEarnedBadges.length;
  const totalBadges = safeAllBadges.length || 12;

  return (
    <div className="animate-fadeIn bg-background min-h-full font-sf-text text-primary-dark">
      {/* Profile Header - Apple Style */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 py-20 text-center relative overflow-hidden">
        <div className="relative inline-block mb-5">
          <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-xl text-white flex items-center justify-center font-sf-display text-sf-3xl font-bold border-4 border-white/30 shadow-lg">
            {getUserInitials()}
          </div>
          <button 
            onClick={() => showToast('Profile editing coming soon!', 'info')}
            className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full flex items-center justify-center text-sf-lg shadow-lg hover:scale-110 active:scale-105 transition-transform"
            aria-label="Edit profile"
          >
            ✏️
          </button>
        </div>
        <h2 className="font-sf-display text-sf-4xl font-bold mb-3 tracking-sf-tighter">
          {user?.display_name || 'User'}
        </h2>
        <p className="font-sf-text text-sf-base opacity-90 flex items-center justify-center gap-2 font-medium tracking-tight">
          <Award size={18} strokeWidth={2} />
          <span>Level {user?.level || 1} • {user?.total_points || 0} pts</span>
        </p>
      </div>

      {/* Badges Section */}
      <div className="px-6 py-10 bg-background">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sf-display text-sf-2xl font-bold tracking-tight text-primary-dark">
            Earned Badges
          </h3>
          <span className="font-sf-text text-sf-sm font-semibold text-secondary">
            {safeEarnedBadges.length} / {safeAllBadges.length}
          </span>
        </div>

        {badgesLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 animate-pulse">
                <div className="w-12 h-12 bg-secondary/10 rounded-full mx-auto mb-3" />
                <div className="h-3 bg-secondary/10 rounded w-full" />
              </div>
            ))}
          </div>
        ) : safeAllBadges.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {safeAllBadges.slice(0, 12).map((badge) => {
              const earned = isBadgeEarned(badge.id);
              const emoji = badge.icon_emoji || '🏅';
              
              return (
                <button
                  key={badge.id}
                  onClick={() => earned && showToast(`${badge.name}: ${badge.description}`, 'success')}
                  className={`bg-white rounded-3xl p-5 text-center transition-all ${
                    earned 
                      ? 'border-2 border-primary hover:shadow-md cursor-pointer hover:scale-105 active:scale-100' 
                      : 'border border-secondary/20 opacity-40'
                  }`}
                >
                  <div className="text-4xl mb-3">{emoji}</div>
                  <span className="font-sf-text text-sf-xs font-bold block text-primary-dark tracking-tight">
                    {badge.name}
                  </span>
                  {earned && (
                    <div className="mt-3 w-full h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-secondary/10 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="font-sf-text text-sf-base text-secondary font-medium tracking-tight">
              No badges yet - start your adventure!
            </p>
          </div>
        )}
      </div>

      {/* Digital Passport */}
      <div className="px-6 py-10 bg-white">
        <h3 className="font-sf-display text-sf-2xl font-bold tracking-tight mb-6 text-primary-dark">
          Your Digital Passport
        </h3>
        <div className="bg-white border border-secondary/10 rounded-3xl p-8 shadow-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🇵🇹</div>
            <h4 className="font-sf-display text-sf-2xl font-bold mb-2 tracking-tight text-primary-dark">
              Portuguese Journey
            </h4>
            <p className="font-sf-text text-sf-sm text-secondary font-medium tracking-tight">
              Carassauga 2025
            </p>
            <p className="font-sf-text text-sf-xs text-secondary font-semibold tracking-tight mt-2">
              {passportCompletion} / {totalBadges} experiences completed
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[...Array(Math.min(passportCompletion, 8))].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-md"
              >
                ✓
              </div>
            ))}
            {[...Array(Math.max(0, 8 - passportCompletion))].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-secondary/5 text-secondary/30 rounded-2xl flex items-center justify-center text-3xl font-bold"
              >
                —
              </div>
            ))}
          </div>
          <button 
            onClick={() => showToast('Passport shared to social media!', 'success')}
            className="w-full border-2 border-primary-dark text-primary-dark px-6 py-4 rounded-full font-sf-text font-bold text-sf-sm flex items-center justify-center gap-2 hover:bg-primary-dark hover:text-white active:scale-95 transition-all tracking-tight"
          >
            <Share2 size={18} strokeWidth={2.5} />
            Share Your Journey
          </button>
        </div>
      </div>

      {/* Settings & Logout Section */}
      <div className="px-6 py-6 bg-background mb-6">
        <div className="bg-white border border-secondary/10 rounded-3xl overflow-hidden shadow-sm">
          {/* Settings */}
          <button
            onClick={() => showToast('Settings coming soon!', 'info')}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Settings size={18} className="text-primary-dark" strokeWidth={2} />
              </div>
              <span className="font-sf-text font-bold text-sf-base text-primary-dark tracking-tight">Settings</span>
            </div>
            <ChevronRight size={20} className="text-secondary" strokeWidth={2} />
          </button>
          
          {/* Divider */}
          <div className="h-px bg-secondary/10" />
          
          {/* Logout */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                onLogout();
              }
            }}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut size={18} className="text-red-600" strokeWidth={2} />
              </div>
              <span className="font-sf-text font-bold text-sf-base text-red-600 tracking-tight">Logout</span>
            </div>
            <ChevronRight size={20} className="text-red-400" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Saved Recipes */}
      <div className="px-6 py-10 bg-background mb-10">
        <h3 className="font-sf-display text-sf-2xl font-bold tracking-tight mb-6 text-primary-dark">
          Saved Recipes
        </h3>
        
        {recipesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-secondary/10 rounded-3xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl" />
                <div className="flex-1">
                  <div className="h-5 bg-secondary/10 rounded w-32 mb-2" />
                  <div className="h-4 bg-secondary/10 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : safeSavedRecipes.length > 0 ? (
          <div className="space-y-3">
            {safeSavedRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full bg-white border border-secondary/10 rounded-3xl p-4 flex items-center gap-4 hover:shadow-md transition-all text-left"
              >
                <img 
                  src={recipe.image} 
                  alt={recipe.name} 
                  className="w-16 h-16 object-cover rounded-2xl shadow-sm" 
                />
                <div className="flex-1 min-w-0">
                  <span className="block font-sf-text font-bold text-sf-base mb-1 text-primary-dark tracking-tight">{recipe.name}</span>
                  <span className="block font-sf-text text-sf-sm text-secondary font-medium tracking-tight">{recipe.category} • {recipe.difficulty}</span>
                </div>
                <ChevronRight size={20} className="text-secondary flex-shrink-0" strokeWidth={2} />
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-secondary/10 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">📖</div>
            <p className="font-sf-text text-sf-base text-secondary font-medium tracking-tight mb-2">No saved recipes yet</p>
            <p className="font-sf-text text-sf-sm text-secondary/70 tracking-tight">
              Complete food activities to discover and save authentic Portuguese recipes!
            </p>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isSaved={isRecipeSaved(selectedRecipe.name)}
          onClose={() => setSelectedRecipe(null)}
          onSave={handleSaveToggle}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
