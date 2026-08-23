import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProjectList from './components/ProjectList';
import AddProject from './components/AddProject';
import EditProject from './components/EditProject';
import Login from './components/Login';
import AIAssistant from './components/AIAssistant';
import Dashboard from './components/Dashboard';
import CompanyList from './components/companies/CompanyList';
import AddCompany from './components/companies/AddCompany';
import EditCompany from './components/companies/EditCompany';
import ClientList from './components/clients/ClientList';
import AddClient from './components/clients/AddClient';
import ProductList from './components/products/ProductList';
import AddProduct from './components/products/AddProduct';
import EditProduct from './components/products/EditProduct';
import SupplierList from './components/suppliers/SupplierList';
import AddSupplier from './components/suppliers/AddSupplier';
import EditClient from './components/clients/EditClient';
import EditSupplier from './components/suppliers/EditSupplier';
import Reports from './components/analytics/Reports';
import PurchaseList from './components/purchases/PurchaseList';
import AddPurchase from './components/purchases/AddPurchase';
import EditPurchase from './components/purchases/EditPurchase';
import SalesList from './components/sales/SalesList';
import AddSale from './components/sales/AddSale';
import EditSale from './components/sales/EditSale'; // ⭐ AJOUTÉ
import UserList from './components/users/UserList';
import AccountList from './components/accounting/AccountList';
import AddAccount from './components/accounting/AddAccount';
import EditAccount from './components/accounting/EditAccount';
import InvoiceList from './components/invoices/InvoiceList';
import PaymentList from './components/payments/PaymentList';
import AddPayment from './components/payments/AddPayment';
import EditPayment from './components/payments/EditPayment';
import EditInvoice from './components/invoices/EditInvoice';
import AddInvoice from './components/invoices/AddInvoice';
import Register from './components/Register';

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/edit-project/:id" element={<EditProject />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/add-company" element={<AddCompany />} />
        <Route path="/edit-company/:id" element={<EditCompany />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/add-client" element={<AddClient />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/edit-client/:id" element={<EditClient />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/suppliers" element={<SupplierList />} />
        <Route path="/add-supplier" element={<AddSupplier />} />
        <Route path="/edit-supplier/:id" element={<EditSupplier />} />
        <Route path="/purchases" element={<PurchaseList />} />
        <Route path="/add-purchase" element={<AddPurchase />} />
        <Route path="/edit-purchase/:id" element={<EditPurchase />} />
        
        {/* ⭐ ROUTES DES VENTES - CORRIGÉES */}
        <Route path="/sales" element={<SalesList />} />
        <Route path="/add-sale" element={<AddSale />} />
        <Route path="/edit-sale/:id" element={<EditSale />} /> {/* ⭐ AJOUTÉ */}
        
        <Route path="/users" element={<UserList />} />
        <Route path="/accounting" element={<AccountList />} />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/edit-account/:id" element={<EditAccount />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/add-invoice" element={<AddInvoice />} />
        <Route path="/edit-invoice/:id" element={<EditInvoice />} />
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/add-payment" element={<AddPayment />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit-payment/:id" element={<EditPayment />} />
      </Routes>
    </Router>
  );
}

export default App;