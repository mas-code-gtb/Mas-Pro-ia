import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Nom d'utilisateur requis";
    if (!formData.email) newErrors.email = "Email requis";
    if (!formData.password) newErrors.password = "Mot de passe requis";
    if (formData.password.length < 6) newErrors.password = "6 caractères minimum";
    if (formData.password !== formData.password2) newErrors.password2 = "Les mots de passe ne correspondent pas";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await axios.post('http://https://maspro-backend.onrender.com/api/users/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        toast.success(' Compte créé ! Connectez-vous.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.username) {
          setErrors({ username: err.response.data.username[0] });
          toast.error('❌ ' + err.response.data.username[0]);
        } else if (err.response.data.email) {
          setErrors({ email: err.response.data.email[0] });
          toast.error('❌ ' + err.response.data.email[0]);
        } else {
          toast.error('❌ Erreur');
        }
      } else {
        toast.error('❌ Erreur de connexion');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header bg-gradient-primary text-white p-3 border-0 text-center">
              <FaUserPlus size={30} className="mb-1" />
              <h4 className="mb-0">Créer un compte</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ex: massamba"
                  />
                  {errors.username && (
                    <div className="invalid-feedback small">{errors.username}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                  />
                  {errors.email && (
                    <div className="invalid-feedback small">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Mot de passe *</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="6 caractères minimum"
                  />
                  {errors.password && (
                    <div className="invalid-feedback small">{errors.password}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Répétez le mot de passe"
                  />
                  {errors.password2 && (
                    <div className="invalid-feedback small">{errors.password2}</div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="small text-muted mb-0">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="fw-bold text-primary">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  );
};

export default Register;