import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChartPie, FaSave, FaTimes } from 'react-icons/fa';

const AddAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parentAccounts, setParentAccounts] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    parent: '',
    is_active: true
  });

  useEffect(() => {
    fetchParentAccounts();
  }, []);

  const fetchParentAccounts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/accounting/accounts/', config);
      setParentAccounts(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error(' Veuillez vous reconnecter');
        navigate('/login');
        setLoading(false);
        return;
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const accountData = {
        company: 1,
        code: formData.code,
        name: formData.name,
        type: formData.type,
        parent: formData.parent || null,
        is_active: formData.is_active
      };

      console.log(' Données compte:', accountData);

      await axios.post('https://maspro-backend.onrender.com/api/accounting/accounts/', accountData, config);

      toast.success(' Compte créé avec succès !');
      navigate('/accounting');
    } catch (err) {
      console.error(' Erreur détaillée:', err);
      if (err.response) {
        console.error(' Réponse du serveur:', err.response.data);
        toast.error(` Erreur: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error(' Erreur lors de la création');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4"><FaChartPie className="text-primary me-2" /> Ajouter un compte comptable</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Code du compte *</label>
                <input
                  type="text"
                  className="form-control"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="401"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Nom du compte *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Fournisseurs"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Type de compte *</label>
                <select
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="asset"> Actif</option>
                  <option value="liability"> Passif</option>
                  <option value="equity"> Capitaux propres</option>
                  <option value="income"> Produits</option>
                  <option value="expense"> Charges</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Compte parent</label>
                <select
                  className="form-select"
                  name="parent"
                  value={formData.parent}
                  onChange={handleChange}
                >
                  <option value="">Aucun (compte principal)</option>
                  {parentAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Actif</label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSave className="me-1" /> {loading ? 'Création...' : 'Créer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/accounting')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;