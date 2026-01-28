import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from "sweetalert2";
import { orderAPI } from '../api';
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

  const playNotificationSound = useCallback(() => {
    if (!userHasInteracted) return;
    const audio = new Audio('/beep.mp3');
    audio.play().catch(e => console.log("Audio play failed", e));
  }, [userHasInteracted]);

  useEffect(() => {
    if (vendor?.restaurantId) {
      loadOrders(vendor.restaurantId);
      
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
  }, [vendor?.restaurantId, loadOrders, playNotificationSound]);

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
            <div style={styles.logoPlaceholder}>{vendor?.name?.charAt(0) || 'V'}</div>
            <div>
              <h1 style={styles.shopName}>{vendor?.name || 'Dashboard'}</h1>
              <span style={styles.shopStatus}>Open for orders</span>
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
    backgroundColor: '#f9fafb', // Lighter gray for more air
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '40px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0.75rem 1.5rem',
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
    width: '42px',
    height: '42px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
  },
  shopName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    lineHeight: 1.2,
  },
  shopStatus: {
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  headerBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(255,255,255,0.5)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '800',
    marginTop: '0.5rem',
    lineHeight: 1,
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '2rem',
    gap: '2rem',
  },
  tab: {
    padding: '1rem 0.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    transition: 'all 0.2s',
  },
  badge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: '700',
    transition: 'background-color 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '2px dashed #e5e7eb',
    gridColumn: '1 / -1',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#d1d5db',
    background: '#f9fafb',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto'
  },
  toast: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    zIndex: 100,
    maxWidth: '350px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  toastIcon: {
    backgroundColor: '#374151',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#60a5fa'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '95%',
    maxWidth: '900px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  closeButton: {
    background: '#f3f4f6',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  }
};

export default Dashboard;