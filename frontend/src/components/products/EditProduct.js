import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBox, FaSave, FaTimes } from 'react-icons/fa';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    category: '',
    description: '',
    unit: 'piece',
    unit_price: '',
    purchase_price: '',
    tax_rate: 18,
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    location: '',
    is_active: true,
    company: ''
  });

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchCompanies();
  }, []);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get(`https://maspro-backend.onrender.com/api/products/products/${id}/`, config);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      navigate('/products');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/products/categories/', config);
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur:', err);
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const dataToSend = {
        name: formData.name,
        reference: formData.reference,
        category: formData.category || null,
        description: formData.description || '',
        unit: formData.unit,
        unit_price: parseFloat(formData.unit_price),
        purchase_price: parseFloat(formData.purchase_price),
        tax_rate: parseFloat(formData.tax_rate) || 0,
        current_stock: parseInt(formData.current_stock) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        max_stock: parseInt(formData.max_stock) || 0,
        location: formData.location || '',
        is_active: formData.is_active,
        company: parseInt(formData.company)
      };

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.put(`https://maspro-backend.onrender.com/api/products/products/${id}/`, dataToSend, config);
      toast.success(' Produit modifié avec succès !');
      navigate('/products');
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
      <h1 className="mb-4"><FaBox className="text-primary me-2" /> Modifier le produit</h1>
      
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
                <label className="form-label">Nom du produit *</label>
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
                <label className="form-label">Référence *</label>
                <input
                  type="text"
                  className="form-control"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="2"
                  value={formData.description || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Unité</label>
                <select
                  className="form-select"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="piece">Pièce</option>
                  <option value="kg">Kilogramme</option>
                  <option value="g">Gramme</option>
                  <option value="l">Litre</option>
                  <option value="ml">Millilitre</option>
                  <option value="m">Mètre</option>
                  <option value="carton">Carton</option>
                  <option value="palette">Palette</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Emplacement</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  placeholder="Étagère A1"
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Prix unitaire (FCFA) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Prix d'achat (FCFA) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">TVA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Stock actuel</label>
                <input
                  type="number"
                  className="form-control"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Stock minimum</label>
                <input
                  type="number"
                  className="form-control"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Stock maximum</label>
                <input
                  type="number"
                  className="form-control"
                  name="max_stock"
                  value={formData.max_stock}
                  onChange={handleChange}
                />
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
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaSave className="me-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;