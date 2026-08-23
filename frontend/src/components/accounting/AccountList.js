import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChartPie, FaSearch, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(account => account.type === typeFilter);
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, typeFilter, accounts]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/accounting/accounts/', config);
      setAccounts(response.data);
      setFilteredAccounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://https://maspro-backend.onrender.com/api/accounting/accounts/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAccounts(accounts.filter(a => a.id !== id));
      toast.success(' Compte supprimé');
      setDeletingId(null);
    } catch (err) {
      toast.error(' Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  const getTypeBadge = (type) => {
    const map = {
      'asset': 'info',
      'liability': 'warning',
      'equity': 'success',
      'income': 'primary',
      'expense': 'danger'
    };
    const label = {
      'asset': 'Actif',
      'liability': 'Passif',
      'equity': 'Capitaux propres',
      'income': 'Produits',
      'expense': 'Charges'
    };
    return <span className={`badge bg-${map[type] || 'secondary'}`}>{label[type] || type}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement du plan comptable...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaChartPie className="text-primary me-2" />
           Plan comptable
        </h1>
        <Link to="/add-account" className="btn btn-primary">
          <FaPlus className="me-1" /> Ajouter un compte
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text"><FaSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par code ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all"> Tous les types</option>
            <option value="asset"> Actif</option>
            <option value="liability"> Passif</option>
            <option value="equity"> Capitaux propres</option>
            <option value="income"> Produits</option>
            <option value="expense"> Charges</option>
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
          {filteredAccounts.length} compte{filteredAccounts.length > 1 ? 's' : ''} trouvé{filteredAccounts.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredAccounts.length === 0 ? (
        <div className="alert alert-info">
          {accounts.length === 0 
            ? 'Aucun compte comptable.' 
            : 'Aucun compte ne correspond aux filtres.'}
        </div>
      ) : (
        <div className="row">
          {filteredAccounts.map((account) => (
            <div key={account.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">
                      <span className="text-primary">{account.code}</span>
                    </h5>
                    {getTypeBadge(account.type)}
                  </div>
                  <p className="card-text">{account.name}</p>
                  <small className="text-muted">
                    {account.parent ? `Parent: ${account.parent}` : 'Compte principal'}
                  </small>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-account/${account.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                  >
                    {deletingId === account.id ? (
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

export default AccountList;