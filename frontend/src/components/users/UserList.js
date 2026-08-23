import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaUser, FaEnvelope, FaCalendar, FaSearch, FaTimes } from 'react-icons/fa';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/users/users/', config);
      console.log(' Utilisateurs chargés:', response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      if (err.response && err.response.status === 401) {
        toast.error(' Session expirée. Reconnectez-vous.');
        window.location.href = '/login';
      } else {
        toast.error(' Erreur de chargement');
      }
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaUsers className="text-primary me-2" />
          👥 Utilisateurs
        </h1>
        <span className="badge bg-primary fs-6">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Barre de recherche */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text"><FaSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" onClick={resetFilters}>
              <FaTimes className="me-1" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <small className="text-muted">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="alert alert-info">
          {users.length === 0 
            ? 'Aucun utilisateur enregistré.' 
            : 'Aucun utilisateur ne correspond à la recherche.'}
        </div>
      ) : (
        <div className="row">
          {filteredUsers.map((user) => (
            <div key={user.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle p-3 text-white me-3">
                      <FaUser size={20} />
                    </div>
                    <div>
                      <h5 className="card-title mb-0">
                        {user.first_name || user.username}
                        {user.last_name && ` ${user.last_name}`}
                      </h5>
                      <span className="text-muted small">@{user.username}</span>
                    </div>
                  </div>
                  <p className="card-text">
                    <FaEnvelope className="me-2 text-muted" />
                    {user.email}
                  </p>
                  <p className="card-text">
                    <FaCalendar className="me-2 text-muted" />
                    {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-2">
                    {user.is_superuser ? (
                      <span className="badge bg-danger">Administrateur</span>
                    ) : user.is_staff ? (
                      <span className="badge bg-warning text-dark">Staff</span>
                    ) : (
                      <span className="badge bg-secondary">Utilisateur</span>
                    )}
                    {user.is_active ? (
                      <span className="badge bg-success ms-1">Actif</span>
                    ) : (
                      <span className="badge bg-danger ms-1">Inactif</span>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <small className="text-muted">
                    ID: {user.id}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;