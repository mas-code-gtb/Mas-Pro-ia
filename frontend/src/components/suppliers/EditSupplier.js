import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaSave, FaTimes } from 'react-icons/fa';

const EditSupplier = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    type: 'company',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sénégal',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSupplier();
    fetchCompanies();
  }, []);

  const fetchSupplier = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get(`https://maspro-backend.onrender.com/api/suppliers/suppliers/${id}/`, config);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      navigate('/suppliers');
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
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.put(`https://maspro-backend.onrender.com/api/suppliers/suppliers/${id}/`, formData, config);
      toast.success(' Fournisseur modifié avec succès !');
      navigate('/suppliers');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur lors de la modification');
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
      <h1 className="mb-4"><FaTruck className="text-primary me-2" /> Modifier le fournisseur</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Entreprise *</label>
                <select
                  className="form-select"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="individual">Particulier</option>
                  <option value="company">Entreprise</option>
                  <option value="cooperative">Coopérative</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Nom du fournisseur *</label>
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
                <label className="form-label">Personne de contact *</label>
                <input
                  type="text"
                  className="form-control"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Téléphone du contact *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email du contact *</label>
                <input
                  type="email"
                  className="form-control"
                  name="contact_email"
                  value={formData.contact_email}
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
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaSave className="me-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/suppliers')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSupplier;