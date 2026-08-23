import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const AddSale = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([{ product: '', quantity: 1, unit_price: 0, tax_rate: 18 }]);
  const [formData, setFormData] = useState({
    client: '',
    order_number: '',
    delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://127.0.0.1:8000/api/clients/clients/', config);
      setClients(response.data);
    } catch (err) {
      console.error(' Erreur chargement clients:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://127.0.0.1:8000/api/products/products/', config);
      console.log(' Produits chargés:', response.data);
      setProducts(response.data);
    } catch (err) {
      console.error(' Erreur chargement produits:', err);
      toast.error(' Erreur chargement des produits');
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
      console.log(' Produit sélectionné:', product.name, 'Prix:', product.unit_price);
    }
    setLines(newLines);
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

      const validLines = lines.filter(line => line.product && line.product !== '');
      if (validLines.length === 0) {
        toast.error(' Ajoutez au moins un produit');
        setLoading(false);
        return;
      }

      if (!formData.client) {
        toast.error(' Sélectionnez un client');
        setLoading(false);
        return;
      }

      if (!formData.order_number) {
        toast.error(' Remplissez tous les champs obligatoires');
        setLoading(false);
        return;
      }

      const saleData = {
        company: 2,
        client: parseInt(formData.client),
        order_number: formData.order_number,
        delivery_date: formData.delivery_date || null,
        notes: formData.notes || ''
      };

      console.log(' Données vente:', saleData);

      const response = await axios.post('http://127.0.0.1:8000/api/sales/sales-orders/', saleData, config);
      const saleId = response.data.id;
      console.log(' Vente créée, ID:', saleId);

      for (const line of validLines) {
        const lineData = {
          product: parseInt(line.product),
          quantity: parseInt(line.quantity) || 1,
          unit_price: parseFloat(line.unit_price) || 0,
          tax_rate: parseFloat(line.tax_rate) || 0
        };
        
        console.log(' Envoi ligne:', lineData);

        await axios.post(
          `http://127.0.0.1:8000/api/sales/sales-orders/${saleId}/add_line/`,
          lineData,
          config
        );
      }

      toast.success(' Vente créée avec succès !');
      navigate('/sales');
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
      <h1 className="mb-4"><FaMoneyBillWave className="text-success me-2" /> Nouvelle vente</h1>
      
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
                  placeholder="SO-001"
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

            {/* Lignes de commande */}
            <h5 className="mt-4 mb-3"> Produits commandés</h5>
            
            {lines.length === 0 ? (
              <div className="text-center py-3 text-muted border rounded">
                <p>Ajoutez des produits à la commande</p>
              </div>
            ) : (
              lines.map((line, index) => (
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
                      <FaTrash /> Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={addLine}
            >
              <FaPlus className="me-1" /> Ajouter un produit
            </button>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-success" disabled={loading}>
                <FaSave className="me-1" /> {loading ? 'Création...' : 'Créer la vente'}
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

export default AddSale;