import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from "sweetalert2";
import { orderAPI, restaurantAPI } from '../api';
import io from 'socket.io-client';
import MenuManager from './MenuManager';
import OrderCard from './OrderCard';

// --- Icons ---
const Icons = {
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Trending: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Inbox: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
};

const API_BASE_URL = 'https://gocha-backend.onrender.com';

const Dashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // --- Effects ---

  useEffect(() => {
    const storedVendor = localStorage.getItem('vendor');
    if (storedVendor) {
      setVendor(JSON.parse(storedVendor));
    }
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      setUserHasInteracted(true);
      document.removeEventListener('click', handleUserInteraction);
    };
    document.addEventListener('click', handleUserInteraction);
    return () => document.removeEventListener('click', handleUserInteraction);
  }, []);

  const loadOrders = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const data = await orderAPI.getByRestaurant(restaurantId);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRestaurant = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    try {
      const data = await restaurantAPI.getDetails(restaurantId);
      setRestaurant(data.restaurant);
    } catch (err) {
      console.error('Failed to load restaurant', err);
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!userHasInteracted) return;
    const audio = new Audio('/beep.mp3');
    audio.play().catch(e => console.log("Audio play failed", e));
  }, [userHasInteracted]);

  useEffect(() => {
    if (vendor?.restaurantId) {
      loadOrders(vendor.restaurantId);
      loadRestaurant(vendor.restaurantId);

      const socket = io(API_BASE_URL, {
        reconnection: true,
        reconnectionDelay: 1000
      });

      socket.on('connect', () => {
        socket.emit('joinRestaurant', vendor.restaurantId);
      });

      socket.on('order.created', (payload) => {
        if (!payload) return;
        const newOrder = {
          _id: payload._id || payload.orderId,
          restaurantId: payload.restaurantId,
          items: payload.items,
          total: payload.total,
          customer: payload.customer,
          createdAt: payload.createdAt,
          status: 'pending'
        };
        setOrders(prev => [newOrder, ...prev]);
        const suffix = newOrder._id ? String(newOrder._id).slice(-4) : '----';
        setNotification(`New Order #${suffix}`);
        playNotificationSound();
        setTimeout(() => setNotification(null), 4000);
      });

      return () => socket.disconnect();
    }
  }, [vendor?.restaurantId, loadOrders, loadRestaurant, playNotificationSound]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      if (status === "ready") new Audio("/click.mp3").play().catch(() => {});
      else new Audio("/success.mp3").play().catch(() => {});

      await orderAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));

      Swal.fire({
        toast: true,
        position: "top",
        icon: "success",
        title: status === "ready" ? "Marked as Ready" : "Order Completed",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true
      });
    } catch (err) {
      Swal.fire({ toast: true, position: "top", icon: "error", title: "Update failed" });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "You will need to sign in again.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('vendor');
        window.location.reload();
      }
    });
  };

  const incomingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const readyOrders = useMemo(() => orders.filter(o => o.status === 'ready'), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);
  
  const currentList = activeTab === 'incoming' ? incomingOrders : activeTab === 'ready' ? readyOrders : completedOrders;

  if (loading && !vendor) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <style>{`
          .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* CSS Injection for animations and hover states */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .card-enter { animation: fadeIn 0.4s ease-out forwards; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .glass-header { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(229, 231, 235, 0.5); }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}</style>

      {/* Toast Notification */}
      {notification && (
        <div style={styles.toast} className="card-enter">
          <div style={styles.toastIcon}><Icons.Bell /></div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>New Activity</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{notification}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.header} className="glass-header">
        <div style={styles.headerContent}>
          <div style={styles.brandSection}>
            {restaurant?.image ? (
              <img src={restaurant.image} alt={restaurant.name} style={styles.restaurantImage} />
            ) : (
              <div style={styles.logoPlaceholder}>{vendor?.name?.charAt(0) || 'V'}</div>
            )}
            <div>
              <h1 style={styles.shopName}>{restaurant?.name || vendor?.name || 'Dashboard'}</h1>
              <span style={styles.shopStatus}>
                {restaurant?.isOpen ? 'Open for orders' : 'Closed'}
                {restaurant?.waitTime > 0 && ` • ${restaurant.waitTime} min wait`}
              </span>
              {restaurant?.location && (
                <span style={styles.shopLocation}>{restaurant.location}</span>
              )}
              {restaurant?.rating && (
                <span style={styles.shopRating}>★ {restaurant.rating}</span>
              )}
            </div>
          </div>

          <div style={styles.headerActions}>
            <HeaderButton onClick={() => setShowMenuManager(true)} icon={<Icons.Menu />} label="Menu" />
            <HeaderButton onClick={handleLogout} icon={<Icons.LogOut />} label="Logout" danger />
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Quick Stats Row */}
        <div style={styles.statsRow}>
          <StatCard 
            label="Pending" 
            value={incomingOrders.length} 
            color="#f59e0b" 
            icon={<Icons.Inbox />} 
            bg="rgba(245, 158, 11, 0.1)" 
          />
          <StatCard 
            label="Ready to Serve" 
            value={readyOrders.length} 
            color="#3b82f6" 
            icon={<Icons.Clock />} 
            bg="rgba(59, 130, 246, 0.1)" 
          />
          <StatCard 
            label="Completed Today" 
            value={completedOrders.length} 
            color="#10b981" 
            icon={<Icons.Trending />} 
            bg="rgba(16, 185, 129, 0.1)" 
          />
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <TabButton 
            active={activeTab === 'incoming'} 
            onClick={() => setActiveTab('incoming')} 
            label="Incoming" 
            count={incomingOrders.length}
            activeColor="#f59e0b"
          />
          <TabButton 
            active={activeTab === 'ready'} 
            onClick={() => setActiveTab('ready')} 
            label="Ready" 
            count={readyOrders.length}
            activeColor="#3b82f6"
          />
          <TabButton 
            active={activeTab === 'completed'} 
            onClick={() => setActiveTab('completed')} 
            label="Completed" 
            count={completedOrders.length}
            activeColor="#10b981"
          />
        </div>

        {/* Content Area */}
        <div style={styles.grid}>
          {currentList.map((order, index) => (
            <div key={order._id} className="card-enter" style={{ animationDelay: `${index * 50}ms` }}>
              <OrderCard
                order={order}
                onStatusUpdate={handleStatusUpdate}
                activeTab={activeTab}
              />
            </div>
          ))}
        </div>

        {currentList.length === 0 && (
          <div style={styles.emptyState} className="card-enter">
            <div style={styles.emptyIcon}>
               {activeTab === 'incoming' ? <Icons.Clock /> : <Icons.Check />}
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#374151' }}>No {activeTab} orders</h3>
            <p style={{ margin: 0, color: '#9ca3af' }}>Waiting for new activity...</p>
          </div>
        )}
      </main>

      {/* Menu Manager Component */}
{/* The component handles its own Overlay/Modal structure internally now */}
{showMenuManager && (
  <MenuManager
    restaurantId={vendor.restaurantId}
    onClose={() => setShowMenuManager(false)}
    onMenuChanged={() => loadOrders(vendor.restaurantId)}
  />
)}
    </div>
  );
};

// --- Sub-components ---

const HeaderButton = ({ onClick, icon, label, danger }) => {
  const [hover, setHover] = useState(false);
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.headerBtn,
        backgroundColor: danger ? (hover ? '#fee2e2' : '#fff') : (hover ? '#f3f4f6' : '#fff'),
        color: danger ? '#dc2626' : '#374151',
        borderColor: danger ? '#fecaca' : '#e5e7eb',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      {icon}
      <span style={{ marginLeft: label ? '8px' : 0 }}>{label}</span>
    </button>
  )
};

const StatCard = ({ label, value, color, icon, bg }) => (
  <div style={styles.statCard} className="hover-lift">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <span style={styles.statLabel}>{label}</span>
        <div style={{ ...styles.statValue, color: color }}>{value}</div>
      </div>
      <div style={{ 
        padding: '10px', 
        borderRadius: '12px', 
        backgroundColor: bg, 
        color: color 
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label, count, activeColor }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.tab,
      borderBottom: active ? `3px solid ${activeColor}` : '3px solid transparent',
      color: active ? '#111827' : '#9ca3af',
    }}
  >
    {label}
    {count > 0 && (
      <span style={{
        ...styles.badge,
        backgroundColor: active ? activeColor : '#f3f4f6',
        color: active ? 'white' : '#6b7280'
      }}>
        {count}
      </span>
    )}
  </button>
);

// --- Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e5e7eb 100%)',
    fontFamily: '"Inter", system-ui, sans-serif',
    paddingBottom: '40px',
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: '#ffffff',
    borderBottom: '1px solid #e5e5e5'
  },

  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  logoPlaceholder: {
    width: '40px',
    height: '40px',
    background: '#111',
    color: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },

  shopName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#111',
    margin: 0,
  },

  shopStatus: {
    fontSize: '0.75rem',
    color: '#666',
  },

  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },

  headerBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.45rem 0.9rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.85rem',
    background: '#fff',
    transition: '0.2s',
  },

  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },

  statCard: {
    backgroundColor: '#fff',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
  },

  statLabel: {
    fontSize: '0.75rem',
    color: '#777',
    fontWeight: 600,
    textTransform: 'uppercase',
  },

  statValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginTop: '0.4rem',
    color: '#111',
  },

  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '2rem',
    gap: '2rem',
  },

  tab: {
    padding: '0.8rem 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  badge: {
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.7rem',
    background: '#eee',
    color: '#444',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1.25rem',
  },

  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px dashed #ddd',
    gridColumn: '1 / -1',
  },

  emptyIcon: {
    color: '#aaa',
    marginBottom: '1rem',
  },

  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#111',
    color: 'white',
    padding: '0.9rem 1.1rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 10px 30px rgba(0,0,0,.25)',
  },

  toastIcon: {
    opacity: 0.7
  }
};



export default Dashboard;