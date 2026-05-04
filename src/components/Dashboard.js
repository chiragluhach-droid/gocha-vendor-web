import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from "sweetalert2";
import { orderAPI, restaurantAPI } from '../api';
import io from 'socket.io-client';
import MenuManager from './MenuManager';
import OrderCard from './OrderCard';

// --- Icons ---
const Icons = {
  Menu: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  LogOut: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trending: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Inbox: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Chef: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/></svg>
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

  const TABS = ['incoming', 'cancelled', 'ready', 'completed'];

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
        setNotification(`New Order #${suffix}`);
        playNotificationSound();
        setTimeout(() => setNotification(null), 4000);
      });

      return () => socket.disconnect();
    }
  }, [vendor?.restaurantId, loadOrders, loadRestaurant, playNotificationSound]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      // Play different sounds for feedback
      if (status === 'ready') new Audio('/click.mp3').play().catch(() => {});
      else if (status === 'preparing') new Audio('/click.mp3').play().catch(() => {});
      else if (status === 'cancelled') new Audio('/error.mp3').play().catch(() => {});
      else new Audio('/success.mp3').play().catch(() => {});

      await orderAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));

      const titleMap = {
        preparing: 'Order Accepted — Preparing',
        ready: 'Order marked Ready!',
        delivered: 'Order Completed!',
        cancelled: 'Order Cancelled'
      };

      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      }).fire({
        icon: status === 'cancelled' ? 'error' : 'success',
        title: titleMap[status] || 'Status updated'
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
      confirmButtonColor: '#059669', // Brand color
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
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'cancelled'), [orders]);
  const preparingOrders = useMemo(() => orders.filter(o => o.status === 'preparing'), [orders]);
  
  const currentList = activeTab === 'incoming' ? [...preparingOrders, ...incomingOrders] : activeTab === 'ready' ? readyOrders : activeTab === 'cancelled' ? cancelledOrders : completedOrders;

  const handleSwipe = (direction) => {
    const currentIndex = TABS.indexOf(activeTab);
    if (direction === 'left' && currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <style>{`
        .card-enter { animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- Notification Toast --- */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-xl flex items-center gap-4 shadow-2xl z-50 min-w-[300px] card-enter">
          <div className="flex items-center justify-center bg-white/10 w-10 h-10 rounded-lg text-brand-400">
            <Icons.Bell />
          </div>
          <div>
            <div className="font-semibold text-sm">New Activity</div>
            <div className="text-sm opacity-80">{notification}</div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 py-2 md:py-3 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Brand & Restaurant Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {restaurant?.image ? (
                <img src={restaurant.image} alt={restaurant.name} className="w-10 h-10 md:w-16 md:h-16 rounded-xl object-cover shadow-sm border-2 border-white" />
              ) : (
                <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-600 text-white rounded-xl flex items-center justify-center text-lg md:text-2xl font-bold shadow-sm border-2 border-white">
                  {vendor?.name?.charAt(0) || 'V'}
                </div>
              )}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-sm ${restaurant?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} 
                title={restaurant?.isOpen ? "Open" : "Closed"}
              ></div>
            </div>
            
            <div className="flex flex-col min-w-0">
              <h1 className="text-base md:text-xl font-bold text-gray-900 m-0 tracking-tight truncate leading-tight">
                {restaurant?.name || vendor?.name || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {restaurant?.rating && (
                  <span className="text-[10px] md:text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    ★ {restaurant.rating}
                  </span>
                )}
                <span className="text-[10px] md:text-sm text-gray-500 font-medium truncate opacity-80">
                  {restaurant?.location || 'Store Location'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowMenuManager(true)}
              className="p-2 md:px-4 md:py-2.5 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-2 font-semibold text-sm active:scale-95"
              title="Menu"
            >
              <Icons.Menu />
              <span className="hidden md:inline">Menu</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 md:px-4 md:py-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2 font-semibold text-sm active:scale-95"
              title="Logout"
            >
              <Icons.LogOut />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* --- Stats Row --- */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard label="Pending" value={loading ? "..." : incomingOrders.length} icon={<Icons.Inbox />} theme="orange" />
          <StatCard label="Preparing" value={loading ? "..." : preparingOrders.length} icon={<Icons.Chef />} theme="orange" />
          <StatCard label="Ready" value={loading ? "..." : readyOrders.length} icon={<Icons.Check />} theme="blue" />
          <StatCard label="Cancelled" value={loading ? "..." : cancelledOrders.length} icon={<Icons.Inbox />} theme="red" />
          <StatCard label="Completed" value={loading ? "..." : completedOrders.length} icon={<Icons.Trending />} theme="green" />
        </div>



        {/* MR-BITES Label */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-[1px] w-8 bg-brand-200 mb-2"></div>
          <span className="text-[11px] font-black text-brand-600 uppercase tracking-[0.4em] opacity-60">MR-BITES</span>
        </div>

        {/* --- Controls --- */}
        <div className="flex justify-start md:justify-center overflow-x-auto pb-4 mb-4 md:mb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 gap-1.5 min-w-max">
            <TabButton active={activeTab === 'incoming'} onClick={() => setActiveTab('incoming')} label="Incoming" count={incomingOrders.length} />
            <TabButton active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} label="Cancelled" count={cancelledOrders.length} />
            <TabButton active={activeTab === 'ready'} onClick={() => setActiveTab('ready')} label="Ready" count={readyOrders.length} />
            <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} label="History" count={completedOrders.length} />
          </div>
        </div>

        {/* --- Grid --- */}
        <motion.div 
          className="w-full overflow-hidden"
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = offset.x;
            if (swipe < -50) handleSwipe('left');
            else if (swipe > 50) handleSwipe('right');
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {loading ? (
               Array(3).fill(0).map((_, i) => (
                 <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
               ))
            ) : (
              <>
                {currentList.map((order, index) => (
                  <div key={order._id} className="card-enter" style={{ animationDelay: `${index * 50}ms` }}>
                    <OrderCard order={order} onStatusUpdate={handleStatusUpdate} activeTab={activeTab} />
                  </div>
                ))}
                {!loading && currentList.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center card-enter">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      {activeTab === 'incoming' ? <Icons.Clock /> : <Icons.Check />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 m-0">No {activeTab} orders</h3>
                    <p className="text-gray-500 text-sm mt-1">Check back later for new updates.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* --- Modals --- */}
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
    className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95
      ${danger 
        ? 'text-red-600 border-red-200 bg-white hover:bg-red-50 focus:ring-red-200' 
        : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50 focus:ring-gray-200'}`}
  >
    {icon} <span>{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, theme }) => {
  const themeStyles = {
    orange: 'border-b-amber-500 text-amber-600 bg-amber-50',
    blue: 'border-b-blue-500 text-blue-600 bg-blue-50',
    green: 'border-b-brand-500 text-brand-600 bg-brand-50',
    red: 'border-b-red-500 text-red-600 bg-red-50'
  };

  return (
    <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center border-b-4 ${themeStyles[theme].split(' ')[0]}`}>
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
      </div>
      <div className={`p-2.5 rounded-xl ${themeStyles[theme].split(' ')[2]} ${themeStyles[theme].split(' ')[1]}`}>
        {icon}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50
      ${active 
        ? 'bg-brand-600 text-white shadow-md' 
        : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
  >
    {label} 
    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
      {count}
    </span>
  </button>
);

export default Dashboard;