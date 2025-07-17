import { useContext, useState } from 'react';
import { AuthContext } from './AuthContexts';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  const searchRecipes = async () => {
    const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=daad66ed20794a89bdab432f80652162`);
    const data = await res.json();
    setRecipes(data.results);
  };

  if (!user) return <h2>Please login to search recipes</h2>;

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Recipes..." />
      <button onClick={searchRecipes}>Search</button>
      <div>
        {recipes.map((r) => (
          <div key={r.id}>
            <h4>{r.title}</h4>
            <img src={r.image} width="100" alt={r.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
