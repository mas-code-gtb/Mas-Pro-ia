import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filtrer les entreprises quand searchTerm ou statusFilter change
  useEffect(() => {
    let filtered = companies;

    // Filtre par recherche (nom, email, ville)
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, statusFilter, companies]);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/companies/companies/', config);
      setCompanies(response.data);
      setFilteredCompanies(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://https://maspro-backend.onrender.com/api/companies/companies/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCompanies(companies.filter(c => c.id !== id));
      toast.success(' Entreprise supprimée');
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
      'active': 'success',
      'inactive': 'secondary',
      'suspended': 'danger'
    };
    const label = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des entreprises...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaBuilding className="text-primary me-2" />
           Entreprises
        </h1>
        <Link to="/add-company" className="btn btn-primary">
          <FaPlus className="me-1" /> Ajouter
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
              placeholder="Rechercher par nom, email ou ville..."
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
            <option value="active"> Actif</option>
            <option value="inactive"> Inactif</option>
            <option value="suspended"> Suspendu</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
            <FaTimes className="me-1" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Nombre de résultats */}
      <div className="mb-3">
        <small className="text-muted">
          {filteredCompanies.length} entreprise{filteredCompanies.length > 1 ? 's' : ''} trouvée{filteredCompanies.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="alert alert-info">
          {companies.length === 0 
            ? 'Aucune entreprise enregistrée.' 
            : 'Aucune entreprise ne correspond aux filtres sélectionnés.'}
          <Link to="/add-company" className="alert-link"> Cliquez ici pour en ajouter une.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{company.name}</h5>
                  <p className="card-text text-muted small">{company.email}</p>
                  <p className="card-text text-muted small">{company.phone}</p>
                  <p className="card-text text-muted small">{company.city}, {company.country}</p>
                  <div>{getStatusBadge(company.status)}</div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-company/${company.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(company.id)}
                    disabled={deletingId === company.id}
                  >
                    {deletingId === company.id ? (
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

export default CompanyList;