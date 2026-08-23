import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaTimes, FaCircle } from 'react-icons/fa';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/notifications/notifications/', config);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://https://maspro-backend.onrender.com/api/notifications/notifications/unread_count/', config);
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      await axios.post(`http://https://maspro-backend.onrender.com/api/notifications/notifications/${id}/mark_read/`, {}, config);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      await axios.post('http://https://maspro-backend.onrender.com/api/notifications/notifications/mark_all_read/', {}, config);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success(' Toutes les notifications lues');
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'order': '',
      'invoice': '',
      'payment': '',
      'stock': '',
      'info': '',
      'alert': ''
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="position-relative">
      <button 
        className="btn btn-outline-light btn-sm position-relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="position-absolute end-0 mt-2 shadow-lg rounded" style={{ 
          width: '380px', 
          maxHeight: '400px', 
          overflowY: 'auto',
          backgroundColor: 'white',
          zIndex: 1050,
          border: '1px solid #ddd'
        }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0 fw-bold">🔔 Notifications</h6>
            <div>
              {unreadCount > 0 && (
                <button className="btn btn-sm btn-outline-primary me-2" onClick={markAllRead}>
                  <FaCheck size={12} /> Tout lire
                </button>
              )}
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsOpen(false)}>
                <FaTimes size={12} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 border-bottom ${!notif.is_read ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex">
                    <span className="me-2" style={{ fontSize: '20px' }}>{getTypeIcon(notif.type)}</span>
                    <div>
                      <div className="fw-bold small">{notif.title}</div>
                      <div className="text-muted small">{notif.message}</div>
                      <div className="text-muted small">
                        {new Date(notif.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {!notif.is_read && <FaCircle size={10} className="text-primary" />}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;