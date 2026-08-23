import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    setFilteredSales(filtered);
  }, [searchTerm, statusFilter, sales]);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      // ⭐ CORRECTION : sales-orders → salesorders (sans tiret)
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/sales/salesorders/', config);
      setSales(response.data);
      setFilteredSales(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur de chargement des ventes');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      // ⭐ CORRECTION : sales-orders → salesorders (sans tiret)
      await axios.delete(`http://https://maspro-backend.onrender.com/api/sales/salesorders/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSales(sales.filter(s => s.id !== id));
      toast.success('✅ Vente supprimée avec succès');
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
      'confirmed': 'info',
      'shipped': 'warning',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    const label = {
      'draft': 'Brouillon',
      'confirmed': 'Confirmé',
      'shipped': 'Expédié',
      'delivered': 'Livré',
      'cancelled': 'Annulé'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  const getPaymentBadge = (status) => {
    const map = {
      'pending': 'warning',
      'paid': 'success',
      'partial': 'info',
      'overdue': 'danger'
    };
    const label = {
      'pending': 'En attente',
      'paid': 'Payé',
      'partial': 'Partiel',
      'overdue': 'En retard'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des ventes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaMoneyBillWave className="text-success me-2" />
           Ventes
        </h1>
        <Link to="/add-sale" className="btn btn-success">
          <FaPlus className="me-1" /> Nouvelle vente
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
            <option value="all">  Tous les statuts</option>
            <option value="draft">  Brouillon</option>
            <option value="confirmed">  Confirmé</option>
            <option value="shipped">  Expédié</option>
            <option value="delivered">  Livré</option>
            <option value="cancelled">  Annulé</option>
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
          {filteredSales.length} vente{filteredSales.length > 1 ? 's' : ''} trouvée{filteredSales.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredSales.length === 0 ? (
        <div className="alert alert-info">
          {sales.length === 0 
            ? ' Aucune vente enregistrée.' 
            : ' Aucune vente ne correspond aux filtres sélectionnés.'}
          <Link to="/add-sale" className="alert-link"> Cliquez ici pour en créer une.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{sale.order_number}</h5>
                  <p className="card-text text-muted small">
                     {sale.client_name}
                  </p>
                  <p className="card-text text-muted small">
                     {new Date(sale.order_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="card-text fw-bold text-success">
                     {sale.total} FCFA
                  </p>
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {getStatusBadge(sale.status)}
                    {getPaymentBadge(sale.payment_status)}
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-sale/${sale.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(sale.id)}
                    disabled={deletingId === sale.id}
                  >
                    {deletingId === sale.id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <><FaTrash className="me-1" /> Supprimer</>
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

export default SalesList;