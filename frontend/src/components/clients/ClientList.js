import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUser, FaBuilding } from 'react-icons/fa';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(client => client.type === typeFilter);
    }

    setFilteredClients(filtered);
  }, [searchTerm, typeFilter, clients]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/clients/clients/', config);
      setClients(response.data);
      setFilteredClients(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur de chargement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`https://maspro-backend.onrender.com/api/clients/clients/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClients(clients.filter(c => c.id !== id));
      toast.success(' Client supprimé');
      setDeletingId(null);
    } catch (err) {
      toast.error('❌ Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  const getTypeBadge = (type) => {
    const map = {
      'individual': 'info',
      'company': 'primary',
      'non_profit': 'success'
    };
    const label = {
      'individual': 'Particulier',
      'company': 'Entreprise',
      'non_profit': 'Association'
    };
    return <span className={`badge bg-${map[type] || 'secondary'}`}>{label[type] || type}</span>;
  };

  const getStatusBadge = (status) => {
    const map = {
      'active': 'success',
      'inactive': 'secondary',
      'lead': 'warning'
    };
    const label = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'lead': 'Prospect'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{label[status] || status}</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des clients...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaUsers className="text-primary me-2" />
           Clients (CRM)
        </h1>
        <Link to="/add-client" className="btn btn-primary">
          <FaPlus className="me-1" /> Ajouter un client
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
              placeholder="Rechercher par nom ou email..."
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
            <option value="individual"> Particulier</option>
            <option value="company"> Entreprise</option>
            <option value="non_profit"> Association</option>
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
          {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredClients.length === 0 ? (
        <div className="alert alert-info">
          {clients.length === 0 
            ? 'Aucun client enregistré.' 
            : 'Aucun client ne correspond aux filtres sélectionnés.'}
          <Link to="/add-client" className="alert-link"> Cliquez ici pour en ajouter un.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredClients.map((client) => (
            <div key={client.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    {client.type === 'individual' ? (
                      <FaUser className="text-primary me-2" size={20} />
                    ) : (
                      <FaBuilding className="text-primary me-2" size={20} />
                    )}
                    <h5 className="card-title mb-0">{client.name}</h5>
                  </div>
                  <p className="card-text text-muted small">{client.email}</p>
                  <p className="card-text text-muted small">{client.phone}</p>
                  <p className="card-text text-muted small">{client.city}, {client.country}</p>
                  <div className="d-flex gap-2 mt-2">
                    {getTypeBadge(client.type)}
                    {getStatusBadge(client.status)}
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-client/${client.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(client.id)}
                    disabled={deletingId === client.id}
                  >
                    {deletingId === client.id ? (
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

export default ClientList;