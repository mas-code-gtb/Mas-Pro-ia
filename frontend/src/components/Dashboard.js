import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaUserFriends, 
  FaBox, 
  FaTruck, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaChartLine,
  FaRobot
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    clients: 0,
    products: 0,
    suppliers: 0,
    purchases: 0,
    sales: 0,
    invoices: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      let stats = {
        companies: 0,
        users: 0,
        clients: 0,
        products: 0,
        suppliers: 0,
        purchases: 0,
        sales: 0,
        invoices: 0,
      };

      // Fonction helper pour les appels API avec gestion des erreurs 403
      const fetchData = async (url) => {
        try {
          const response = await axios.get(url, config);
          return response.data;
        } catch (err) {
          if (err.response?.status === 403) {
            console.warn(` Accès refusé à ${url} - L'utilisateur n'a pas les droits`);
            return [];
          }
          console.warn(` Erreur sur ${url}:`, err.response?.status);
          return [];
        }
      };

      // Charger les données avec gestion des 403
      const [
        companiesData,
        usersData,
        clientsData,
        productsData,
        suppliersData,
        purchasesData,
        salesData,
        invoicesData
      ] = await Promise.all([
        fetchData('http://https://maspro-backend.onrender.com/api/companies/companies/'),
        fetchData('http://https://maspro-backend.onrender.com/api/users/users/'),
        fetchData('http://https://maspro-backend.onrender.com/api/clients/clients/'),
        fetchData('http://https://maspro-backend.onrender.com/api/products/products/'),
        fetchData('http://https://maspro-backend.onrender.com/api/suppliers/suppliers/'),
        fetchData('http://https://maspro-backend.onrender.com/api/purchases/purchase-orders/'),
        // ⭐ CORRECTION : sales-orders → salesorders (sans tiret)
        fetchData('http://https://maspro-backend.onrender.com/api/sales/salesorders/'),
        fetchData('http://https://maspro-backend.onrender.com/api/sales/invoices/'),
      ]);

      stats.companies = companiesData?.length || 0;
      stats.users = usersData?.length || 0;
      stats.clients = clientsData?.length || 0;
      stats.products = productsData?.length || 0;
      stats.suppliers = suppliersData?.length || 0;
      stats.purchases = purchasesData?.length || 0;
      stats.sales = salesData?.length || 0;
      stats.invoices = invoicesData?.length || 0;

      setStats(stats);

      // Données pour les graphiques (simulées)
      setSalesData([
        { name: 'Lun', ventes: 4000, achats: 2400 },
        { name: 'Mar', ventes: 3000, achats: 1398 },
        { name: 'Mer', ventes: 2000, achats: 9800 },
        { name: 'Jeu', ventes: 2780, achats: 3908 },
        { name: 'Ven', ventes: 1890, achats: 4800 },
        { name: 'Sam', ventes: 2390, achats: 3800 },
        { name: 'Dim', ventes: 3490, achats: 4300 },
      ]);

      // Activités récentes (simulées)
      setRecentActivities([
        { id: 1, action: 'Nouveau client ajouté', user: 'massamba', time: 'Il y a 2 min', icon: '' },
        { id: 2, action: 'Commande créée #PO-001', user: 'massamba', time: 'Il y a 15 min', icon: '' },
        { id: 3, action: 'Facture générée #INV-001', user: 'massamba', time: 'Il y a 1h', icon: '' },
        { id: 4, action: 'Nouveau produit ajouté', user: 'massamba', time: 'Il y a 2h', icon: '' },
        { id: 5, action: 'Paiement reçu de Client A', user: 'massamba', time: 'Il y a 3h', icon: '' },
      ]);

      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur globale:', err);
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Carte de statistique
  const StatCard = ({ icon, title, value, color, link }) => (
    <div className="col-md-3 col-sm-6 mb-3">
      <div className={`card h-100 shadow-sm border-0`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1">{title}</h6>
              <h3 className="mb-0">{value}</h3>
            </div>
            <div className={`rounded-circle p-3 bg-${color} bg-opacity-10`}>
              {icon}
            </div>
          </div>
          <Link to={link} className="stretched-link"></Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h5>❌ {error}</h5>
          <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">  Tableau de bord</h1>
        <span className="text-muted">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <StatCard 
          icon={<FaBuilding size={24} className="text-primary" />}
          title="Entreprises" 
          value={stats.companies} 
          color="primary"
          link="/companies"
        />
        <StatCard 
          icon={<FaUsers size={24} className="text-success" />}
          title="Utilisateurs" 
          value={stats.users} 
          color="success"
          link="/users"
        />
        <StatCard 
          icon={<FaUserFriends size={24} className="text-info" />}
          title="Clients" 
          value={stats.clients} 
          color="info"
          link="/clients"
        />
        <StatCard 
          icon={<FaBox size={24} className="text-warning" />}
          title="Produits" 
          value={stats.products} 
          color="warning"
          link="/products"
        />
        <StatCard 
          icon={<FaTruck size={24} className="text-danger" />}
          title="Fournisseurs" 
          value={stats.suppliers} 
          color="danger"
          link="/suppliers"
        />
        <StatCard 
          icon={<FaShoppingCart size={24} className="text-secondary" />}
          title="Commandes" 
          value={stats.purchases} 
          color="secondary"
          link="/purchases"
        />
        <StatCard 
          icon={<FaMoneyBillWave size={24} className="text-success" />}
          title="Ventes" 
          value={stats.sales} 
          color="success"
          link="/sales"
        />
        <StatCard 
          icon={<FaChartLine size={24} className="text-primary" />}
          title="Factures" 
          value={stats.invoices} 
          color="primary"
          link="/invoices"
        />
      </div>

      {/* Graphiques */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0"> 📈 Ventes vs Achats (7 jours)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventes" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="achats" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">  Répartition</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Clients', value: stats.clients || 1 },
                      { name: 'Produits', value: stats.products || 1 },
                      { name: 'Fournisseurs', value: stats.suppliers || 1 },
                      { name: 'Commandes', value: stats.purchases || 1 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {[
                      { name: 'Clients', value: stats.clients || 1 },
                      { name: 'Produits', value: stats.products || 1 },
                      { name: 'Fournisseurs', value: stats.suppliers || 1 },
                      { name: 'Commandes', value: stats.purchases || 1 },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">  Activités récentes</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                    <div className="me-3">
                      <span className="fs-4">{activity.icon}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold">{activity.action}</div>
                      <div className="text-muted small">
                        {activity.user} • {activity.time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">  Assistant IA</h5>
            </div>
            <div className="card-body text-center">
              <FaRobot size={48} className="text-primary mb-3" />
              <h5>Bienvenue sur Mas-Pro AI</h5>
              <p className="text-muted">
                Posez vos questions en français, anglais ou wolof
              </p>
              <Link to="/ai-assistant" className="btn btn-primary">
                 Parler à l'IA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;