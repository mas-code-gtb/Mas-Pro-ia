import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(' Tentative de connexion avec:', formData.username);
      
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: formData.username,
        password: formData.password
      });
      
      console.log(' Réponse reçue:', response.data);
      
      toast.success(' Connexion réussie !');
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Configurer le header pour toutes les requêtes futures
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Rediriger vers la liste des projets
      navigate('/');
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      
      // Afficher plus de détails sur l'erreur
      if (err.response) {
        console.error(' Réponse du serveur:', err.response.data);
        console.error(' Status:', err.response.status);
        setError(`Erreur ${err.response.status}: ${err.response.data.detail || 'Identifiants incorrects'}`);
      } else if (err.request) {
        console.error(' Pas de réponse du serveur');
        setError('Impossible de contacter le serveur. Vérifie que Django est lancé sur le port 8000.');
      } else {
        setError('Erreur de connexion: ' + err.message);
      }
      
      toast.error('❌ Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header bg-gradient-primary text-white p-4 border-0 text-center">
              <h3 className="mb-0"> Connexion</h3>
              <small className="opacity-75">Mas-Pro AI</small>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nom d'utilisateur</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder=""
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="small text-muted mb-0">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="fw-bold text-primary">
                    S'inscrire
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  );
};

export default Login;