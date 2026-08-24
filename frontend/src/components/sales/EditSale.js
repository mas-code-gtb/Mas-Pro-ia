import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const EditSale = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    order_number: '',
    delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchSale();
    fetchClients();
    fetchProducts();
  }, [id]);

  // ⭐ Récupérer la vente - URL CORRIGÉE
  const fetchSale = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      // ⭐ CORRECTION : sales-orders → salesorders (sans tiret)
      const response = await axios.get(`https://maspro-backend.onrender.com/api/sales/salesorders/${id}/`, config);
      setFormData({
        client: response.data.client,
        order_number: response.data.order_number,
        delivery_date: response.data.delivery_date || '',
        notes: response.data.notes || ''
      });
      
      if (response.data.lines) {
        setLines(response.data.lines.map(line => ({
          product: line.product,
          quantity: line.quantity,
          unit_price: line.unit_price,
          tax_rate: line.tax_rate || 18
        })));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur de chargement de la vente');
      navigate('/sales');
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/clients/clients/', config);
      setClients(response.data);
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/products/products/', config);
      setProducts(response.data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addLine = () => {
    setLines([...lines, { product: '', quantity: 1, unit_price: 0, tax_rate: 18 }]);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const selectProduct = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    const newLines = [...lines];
    newLines[index].product = productId;
    if (product) {
      newLines[index].unit_price = parseFloat(product.unit_price) || 0;
    }
    setLines(newLines);
  };

  // ⭐ Enregistrer les modifications - URL CORRIGÉE
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

      if (!formData.client) {
        toast.error('❌ Sélectionnez un client');
        setSaving(false);
        return;
      }

      if (!formData.order_number) {
        toast.error('❌ Remplissez tous les champs obligatoires');
        setSaving(false);
        return;
      }

      const saleData = {
        company: 1,,
        client: parseInt(formData.client),
        order_number: formData.order_number,
        delivery_date: formData.delivery_date || null,
        notes: formData.notes || ''
      };

      console.log(' Données modification:', saleData);

      // ⭐ CORRECTION : sales-orders → salesorders (sans tiret)
      await axios.put(`https://maspro-backend.onrender.com/api/sales/salesorders/${id}/`, saleData, config);

      toast.success('✅ Vente modifiée avec succès !');
      navigate('/sales');
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
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        <FaMoneyBillWave className="text-success me-2" /> 
        ✏️ Modifier la vente
      </h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Client *</label>
                <select
                  className="form-select"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Numéro de commande *</label>
                <input
                  type="text"
                  className="form-control"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Date de livraison</label>
                <input
                  type="date"
                  className="form-control"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h5 className="mt-4 mb-3">📦 Produits commandés</h5>
            
            {lines.map((line, index) => (
              <div key={index} className="row border p-3 mb-2 rounded align-items-end">
                <div className="col-md-4">
                  <label className="form-label small">Produit</label>
                  <select
                    className="form-select form-select-sm"
                    value={line.product}
                    onChange={(e) => selectProduct(index, e.target.value)}
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.reference}) - {p.unit_price} FCFA
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Quantité</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Prix unitaire</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-sm"
                    value={line.unit_price}
                    onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">TVA %</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-sm"
                    value={line.tax_rate}
                    onChange={(e) => updateLine(index, 'tax_rate', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => removeLine(index)}
                  >
                    <FaTrash className="me-1" /> Supprimer
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={addLine}
            >
              <FaPlus className="me-1" /> Ajouter un produit
            </button>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-success" disabled={saving}>
                <FaSave className="me-1" /> 
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/sales')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSale;