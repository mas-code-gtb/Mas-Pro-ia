import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaChartLine, FaChartBar, FaChartPie, FaDownload, FaCalendar } from 'react-icons/fa';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const [salesRes, productRes, clientRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/analytics/analytics/sales_overview/', config),
        axios.get('http://127.0.0.1:8000/api/analytics/analytics/product_performance/', config),
        axios.get('http://127.0.0.1:8000/api/analytics/analytics/client_analysis/', config),
      ]);

      setSalesData(salesRes.data);
      setProductData(productRes.data);
      setClientData(clientRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur de chargement');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p>Chargement des rapports...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0"><FaChartLine className="text-primary me-2" /> Rapports d'analyse</h1>
        <button className="btn btn-success" onClick={() => window.print()}>
          <FaDownload className="me-1" /> Exporter PDF
        </button>
      </div>

      {/* Vue d'ensemble des ventes */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">📊 Vue d'ensemble des ventes</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 text-center">
              <div className="border rounded p-3">
                <h6 className="text-muted">Total des ventes</h6>
                <h2 className="text-success">
                  {salesData?.summary?.total_sales?.toFixed(2)} €
                </h2>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <div className="border rounded p-3">
                <h6 className="text-muted">Nombre de commandes</h6>
                <h2 className="text-primary">{salesData?.summary?.total_orders || 0}</h2>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <div className="border rounded p-3">
                <h6 className="text-muted">Panier moyen</h6>
                <h2 className="text-info">
                  {salesData?.summary?.average_order?.toFixed(2) || 0} €
                </h2>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <div className="border rounded p-3">
                <h6 className="text-muted">Période</h6>
                <h6 className="text-muted">
                  {salesData?.period?.start} - {salesData?.period?.end}
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top produits */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0"> Top produits</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produit</th>
                  <th>Référence</th>
                  <th>Quantité vendue</th>
                  <th>Chiffre d'affaires</th>
                </tr>
              </thead>
              <tbody>
                {productData?.products?.map((product, index) => (
                  <tr key={product.product__id}>
                    <td>{index + 1}</td>
                    <td>{product.product__name}</td>
                    <td>{product.product__reference}</td>
                    <td>{product.total_quantity}</td>
                    <td>{product.total_revenue?.toFixed(2)} €</td>
                  </tr>
                ))}
                {(!productData?.products || productData.products.length === 0) && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analyse clients */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0"> Analyse clients</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6 text-center">
              <div className="border rounded p-3">
                <h6 className="text-muted">Total clients</h6>
                <h2 className="text-primary">{clientData?.total_clients || 0}</h2>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <div className="border rounded p-3">
                <h6 className="text-muted">Clients actifs (90 jours)</h6>
                <h2 className="text-success">{clientData?.active_clients || 0}</h2>
              </div>
            </div>
          </div>
          
          <h6 className="mt-3">Top clients</h6>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Commandes</th>
                  <th>Dépenses</th>
                </tr>
              </thead>
              <tbody>
                {clientData?.top_clients?.map((client, index) => (
                  <tr key={client.client__id}>
                    <td>{index + 1}</td>
                    <td>{client.client__name}</td>
                    <td>{client.total_orders}</td>
                    <td>{client.total_spent?.toFixed(2)} €</td>
                  </tr>
                ))}
                {(!clientData?.top_clients || clientData.top_clients.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;