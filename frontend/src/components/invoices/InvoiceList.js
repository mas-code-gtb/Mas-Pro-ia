import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaDownload, FaEnvelope } from 'react-icons/fa';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/sales/invoices/', config);
      setInvoices(response.data);
      setFilteredInvoices(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`https://maspro-backend.onrender.com/api/sales/invoices/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvoices(invoices.filter(i => i.id !== id));
      toast.success(' Facture supprimée');
      setDeletingId(null);
    } catch (err) {
      toast.error(' Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  const sendEmail = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      await axios.post(`https://maspro-backend.onrender.com/api/sales/invoices/${id}/send_email/`, {}, config);
      toast.success(' Email envoyé avec succès !');
    } catch (err) {
      toast.error(' Erreur lors de l\'envoi de l\'email');
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const getStatusBadge = (status) => {
    const map = {
      'draft': 'secondary',
      'sent': 'info',
      'paid': 'success',
      'overdue': 'danger',
      'cancelled': 'dark'
    };
    const label = {
      'draft': 'Brouillon',
      'sent': 'Envoyée',
      'paid': 'Payée',
      'overdue': 'En retard',
      'cancelled': 'Annulée'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des factures...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaFileInvoice className="text-danger me-2" />
           Factures
        </h1>
        <Link to="/add-invoice" className="btn btn-danger">
          <FaPlus className="me-1" /> Nouvelle facture
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="row mb-4">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text"><FaSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all"> Tous les statuts</option>
            <option value="draft"> Brouillon</option>
            <option value="sent"> Envoyée</option>
            <option value="paid"> Payée</option>
            <option value="overdue"> En retard</option>
            <option value="cancelled"> Annulée</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
            <FaTimes className="me-1" /> Réinitialiser
          </button>
        </div>
      </div>

      <div className="mb-3">
        <small className="text-muted">
          {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} trouvée{filteredInvoices.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="alert alert-info">
          {invoices.length === 0 
            ? 'Aucune facture enregistrée.' 
            : 'Aucune facture ne correspond aux filtres sélectionnés.'}
          <Link to="/add-invoice" className="alert-link"> Cliquez ici pour en créer une.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm border-danger">
                <div className="card-body">
                  <h5 className="card-title">{invoice.invoice_number}</h5>
                  <p className="card-text text-muted small">
                     {invoice.client_name}
                  </p>
                  <p className="card-text text-muted small">
                     {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="card-text fw-bold text-danger">
                    💰 {invoice.total} FCFA
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <a 
                    href={`https://maspro-backend.onrender.com/api/sales/invoice/${invoice.id}/pdf/`}
                    target="_blank"
                    className="btn btn-success btn-sm flex-grow-1"
                    rel="noopener noreferrer"
                  >
                    <FaDownload className="me-1" /> PDF
                  </a>
                  <button 
                    className="btn btn-info btn-sm flex-grow-1"
                    onClick={() => sendEmail(invoice.id)}
                  >
                    <FaEnvelope className="me-1" /> Email
                  </button>
                  <Link to={`/edit-invoice/${invoice.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(invoice.id)}
                    disabled={deletingId === invoice.id}
                  >
                    {deletingId === invoice.id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <><FaTrash /> Supprimer</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceList;