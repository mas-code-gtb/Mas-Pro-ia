import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaTruck, FaCheck } from 'react-icons/fa';

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    let filtered = purchases;

    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    setFilteredPurchases(filtered);
  }, [searchTerm, statusFilter, purchases]);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/purchases/purchase-orders/', config);
      setPurchases(response.data);
      setFilteredPurchases(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://https://maspro-backend.onrender.com/api/purchases/purchase-orders/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPurchases(purchases.filter(p => p.id !== id));
      toast.success(' Commande supprimée');
      setDeletingId(null);
    } catch (err) {
      toast.error('❌ Erreur lors de la suppression');
      setDeletingId(null);
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
      'received': 'success',
      'cancelled': 'danger'
    };
    const label = {
      'draft': 'Brouillon',
      'sent': 'Envoyé',
      'received': 'Reçu',
      'cancelled': 'Annulé'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  const getPaymentBadge = (status) => {
    const map = {
      'pending': 'warning',
      'paid': 'success',
      'overdue': 'danger'
    };
    const label = {
      'pending': 'En attente',
      'paid': 'Payé',
      'overdue': 'En retard'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaShoppingCart className="text-primary me-2" />
           Commandes d'achat
        </h1>
        <Link to="/add-purchase" className="btn btn-primary">
          <FaPlus className="me-1" /> Nouvelle commande
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
              placeholder="Rechercher par numéro ou fournisseur..."
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
            <option value="sent"> Envoyé</option>
            <option value="received"> Reçu</option>
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
          {filteredPurchases.length} commande{filteredPurchases.length > 1 ? 's' : ''} trouvée{filteredPurchases.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredPurchases.length === 0 ? (
        <div className="alert alert-info">
          {purchases.length === 0 
            ? 'Aucune commande enregistrée.' 
            : 'Aucune commande ne correspond aux filtres sélectionnés.'}
          <Link to="/add-purchase" className="alert-link"> Cliquez ici pour en créer une.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{purchase.order_number}</h5>
                  <p className="card-text text-muted small">
                    <FaTruck className="me-1" /> {purchase.supplier_name}
                  </p>
                  <p className="card-text text-muted small">
                     {new Date(purchase.order_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="card-text fw-bold">
                     {purchase.total} FCFA
                  </p>
                  <div className="d-flex gap-2 mt-2">
                    {getStatusBadge(purchase.status)}
                    {getPaymentBadge(purchase.payment_status)}
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-purchase/${purchase.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(purchase.id)}
                    disabled={deletingId === purchase.id}
                  >
                    {deletingId === purchase.id ? (
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

export default PurchaseList;