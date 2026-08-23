import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">🚀 Bienvenue sur Mas-Pro AI</h1>
        <p className="lead">
          Application de gestion de projets avec Django + React
        </p>
        <hr className="my-4" />
        <p>
          Cette application permet de gérer vos projets avec une API REST
          développée en Django et une interface utilisateur en React.
        </p>
        <div className="mt-4">
          <Link to="/projects" className="btn btn-primary btn-lg me-2">
            Voir les projets
          </Link>
          <Link to="/add-project" className="btn btn-success btn-lg">
            Ajouter un projet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;