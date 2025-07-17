import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContexts';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [featured, setFeatured] = useState([]);

  const apiKey = 'daad66ed20794a89bdab432f80652162'; 

  const searchRecipes = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=8&apiKey=${apiKey}`
      );
      const data = await res.json();
      setRecipes(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const fetchFeaturedRecipes = async () => {
    try {
      const res = await fetch(
        `https://api.spoonacular.com/recipes/random?number=6&apiKey=${apiKey}`
      );
      const data = await res.json();
      setFeatured(data.recipes || []);
    } catch (err) {
      console.error('Featured fetch error:', err);
    }
  };

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  if (!user) return <h2 className="please-login">Please login to search recipes</h2>;

  const generateRecipeUrl = (title, id) =>
    `https://spoonacular.com/recipes/${title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')}-${id}`;

  return (
    <div className="home-container">
      <div className="search-section">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Recipes..."
          className="search-input"
        />
        <button onClick={searchRecipes} className="search-button">
          Search
        </button>
      </div>

      {recipes.length > 0 && (
        <>
          <h3 className="section-heading">Search Results</h3>
          <div className="recipes-grid">
            {recipes.map((r) => (
              <a
                key={r.id}
                href={generateRecipeUrl(r.title, r.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="recipe-card-link"
              >
                <div className="recipe-card">
                  <img src={r.image} alt={r.title} />
                  <h4>{r.title}</h4>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      <h3 className="section-heading">Featured Recipes</h3>
      <div className="recipes-grid">
        {featured.map((f) => (
          <a
            key={f.id}
            href={generateRecipeUrl(f.title, f.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="recipe-card-link"
          >
            <div className="recipe-card">
              <img src={f.image} alt={f.title} />
              <h4>{f.title}</h4>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Home;
