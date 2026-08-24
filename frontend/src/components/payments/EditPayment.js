import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCreditCard, FaSave, FaTimes } from 'react-icons/fa';

const EditPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    invoice: '',
    payment_method: '',
    payment_type: 'incoming',
    reference: '',
    amount: '',
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchPayment();
    fetchClients();
    fetchInvoices();
    fetchPaymentMethods();
  }, []);

  const fetchPayment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get(`https://maspro-backend.onrender.com/api/payments/payments/${id}/`, config);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      navigate('/payments');
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

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/sales/invoices/', config);
      setInvoices(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/payments/methods/', config);
      setPaymentMethods(response.data);
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

      const paymentData = {
        company: 2,
        client: parseInt(formData.client) || null,
        invoice: parseInt(formData.invoice) || null,
        payment_method: parseInt(formData.payment_method) || null,
        payment_type: formData.payment_type,
        reference: formData.reference,
        amount: parseFloat(formData.amount),
        notes: formData.notes || '',
        status: formData.status
      };

      console.log(' Données modification:', paymentData);

      await axios.put(`https://maspro-backend.onrender.com/api/payments/payments/${id}/`, paymentData, config);

      toast.success(' Paiement modifié avec succès !');
      navigate('/payments');
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
      <h1 className="mb-4"><FaCreditCard className="text-primary me-2" /> Modifier le paiement</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Type de paiement *</label>
                <select
                  className="form-select"
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="incoming">Entrant (réception)</option>
                  <option value="outgoing">Sortant (paiement)</option>
                </select>
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
                <label className="form-label">Client</label>
                <select
                  className="form-select"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Facture associée</label>
                <select
                  className="form-select"
                  name="invoice"
                  value={formData.invoice}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner une facture</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.total} FCFA
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Mode de paiement</label>
                <select
                  className="form-select"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un mode</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Montant (FCFA) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="amount"
                  value={formData.amount}
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
                  <option value="pending">En attente</option>
                  <option value="completed">Complété</option>
                  <option value="failed">Échoué</option>
                  <option value="cancelled">Annulé</option>
                </select>
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

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaSave className="me-1" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/payments')}>
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPayment;