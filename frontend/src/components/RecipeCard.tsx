import { useState } from "react";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

const FALLBACK_IMAGE_SRC = "/recipe-placeholder.png";

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const imageAlt = recipe.recipeName || "食譜圖片";
  const initialImageSrc = recipe.imageUrl.trim() || FALLBACK_IMAGE_SRC;
  const [imageSrc, setImageSrc] = useState(initialImageSrc);

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE_SRC) {
      setImageSrc(FALLBACK_IMAGE_SRC);
    }
  };

  return (
    <button
      type="button"
      className="recipe-card"
      onClick={() => onClick(recipe)}
      aria-label={`查看 ${recipe.recipeName}`}
    >
      <img className="recipe-card-image" src={imageSrc} alt={imageAlt} onError={handleImageError} />
      <div className="recipe-card-body">
        <div className="recipe-card-tags">
          {recipe.method.map((item) => (
            <span key={item} className="recipe-tag">
              {item}
            </span>
          ))}
        </div>
        <h2>{recipe.recipeName}</h2>
        <p className="recipe-product">{recipe.productName}</p>
        <p className="recipe-intro">{recipe.intro}</p>
      </div>
    </button>
  );
}
