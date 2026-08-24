import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';  // 👈 AJOUTÉ

const AddProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const token = localStorage.getItem('access_token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.post('https://maspro-backend.onrender.com/api/projects/', formData, config);
      
      // ✅ Notification de succès
      toast.success('✅ Projet créé avec succès !');
      
      navigate('/projects');
    } catch (err) {
      console.error('❌ Erreur:', err);
      // ❌ Notification d'erreur
      toast.error('❌ Erreur lors de la création du projet');
      
      if (err.response && err.response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      } else {
        setError('Erreur lors de la création du projet');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>➕ Ajouter un projet</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Nom du projet *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Statut</label>
          <select
            className="form-select"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Brouillon</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="archived">Archivé</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer le projet'}
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/projects')}>
          Annuler
        </button>
      </form>
    </div>
  );
};

export default AddProject;