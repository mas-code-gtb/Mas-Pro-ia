import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const EditPurchase = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [formData, setFormData] = useState({
    supplier: '',
    order_number: '',
    expected_delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPurchase();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchPurchase = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get(`http://127.0.0.1:8000/api/purchases/purchase-orders/${id}/`, config);
      setFormData({
        supplier: response.data.supplier,
        order_number: response.data.order_number,
        expected_delivery_date: response.data.expected_delivery_date,
        notes: response.data.notes || ''
      });
      
      // Récupérer les lignes
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
      navigate('/purchases');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://127.0.0.1:8000/api/suppliers/suppliers/', config);
      setSuppliers(response.data);
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
      const response = await axios.get('http://127.0.0.1:8000/api/products/products/', config);
      console.log(' Produits chargés:', response.data);
      setProducts(response.data);
    } catch (err) {
      console.error(' Erreur chargement produits:', err);
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
      newLines[index].unit_price = parseFloat(product.purchase_price) || 0;
      console.log(' Produit sélectionné:', product.name, 'Prix:', product.purchase_price);
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

      // Vérifier les champs obligatoires
      if (!formData.supplier) {
        toast.error(' Sélectionnez un fournisseur');
        setSaving(false);
        return;
      }

      if (!formData.order_number || !formData.expected_delivery_date) {
        toast.error(' Remplissez tous les champs obligatoires');
        setSaving(false);
        return;
      }

      //  AJOUT DE company: 2
      const purchaseData = {
        company: 2,
        supplier: parseInt(formData.supplier),
        order_number: formData.order_number,
        expected_delivery_date: formData.expected_delivery_date,
        notes: formData.notes || ''
      };

      console.log(' Données modification:', purchaseData);

      await axios.put(`http://127.0.0.1:8000/api/purchases/purchase-orders/${id}/`, purchaseData, config);

      toast.success(' Commande modifiée avec succès !');
      navigate('/purchases');
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
      <h1 className="mb-4"><FaShoppingCart className="text-primary me-2" /> Modifier la commande</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Fournisseur *</label>
                <select
                  className="form-select"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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
                <label className="form-label">Date de livraison prévue *</label>
                <input
                  type="date"
                  className="form-control"
                  name="expected_delivery_date"
                  value={formData.expected_delivery_date}
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
                          {p.name} ({p.reference}) - {p.purchase_price} FCFA
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
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaSave className="me-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/purchases')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPurchase;