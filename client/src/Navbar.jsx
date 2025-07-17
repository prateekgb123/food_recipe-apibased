import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContexts';
import './Navbar.css'; 
import logo from './food.png'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="logo" className="logo-img" />
        <h1>FoodRecipe</h1>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="welcome-msg">Welcome, {user.username}</span>
            <button className="btn logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn nav-btn1" to="/login">Login</Link>
            <Link className="btn nav-btn2" to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
