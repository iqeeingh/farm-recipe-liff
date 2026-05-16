import { useState } from "react";
import { Recipe } from "../types";

interface RecipeDetailPageProps {
  recipe: Recipe;
  onBack: () => void;
  onProductClick: (recipe: Recipe) => void;
}

const FALLBACK_IMAGE_SRC = "/recipe-placeholder.png";

export function RecipeDetailPage({ recipe, onBack, onProductClick }: RecipeDetailPageProps) {
  const initialImageSrc = recipe.imageUrl.trim() || FALLBACK_IMAGE_SRC;
  const [imageSrc, setImageSrc] = useState(initialImageSrc);

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE_SRC) {
      setImageSrc(FALLBACK_IMAGE_SRC);
    }
  };

  return (
    <main className="app-shell">
      <button type="button" className="back-button" onClick={onBack}>
        返回列表
      </button>

      <article className="detail-shell">
        <img className="detail-image" src={imageSrc} alt={recipe.recipeName} onError={handleImageError} />

        <div className="detail-header">
          <div className="recipe-card-tags">
            {recipe.method.map((item) => (
              <span key={item} className="recipe-tag">
                {item}
              </span>
            ))}
          </div>
          <h1>{recipe.recipeName}</h1>
          <p className="recipe-product">{recipe.productName}</p>
          <p className="detail-intro">{recipe.intro}</p>
        </div>

        <section className="detail-panel">
          <h2>食材</h2>
          <ul>
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section className="detail-panel">
          <h2>步驟</h2>
          <ol>
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="detail-panel">
          <h2>料理提醒</h2>
          <ul>
            {recipe.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <button type="button" className="purchase-button" onClick={() => onProductClick(recipe)}>
          前往購買商品
        </button>
      </article>
    </main>
  );
}
