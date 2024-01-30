import React from 'react';
import { Link } from 'react-router-dom';
import logo from './imagenes/logoH.jpeg';

function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <img src={logo} alt="Logo" style={{ width: '175px', marginRight: '10px', height: 'auto' }} />
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/pizzas">Pizzas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/ingredientes">Ingredientes</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
