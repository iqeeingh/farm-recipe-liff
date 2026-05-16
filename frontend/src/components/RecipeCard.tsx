import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const imageAlt = recipe.recipeName || recipe.productName || "食譜圖片";

  return (
    <button
      type="button"
      className="recipe-card"
      onClick={() => onClick(recipe)}
      aria-label={`查看 ${recipe.recipeName}`}
    >
      <img className="recipe-card-image" src={recipe.imageUrl} alt={imageAlt} />
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
