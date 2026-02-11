import { X, Clock, ChefHat, BookmarkPlus, BookmarkCheck, Share2 } from 'lucide-react';
import { Recipe } from '../hooks/useRecipes';

interface RecipeModalProps {
  recipe: Recipe;
  isSaved: boolean;
  onClose: () => void;
  onSave: () => void;
  onShare: () => void;
}

export default function RecipeModal({ recipe, isSaved, onClose, onSave, onShare }: RecipeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-background max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-slideUp">
        {/* Header Image */}
        <div className="relative h-64">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-lg"
            aria-label="Close"
          >
            <X size={20} className="text-white" strokeWidth={2.5} />
          </button>

          {/* Recipe Title */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="font-sf-display text-sf-3xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
              {recipe.name}
            </h2>
            <div className="flex items-center gap-4 font-sf-text text-sf-sm text-white/90 font-medium">
              <span>{recipe.category}</span>
              <span>•</span>
              <span>{recipe.difficulty}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} strokeWidth={2} />
                <span>{recipe.prepTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="font-sf-text text-sf-base text-secondary mb-6 leading-relaxed tracking-tight">
            {recipe.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={onSave}
              className={`flex-1 ${
                isSaved
                  ? 'bg-primary text-primary-dark'
                  : 'bg-primary-dark text-white'
              } px-6 py-4 rounded-full font-sf-text font-bold text-sf-sm hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 tracking-tight`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={18} strokeWidth={2.5} />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <BookmarkPlus size={18} strokeWidth={2.5} />
                  <span>Save Recipe</span>
                </>
              )}
            </button>
            <button
              onClick={onShare}
              className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 active:scale-95 transition-all"
              aria-label="Share"
            >
              <Share2 size={20} strokeWidth={2} className="text-primary-dark" />
            </button>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat size={20} className="text-primary-dark" strokeWidth={2} />
              <h3 className="font-sf-display text-sf-xl font-bold tracking-tight">Ingredients</h3>
            </div>
            <div className="bg-white border border-secondary/10 rounded-2xl p-5">
              <ul className="space-y-2.5">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="font-sf-text text-sf-sm text-primary-dark flex items-start gap-3 tracking-tight"
                  >
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="flex-1">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-sf-display text-sf-xl font-bold mb-4 tracking-tight">Instructions</h3>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-primary-dark rounded-full flex items-center justify-center font-sf-text text-sf-sm font-bold flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <p className="font-sf-text text-sf-sm text-primary-dark leading-relaxed tracking-tight flex-1 pt-1">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="font-sf-text text-sf-xs text-secondary text-center tracking-tight">
              🇵🇹 Traditional Portuguese recipe from the Carassauga Festival
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

