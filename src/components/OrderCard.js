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
  // This handles the hover and press states internally to avoid re-rendering the whole card
  const ActionButton = ({ onClick, label, baseColor, hoverColor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const style = {
      padding: '0.65rem 1.25rem',
      backgroundColor: isHovered ? hoverColor : baseColor,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      boxShadow: isPressed 
        ? 'inset 0 2px 4px rgba(0,0,0,0.2)' // Inner shadow looks "pressed in"
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Floating shadow
      transform: isPressed ? 'scale(0.96) translateY(1px)' : 'scale(1) translateY(0)',
      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)', // Snappy transition
      outline: 'none',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
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
        {/* Simple chevron icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    );
  };

  // --- Styling Logic ---
  const getStatusStyles = (status) => {
    const styles = {
      pending: { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' }, // Orange-600
      ready:   { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' }, // Green-600
      delivered: { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' }, // Gray-600
    };
    return styles[status] || styles.delivered;
  };

  const statusStyle = getStatusStyles(order.status);

  // Dynamic Card Style
  const cardStyle = {
    backgroundColor: 'white',
    border: `1px solid ${isCardHovered ? '#d1d5db' : '#e5e7eb'}`,
    borderRadius: '16px', // Softer corners
    marginBottom: '1.5rem',
    boxShadow: isCardHovered 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transform: isCardHovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 0.3s ease',
    opacity: (activeTab === 'completed' && order.status === 'delivered') ? 0.8 : 1,
    overflow: 'hidden',
    position: 'relative'
  };

  // --- Icons ---
  const Icons = {
    User: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Phone: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    MapPin: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Clock: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight:6}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      {/* --- Header Section --- */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(to right, #fafafa, #ffffff)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontFamily: 'monospace', 
              fontSize: '1rem', 
              fontWeight: '700', 
              color: '#374151',
              backgroundColor: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              #{String(order._id || '').slice(-6).toUpperCase()}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              • {formatTime(order.createdAt)}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
          border: `1px solid ${statusStyle.border}`,
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.7rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: statusStyle.text }}></span>
          {order.status}
        </div>
      </div>

      {/* --- Content Body --- */}
      <div style={{ padding: '1.5rem' }}>
        
        {/* Customer Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#9ca3af' }}><Icons.User /></div>
            <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '1rem' }}>{order.customer?.name || 'Guest'}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#9ca3af' }}><Icons.Phone /></div>
            <a href={`tel:${order.customer?.phone || ''}`} style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>
              {order.customer?.phone || '—'}
            </a>
          </div>

          {order.customer?.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#9ca3af', marginTop: '2px' }}><Icons.MapPin /></div>
              <span style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {order.customer.address}
              </span>
            </div>
          )}
        </div>

        {/* Order Items Receipt Style */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          borderRadius: '12px', 
          padding: '1.25rem', 
          border: '1px solid #f1f5f9' 
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>
            Order Summary
          </h4>
          {(order.items || []).map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: '600', color: '#374151', minWidth: '24px' }}>{item.qty}x</span>
                <span style={{ color: '#4b5563', lineHeight: '1.4' }}>{item.name}</span>
              </div>
              <span style={{ color: '#1f2937', fontWeight: '600' }}>
                {formatCurrency((item.price || 0) * (item.qty || 0))}
              </span>
            </div>
          ))}
          
          {/* Notes */}
          {(order.notes) && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fffbeb', 
              borderRadius: '6px',
              border: '1px dashed #fcd34d',
              fontSize: '0.85rem', 
              color: '#b45309', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{fontSize:'1.2em'}}>📝</span> {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* --- Footer / Action Bar --- */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        backgroundColor: '#fff', 
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', letterSpacing: '0.025em', marginBottom: '2px' }}>
            <Icons.Clock />
            <span>{(order.pickupType || 'pickup').toUpperCase()}</span>
          </div>
          {order.scheduledAt && (
             <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600', marginLeft: '22px' }}>
              Due: {formatTime(order.scheduledAt)}
            </span>
          )}
        </div>

        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Total</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', lineHeight: 1, letterSpacing: '-0.025em' }}>
              {formatCurrency(order.total)}
            </span>
          </div>
          
          {/* Action Buttons using the new internal component */}
          {activeTab === 'incoming' && order.status === 'pending' && (
            <ActionButton 
              label="Mark Ready" 
              baseColor="#10b981" 
              hoverColor="#059669"
              onClick={() => onStatusUpdate(order._id, 'ready')}
            />
          )}
          {activeTab === 'ready' && order.status === 'ready' && (
            <ActionButton 
              label="Complete" 
              baseColor="#3b82f6" 
              hoverColor="#2563eb"
              onClick={() => onStatusUpdate(order._id, 'delivered')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;