import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';  // 👈 AJOUTÉ

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`http://https://maspro-backend.onrender.com/api/projects/${id}/`, config);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        status: response.data.status
      });
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors du chargement du projet');
      toast.error('❌ Erreur lors du chargement du projet');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.put(`http://https://maspro-backend.onrender.com/api/projects/${id}/`, formData, config);
      
      // ✅ Notification de succès
      toast.success('✅ Projet modifié avec succès !');
      
      navigate('/projects');
    } catch (err) {
      console.error('❌ Erreur:', err);
      // ❌ Notification d'erreur
      toast.error('❌ Erreur lors de la modification du projet');
      
      if (err.response && err.response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      } else {
        setError('Erreur lors de la modification du projet');
      }
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border" role="status"></div>
      <p>Chargement du projet...</p>
    </div>
  );

  return (
    <div className="container mt-4">
      <h1>✏️ Modifier le projet</h1>
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

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/projects')}>
          Annuler
        </button>
      </form>
    </div>
  );
};

export default EditProject;