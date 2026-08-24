import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaSave, FaTimes } from 'react-icons/fa';

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    type: 'individual',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sénégal',
    status: 'active'
  });

  useEffect(() => {
    fetchClient();
    fetchCompanies();
  }, []);

  const fetchClient = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get(`https://maspro-backend.onrender.com/api/clients/clients/${id}/`, config);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur de chargement');
      navigate('/clients');
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/companies/companies/', config);
      setCompanies(response.data);
    } catch (err) {
      console.error('Erreur:', err);
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

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('❌ Veuillez vous reconnecter');
        navigate('/login');
        setSaving(false);
        return;
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const dataToSend = {
        company: parseInt(formData.company) || null,
        type: formData.type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || '',
        city: formData.city,
        country: formData.country,
        status: formData.status
      };

      console.log('📤 Données modification:', dataToSend);

      await axios.put(`https://maspro-backend.onrender.com/api/clients/clients/${id}/`, dataToSend, config);

      toast.success(' Client modifié avec succès !');
      navigate('/clients');
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      if (err.response) {
        console.error(' Réponse du serveur:', err.response.data);
        toast.error(`❌ Erreur: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error('❌ Erreur lors de la modification');
      }
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4"><FaUsers className="text-primary me-2" /> Modifier le client</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Type de client *</label>
                <select
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="individual">Particulier</option>
                  <option value="company">Entreprise</option>
                  <option value="non_profit">Association / ONG</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Entreprise associée</label>
                <select
                  className="form-select"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                >
                  <option value="">Aucune</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Nom/Prenom *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Téléphone *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Adresse</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Ville *</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Pays *</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="lead">Prospect</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaSave className="me-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;