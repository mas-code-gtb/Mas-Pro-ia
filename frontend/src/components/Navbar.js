import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from './notifications/NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
           Mas-Pro AI
        </Link>

        {/* Bouton hamburger - IL DOIT ÊTRE LÀ */}
        <button 
          className="navbar-toggler" 
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/"> Dashboard</Link>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="gestionDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Gestion
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/companies"> Entreprises</Link></li>
                <li><Link className="dropdown-item" to="/users"> Utilisateurs</Link></li>
                <li><Link className="dropdown-item" to="/clients"> Clients</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="stockDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                 Stock
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/products"> Produits</Link></li>
                <li><Link className="dropdown-item" to="/suppliers"> Fournisseurs</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="transactionDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                 Transactions
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/purchases"> Achats</Link></li>
                <li><Link className="dropdown-item" to="/sales"> Ventes</Link></li>
                <li><Link className="dropdown-item" to="/payments"> Paiements</Link></li>
                <li><Link className="dropdown-item" to="/invoices"> Factures</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="financeDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                 Finance
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/accounting"> Comptabilité</Link></li>
                <li><Link className="dropdown-item" to="/reports"> Rapports</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="projetsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                 Projets
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/projects"> Projets</Link></li>
                <li><Link className="dropdown-item" to="/add-project"> Ajouter un projet</Link></li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/ai-assistant"> Assistant IA</Link>
            </li>

            {/* Notification */}
            <li className="nav-item">
              <NotificationBell />
            </li>

            {/* Auth */}
            {!token ? (
              <li className="nav-item">
                <Link className="nav-link" to="/login"> Connexion</Link>
              </li>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-danger btn-sm ms-2" onClick={handleLogout}>
                   Déconnexion
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;