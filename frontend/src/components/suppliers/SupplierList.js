import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBuilding, FaUser } from 'react-icons/fa';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    setFilteredSuppliers(filtered);
  }, [searchTerm, statusFilter, suppliers]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/suppliers/suppliers/', config);
      setSuppliers(response.data);
      setFilteredSuppliers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`https://maspro-backend.onrender.com/api/suppliers/suppliers/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast.success(' Fournisseur supprimé');
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

  const getTypeBadge = (type) => {
    const map = {
      'individual': 'info',
      'company': 'primary',
      'cooperative': 'success'
    };
    const label = {
      'individual': 'Particulier',
      'company': 'Entreprise',
      'cooperative': 'Coopérative'
    };
    return <span className={`badge bg-${map[type] || 'secondary'}`}>{label[type] || type}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des fournisseurs...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaTruck className="text-primary me-2" />
           Fournisseurs
        </h1>
        <Link to="/add-supplier" className="btn btn-primary">
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
              placeholder="Rechercher par nom, email ou contact..."
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
            <option value="inactive">Inactif</option>
            <option value="suspended"> Suspendu</option>
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
          {filteredSuppliers.length} fournisseur{filteredSuppliers.length > 1 ? 's' : ''} trouvé{filteredSuppliers.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="alert alert-info">
          {suppliers.length === 0 
            ? 'Aucun fournisseur enregistré.' 
            : 'Aucun fournisseur ne correspond aux filtres sélectionnés.'}
          <Link to="/add-supplier" className="alert-link"> Cliquez ici pour en ajouter un.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    {supplier.type === 'individual' ? (
                      <FaUser className="text-primary me-2" size={20} />
                    ) : (
                      <FaBuilding className="text-primary me-2" size={20} />
                    )}
                    <h5 className="card-title mb-0">{supplier.name}</h5>
                  </div>
                  <p className="card-text text-muted small">{supplier.email}</p>
                  <p className="card-text text-muted small">{supplier.phone}</p>
                  <p className="card-text text-muted small">
                    <strong>Contact:</strong> {supplier.contact_person}
                  </p>
                  <div className="d-flex gap-2 mt-2">
                    {getTypeBadge(supplier.type)}
                    {getStatusBadge(supplier.status)}
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-supplier/${supplier.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(supplier.id)}
                    disabled={deletingId === supplier.id}
                  >
                    {deletingId === supplier.id ? (
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

export default SupplierList;