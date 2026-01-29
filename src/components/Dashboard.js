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
  Clock: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trending: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Inbox: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Chef: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/></svg>
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
      setTimeout(() => setLoading(false), 500);
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

      const socket = io(API_BASE_URL, { reconnection: true, reconnectionDelay: 1000 });

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
        
        // --- NOTIFICATION SET HERE ---
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

      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      }).fire({
        icon: 'success',
        title: status === "ready" ? "Order marked Ready!" : "Order Completed!"
      });
      
    } catch (err) {
      Swal.fire({ toast: true, position: "top", icon: "error", title: "Update failed" });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign out?',
      text: "You will be returned to the login screen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, sign out'
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

  return (
    <div style={styles.container}>
      {/* Global CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .card-enter { animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>

      {/* --- NOTIFICATION TOAST RESTORED --- */}
      {notification && (
        <div style={styles.toast} className="card-enter">
          <div style={styles.toastIcon}><Icons.Bell /></div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>New Activity</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{notification}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.brandSection}>
            <div style={styles.avatarWrapper}>
              {/* LARGE RESTAURANT IMAGE */}
              {restaurant?.image ? (
                <img src={restaurant.image} alt={restaurant.name} style={styles.restaurantImage} />
              ) : (
                <div style={styles.logoPlaceholder}>{vendor?.name?.charAt(0) || 'V'}</div>
              )}
              <div style={styles.statusDot} title={restaurant?.isOpen ? "Open" : "Closed"}></div>
            </div>
            
            <div style={styles.headerText}>
              <h1 style={styles.shopName}>{restaurant?.name || vendor?.name || 'Dashboard'}</h1>
              <div style={styles.metaRow}>
                {restaurant?.rating && <span style={styles.badge}>★ {restaurant.rating}</span>}
                <span style={styles.metaText}>{restaurant?.location || 'Store Location'}</span>
              </div>
            </div>
          </div>

          <div style={styles.headerActions}>
            <HeaderButton onClick={() => setShowMenuManager(true)} icon={<Icons.Menu />} label="Menu" />
            <HeaderButton onClick={handleLogout} icon={<Icons.LogOut />} label="Logout" danger />
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <StatCard label="Pending Orders" value={loading ? "..." : incomingOrders.length} icon={<Icons.Inbox />} theme="orange" />
          <StatCard label="Ready to Serve" value={loading ? "..." : readyOrders.length} icon={<Icons.Chef />} theme="blue" />
          <StatCard label="Completed Today" value={loading ? "..." : completedOrders.length} icon={<Icons.Trending />} theme="green" />
        </div>

        {/* Tabs */}
        <div style={styles.controlsBar}>
          <div style={styles.tabContainer}>
            <TabButton active={activeTab === 'incoming'} onClick={() => setActiveTab('incoming')} label="Incoming" count={incomingOrders.length} />
            <TabButton active={activeTab === 'ready'} onClick={() => setActiveTab('ready')} label="Ready" count={readyOrders.length} />
            <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} label="History" count={completedOrders.length} />
          </div>
        </div>

        {/* Grid */}
        <div style={styles.grid}>
          {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} style={styles.skeletonCard} className="skeleton"></div>)
          ) : (
            <>
              {currentList.map((order, index) => (
                <div key={order._id} className="card-enter" style={{ animationDelay: `${index * 50}ms` }}>
                  <OrderCard order={order} onStatusUpdate={handleStatusUpdate} activeTab={activeTab} />
                </div>
              ))}
              {!loading && currentList.length === 0 && (
                <div style={styles.emptyState} className="card-enter">
                  <div style={styles.emptyIconWrapper}>{activeTab === 'incoming' ? <Icons.Clock /> : <Icons.Check />}</div>
                  <h3 style={styles.emptyTitle}>No {activeTab} orders</h3>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
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

// --- Sub Components ---
const HeaderButton = ({ onClick, icon, label, danger }) => (
  <button 
    onClick={onClick} 
    style={{...styles.headerBtn, color: danger ? '#EF4444' : '#374151', border: danger ? '1px solid #fee2e2' : '1px solid #e5e7eb', background: 'white'}}
  >
    {icon} <span style={{ marginLeft: 8 }}>{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, theme }) => {
  const colors = { orange: '#F97316', blue: '#3B82F6', green: '#10B981' };
  const bgs = { orange: '#FFF7ED', blue: '#EFF6FF', green: '#ECFDF5' };
  return (
    <div style={{...styles.statCard, borderBottom: `4px solid ${colors[theme]}`}}>
      <div>
        <span style={styles.statLabel}>{label}</span>
        <div style={styles.statValue}>{value}</div>
      </div>
      <div style={{ padding: 10, borderRadius: 12, background: bgs[theme], color: colors[theme] }}>{icon}</div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }) => (
  <button onClick={onClick} style={{...styles.tab, background: active ? '#111827' : 'transparent', color: active ? '#fff' : '#6B7280'}}>
    {label} <span style={{...styles.tabCount, background: active ? 'rgba(255,255,255,0.2)' : '#E5E7EB', color: active ? '#fff' : '#374151'}}>{count}</span>
  </button>
);

// --- Styles ---
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '40px' },
  header: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '12px 0' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brandSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  
  // Large Image Styles
  avatarWrapper: { position: 'relative' },
  restaurantImage: { 
    width: '90px', 
    height: '90px', 
    borderRadius: '16px', 
    objectFit: 'cover', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '3px solid white'
  },
  logoPlaceholder: { width: '90px', height: '90px', background: '#111', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 },
  statusDot: { position: 'absolute', bottom: 2, right: 2, width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10B981', border: '3px solid white' },
  
  headerText: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  shopName: { fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' },
  badge: { fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '6px' },
  metaText: { fontSize: '0.9rem', color: '#64748B' },
  headerActions: { display: 'flex', gap: '12px' },
  headerBtn: { display: 'flex', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: '0.2s' },
  
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' },
  statCard: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between' },
  statLabel: { fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' },
  statValue: { fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', color: '#0F172A' },
  
  controlsBar: { display: 'flex', justifyContent: 'center', marginBottom: '2rem' },
  tabContainer: { display: 'inline-flex', backgroundColor: '#fff', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', gap: '6px' },
  tab: { padding: '0.6rem 1.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
  tabCount: { padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800 },
  
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
    gap: '1.5rem', 
    alignItems: 'stretch' 
  },
  skeletonCard: { height: '300px', borderRadius: '16px' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' },
  emptyIconWrapper: { width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' },
  emptyTitle: { margin: 0, color: '#64748B' },

  // --- TOAST STYLES RESTORED ---
  toast: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 100,
    minWidth: '300px',
  },
  toastIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
  }
};

export default Dashboard;