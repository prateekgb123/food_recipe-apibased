import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContexts';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  const searchRecipes = async () => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`https://food-recipe-apibased.onrender.com/api/search?query=${query}`);
      const data = await res.json();
      setRecipes(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const fetchFeaturedRecipes = async () => {
    setLoadingFeatured(true);
    try {
      const res = await fetch('https://food-recipe-apibased.onrender.com/api/featured');
      const data = await res.json();
      setFeatured(data.recipes || []);
    } catch (err) {
      console.error('Featured fetch error:', err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  const generateRecipeUrl = (title, id) =>
    `https://spoonacular.com/recipes/${title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')}-${id}`;

  return (
    <div className="home-container">
      <h1 className="welcome-title">🍽️ Welcome to Food Recipe Finder!</h1>
      <p className="welcome-text">Discover amazing recipes. Login to start searching your favorite dishes.</p>

      {!user ? (
        <h2 className="please-login">🔒 Please login to search recipes</h2>
      ) : (
        <>
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

          {loadingSearch ? (
            <p className="loading-message">Loading search results...</p>
          ) : recipes.length > 0 ? (
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
          ) : null}
        </>
      )}

      <h3 className="section-heading">Featured Recipes</h3>
      {loadingFeatured ? (
        <p className="loading-message">Loading featured recipes...</p>
      ) : (
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
      )}
    </div>
  );
};

export default Home;
