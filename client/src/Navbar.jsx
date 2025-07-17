import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContexts';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="navbar">
      <h1>🍲 FoodRecipe</h1>
      <div>
        {user ? (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;