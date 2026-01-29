import React, { useState } from 'react';

const OrderCard = ({ order, onStatusUpdate, activeTab }) => {
  const [isCardHovered, setIsCardHovered] = useState(false);

  // --- Helpers ---
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // --- Internal Component: Tactile Button ---
  const ActionButton = ({ onClick, label, baseColor, hoverColor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const style = {
      padding: '0.5rem 1rem', // Smaller Padding
      backgroundColor: isHovered ? hoverColor : baseColor,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.85rem', // Smaller Font
      fontWeight: '600',
      boxShadow: isPressed 
        ? 'inset 0 2px 4px rgba(0,0,0,0.2)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transform: isPressed ? 'scale(0.96) translateY(1px)' : 'scale(1) translateY(0)',
      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    };

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={style}
      >
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    );
  };

  // --- Styling Logic ---
  const getStatusStyles = (status) => {
    const styles = {
      pending: { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' }, 
      ready:   { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
      delivered: { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
    };
    return styles[status] || styles.delivered;
  };

  const statusStyle = getStatusStyles(order.status);

  // Dynamic Card Style
  const cardStyle = {
    backgroundColor: 'white',
    border: `1px solid ${isCardHovered ? '#d1d5db' : '#e5e7eb'}`,
    borderRadius: '16px', 
    marginBottom: '0', 
    boxShadow: isCardHovered 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transform: isCardHovered ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'all 0.3s ease',
    opacity: (activeTab === 'completed' && order.status === 'delivered') ? 0.8 : 1,
    overflow: 'hidden',
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const Icons = {
    User: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Phone: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    MapPin: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Clock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight:6}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      {/* --- Header --- */}
      <div style={{ 
        padding: '0.75rem 1rem', // Reduced Padding
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(to right, #fafafa, #ffffff)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: '700', color: '#374151', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
              #{String(order._id || '').slice(-6).toUpperCase()}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>• {formatTime(order.createdAt)}</span>
          </div>
        </div>
        
        <div style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
          border: `1px solid ${statusStyle.border}`,
          padding: '0.2rem 0.6rem', // Smaller Badge
          borderRadius: '999px',
          fontSize: '0.65rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: statusStyle.text }}></span>
          {order.status}
        </div>
      </div>

      {/* --- Body --- */}
      <div style={{ padding: '1rem', flex: 1 }}> {/* Reduced Padding */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: '#9ca3af' }}><Icons.User /></div>
            <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{order.customer?.name || 'Guest'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: '#9ca3af' }}><Icons.Phone /></div>
            <a href={`tel:${order.customer?.phone || ''}`} style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem' }}>{order.customer?.phone || '—'}</a>
          </div>
          {order.customer?.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ color: '#9ca3af', marginTop: '2px' }}><Icons.MapPin /></div>
              <span style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.4' }}>{order.customer.address}</span>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #f1f5f9' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>Order Summary</h4>
          {(order.items || []).map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: '600', color: '#374151', minWidth: '20px' }}>{item.qty}x</span>
                <span style={{ color: '#4b5563', lineHeight: '1.4' }}>{item.name}</span>
              </div>
              <span style={{ color: '#1f2937', fontWeight: '600' }}>{formatCurrency((item.price || 0) * (item.qty || 0))}</span>
            </div>
          ))}
          {(order.notes) && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px dashed #fcd34d', fontSize: '0.8rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{fontSize:'1.1em'}}>📝</span> {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* --- Footer --- */}
      <div style={{ 
        padding: '0.75rem 1rem', // Reduced Padding
        backgroundColor: '#fff', 
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', letterSpacing: '0.025em', marginBottom: '1px' }}>
            <Icons.Clock />
            <span>{(order.pickupType || 'pickup').toUpperCase()}</span>
          </div>
          {order.scheduledAt && (
             <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '600', marginLeft: '20px' }}>Due: {formatTime(order.scheduledAt)}</span>
          )}
        </div>

        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Total</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', lineHeight: 1, letterSpacing: '-0.025em' }}>{formatCurrency(order.total)}</span>
          </div>
          
          {activeTab === 'incoming' && order.status === 'pending' && (
            <ActionButton label="Ready" baseColor="#10b981" hoverColor="#059669" onClick={() => onStatusUpdate(order._id, 'ready')} />
          )}
          {activeTab === 'ready' && order.status === 'ready' && (
            <ActionButton label="Done" baseColor="#3b82f6" hoverColor="#2563eb" onClick={() => onStatusUpdate(order._id, 'delivered')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;