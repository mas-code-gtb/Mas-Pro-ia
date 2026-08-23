import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBuilding, FaSave, FaTimes } from 'react-icons/fa';

const AddCompany = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sénégal',
    website: '',
    status: 'active'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.post('http://https://maspro-backend.onrender.com/api/companies/companies/', formData, config);
      toast.success(' Entreprise créée avec succès !');
      navigate('/companies');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur lors de la création');
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4"><FaBuilding className="text-primary me-2" /> Ajouter une entreprise</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nom de l'entreprise *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Numéro d'enregistrement *</label>
                <input
                  type="text"
                  className="form-control"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  placeholder="REG-001"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@entreprise.com"
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
                  placeholder="+221 77 000 0000"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Adresse</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adresse"
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
                  placeholder="Dakar"
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
                  placeholder="Sénégal"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Site web</label>
                <input
                  type="url"
                  className="form-control"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.entreprise.com"
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSave className="me-1" /> {loading ? 'Création...' : 'Créer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/companies')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCompany;