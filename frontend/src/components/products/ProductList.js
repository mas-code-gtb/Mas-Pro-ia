import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaWarehouse } from 'react-icons/fa';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === parseInt(categoryFilter));
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/products/products/', config);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(' Erreur de chargement');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('https://maspro-backend.onrender.com/api/products/categories/', config);
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`https://maspro-backend.onrender.com/api/products/products/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
      toast.success(' Produit supprimé');
      setDeletingId(null);
    } catch (err) {
      toast.error('❌ Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <span className="badge bg-success">Actif</span> : 
      <span className="badge bg-secondary">Inactif</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaBox className="text-primary me-2" />
           Produits
        </h1>
        <div className="d-flex gap-2">
          <Link to="/add-product" className="btn btn-primary">
            <FaPlus className="me-1" /> Ajouter
          </Link>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="row mb-4">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text"><FaSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all"> Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
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
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </small>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="alert alert-info">
          {products.length === 0 
            ? 'Aucun produit enregistré.' 
            : 'Aucun produit ne correspond aux filtres sélectionnés.'}
          <Link to="/add-product" className="alert-link"> Cliquez ici pour en ajouter un.</Link>
        </div>
      ) : (
        <div className="row">
          {filteredProducts.map((product) => (
            <div key={product.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">{product.name}</h5>
                    {getStatusBadge(product.is_active)}
                  </div>
                  <p className="card-text text-muted small">
                    <strong>Réf :</strong> {product.reference}
                  </p>
                  <p className="card-text text-muted small">
                    <strong>Catégorie :</strong> {product.category_name || 'Non catégorisé'}
                  </p>
                  <div className="d-flex justify-content-between mt-2">
                    <span className="badge bg-info">
                      <FaWarehouse className="me-1" /> Stock: {product.current_stock}
                    </span>
                    <span className="badge bg-success">
                       {product.unit_price} FCFA
                    </span>
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/edit-product/${product.id}`} className="btn btn-warning btn-sm flex-grow-1">
                    <FaEdit className="me-1" /> Modifier
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? (
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

export default ProductList;