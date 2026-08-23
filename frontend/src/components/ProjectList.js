import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/projects/', config);
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des projets');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://https://maspro-backend.onrender.com/api/projects/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p.id !== id));
      toast.success(' Projet supprimé !');
      setDeletingId(null);
    } catch (err) {
      toast.error('❌ Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  //  FILTRAGE DES PROJETS (recherche + statut)
  const filteredProjects = projects.filter(project => {
    // Filtre par recherche (nom)
    const matchSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Filtre par statut
    const matchStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': 'secondary',
      'in_progress': 'warning',
      'completed': 'success',
      'archived': 'danger'
    };
    const labelMap = {
      'draft': 'Brouillon',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'archived': 'Archivé'
    };
    return <span className={`badge bg-${statusMap[status]}`}>{labelMap[status]}</span>;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border" role="status"></div>
      <p>Chargement des projets...</p>
    </div>
  );
  
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1> Liste des projets</h1>
        <Link to="/add-project" className="btn btn-primary">+ Ajouter un projet</Link>
      </div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="row mb-4">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => {
              console.log('Recherche:', e.target.value); //  Debug
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all"> Tous les statuts</option>
            <option value="draft"> Brouillon</option>
            <option value="in_progress"> En cours</option>
            <option value="completed"> Terminé</option>
            <option value="archived"> Archivé</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
             Réinitialiser
          </button>
        </div>
      </div>

      {/* AFFICHAGE DU NOMBRE DE RÉSULTATS */}
      <div className="mb-3">
        <small className="text-muted">
          {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="alert alert-info">
          {projects.length === 0 
            ? 'Aucun projet pour le moment.' 
            : 'Aucun projet ne correspond aux filtres sélectionnés.'}
        </div>
      ) : (
        <div className="row">
          {filteredProjects.map((project) => (
            <div key={project.id} className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{project.name}</h5>
                  <p className="card-text">{project.description || 'Aucune description'}</p>
                  <div className="mb-2">{getStatusBadge(project.status)}</div>
                  <small className="text-muted">
                    Créé par: {project.created_by} <br />
                    {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </small>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-project/${project.id}`} className="btn btn-warning btn-sm flex-grow-1">
                     Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1" 
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      ' Supprimer'
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

export default ProjectList;