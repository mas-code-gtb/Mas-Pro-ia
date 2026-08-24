import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    invoice_number: '',
    due_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchInvoice();
    fetchClients();
    fetchProducts();
  }, []);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get(`https://maspro-backend.onrender.com/api/sales/invoices/${id}/`, config);
      setFormData({
        client: response.data.client,
        invoice_number: response.data.invoice_number,
        due_date: response.data.due_date,
        notes: response.data.notes || ''
      });
      
      if (response.data.lines) {
        setLines(response.data.lines.map(line => ({
          product: line.product,
          quantity: line.quantity,
          unit_price: line.unit_price,
          tax_rate: line.tax_rate
        })));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      navigate('/invoices');
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
      console.error('Erreur:', err);
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
      console.error('Erreur:', err);
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
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error(' Veuillez vous reconnecter');
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
        toast.error(' Sélectionnez un client');
        setSaving(false);
        return;
      }

      if (!formData.invoice_number || !formData.due_date) {
        toast.error(' Remplissez tous les champs obligatoires');
        setSaving(false);
        return;
      }

      const invoiceData = {
        company: 1,,
        client: parseInt(formData.client),
        invoice_number: formData.invoice_number,
        due_date: formData.due_date,
        notes: formData.notes || ''
      };

      console.log(' Données modification:', invoiceData);

      await axios.put(`https://maspro-backend.onrender.com/api/sales/invoices/${id}/`, invoiceData, config);

      toast.success(' Facture modifiée avec succès !');
      navigate('/invoices');
    } catch (err) {
      console.error(' Erreur détaillée:', err);
      if (err.response) {
        console.error(' Réponse du serveur:', err.response.data);
        toast.error(` Erreur: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error(' Erreur lors de la modification');
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
      <h1 className="mb-4"><FaFileInvoice className="text-danger me-2" /> Modifier la facture</h1>
      
      <div className="card shadow-sm border-danger">
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
                <label className="form-label">Numéro de facture *</label>
                <input
                  type="text"
                  className="form-control"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Date d'échéance *</label>
                <input
                  type="date"
                  className="form-control"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
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

            <h5 className="mt-4 mb-3"> Produits</h5>
            
            {lines.map((line, index) => (
              <div key={index} className="row border p-3 mb-2 rounded align-items-end">
                <div className="col-md-4">
                  <label className="form-label small">Produit</label>
                  <select
                    className="form-select form-select-sm"
                    value={line.product}
                    onChange={(e) => selectProduct(index, e.target.value)}
                  >
                    <option value="">Sélectionner</option>
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
            ))}

            <button
              type="button"
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={addLine}
            >
              <FaPlus className="me-1" /> Ajouter un produit
            </button>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-danger" disabled={saving}>
                <FaSave className="me-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;