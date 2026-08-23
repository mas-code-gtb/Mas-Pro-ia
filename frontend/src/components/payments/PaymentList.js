import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCreditCard, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, payments]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/payments/payments/', config);
      setPayments(response.data);
      setFilteredPayments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://https://maspro-backend.onrender.com/api/payments/payments/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPayments(payments.filter(p => p.id !== id));
      toast.success(' Paiement supprimé');
      setDeletingId(null);
    } catch (err) {
      toast.error(' Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const getStatusBadge = (status) => {
    const map = {
      'pending': 'warning',
      'completed': 'success',
      'failed': 'danger',
      'cancelled': 'secondary'
    };
    const label = {
      'pending': 'En attente',
      'completed': 'Complété',
      'failed': 'Échoué',
      'cancelled': 'Annulé'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  const getTypeBadge = (type) => {
    const map = {
      'incoming': 'success',
      'outgoing': 'danger'
    };
    const label = {
      'incoming': 'Entrant',
      'outgoing': 'Sortant'
    };
    return <span className={`badge bg-${map[type] || 'secondary'}`}>{label[type] || type}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des paiements...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaCreditCard className="text-primary me-2" />
           Paiements
        </h1>
        <Link to="/add-payment" className="btn btn-primary">
          <FaPlus className="me-1" /> Nouveau paiement
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
              placeholder="Rechercher par référence ou client..."
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
            <option value="pending"> En attente</option>
            <option value="completed"> Complété</option>
            <option value="failed">❌ Échoué</option>
            <option value="cancelled"> Annulé</option>
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
          {filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''} trouvé{filteredPayments.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="alert alert-info">
          {payments.length === 0 
            ? 'Aucun paiement enregistré.' 
            : 'Aucun paiement ne correspond aux filtres sélectionnés.'}
          <Link to="/add-payment" className="alert-link"> Cliquez ici pour en créer un.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">{payment.reference}</h5>
                    {getStatusBadge(payment.status)}
                  </div>
                  <p className="card-text text-muted small">
                     {payment.client_name || 'N/A'}
                  </p>
                  <p className="card-text text-muted small">
                     {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="card-text fw-bold text-success">
                     {payment.amount} FCFA
                  </p>
                  <div className="d-flex gap-2 mt-2">
                    {getTypeBadge(payment.payment_type)}
                    <span className="badge bg-info">{payment.payment_method_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-payment/${payment.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(payment.id)}
                    disabled={deletingId === payment.id}
                  >
                    {deletingId === payment.id ? (
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

export default PaymentList;