import React, { useEffect, useState, useCallback } from 'react';
import { restaurantAPI } from '../api';

// --- Unified Brand Colors ---
const COLORS = {
  primary: '#056548',
  primaryHover: '#04533a',
  primaryLight: 'rgba(5, 101, 72, 0.1)',
  surface: '#FFFFFF',
  background: '#F9FAFB',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  success: '#059669',
  successLight: '#ECFDF5',
};

// --- Modern Icons ---
const Icons = {
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Image: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Veg: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="22" height="22" stroke="#16A34A" strokeWidth="2"/><circle cx="12" cy="12" r="6" fill="#16A34A"/></svg>,
  NonVeg: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="22" height="22" stroke="#DC2626" strokeWidth="2"/><path d="M12 6L6 18H18L12 6Z" fill="#DC2626"/></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
};

const MenuManager = ({ restaurantId, onClose, onMenuChanged }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newImage, setNewImage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    available: true
  });

  // Load Data
  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const data = await restaurantAPI.getMenu(restaurantId, true);
      const sections = data.sections || [];
      const items = sections.reduce((acc, s) => acc.concat(s.data || []), []);
      setMenuItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadMenu();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [loadMenu]);

  // Search Filter
  useEffect(() => {
    const results = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, menuItems]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const item = { ...newItem, price: parseFloat(newItem.price), image: newImage };
      await restaurantAPI.addMenuItem(restaurantId, item);
      setNewItem({ name: '', description: '', price: '', category: 'Main Course', isVeg: true, available: true });
      setNewImage('');
      setShowAddForm(false);
      loadMenu();
      onMenuChanged && onMenuChanged();
    } catch (err) {
      alert('Failed to add item. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (file.size > 5000000) { alert("File too large (Max 5MB)"); return; }
    const reader = new FileReader();
    reader.onload = (event) => setNewImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleToggleAvailability = async (itemId, currentlyAvailable) => {
    setMenuItems(prev => prev.map(item => (item.id === itemId || item._id === itemId) ? { ...item, available: !currentlyAvailable } : item));
    try {
      await restaurantAPI.updateMenuItem(itemId, { available: !currentlyAvailable });
      onMenuChanged && onMenuChanged();
    } catch (err) { loadMenu(); }
  };

  return (
    <div style={styles.overlay}>
      {/* --- Injected CSS for Hover/Focus/Keyframes --- */}
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        
        /* Interactive States */
        .btn-icon:hover { background-color: #F3F4F6; color: #111827; }
        .btn-primary { background-color: ${COLORS.primary}; color: white; transition: background 0.2s; }
        .btn-primary:hover { background-color: ${COLORS.primaryHover}; }
        
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        
        .add-new-card { transition: all 0.2s; border-color: ${COLORS.border}; color: ${COLORS.textSecondary}; }
        .add-new-card:hover { border-color: ${COLORS.primary}; color: ${COLORS.primary}; background-color: ${COLORS.primaryLight}; }
        .add-new-card:hover .icon-circle { background-color: white; color: ${COLORS.primary}; }
        
        /* Form Inputs */
        .form-input { transition: all 0.2s; background-color: ${COLORS.background}; }
        .form-input:focus { border-color: ${COLORS.primary}; box-shadow: 0 0 0 3px ${COLORS.primaryLight}; outline: none; background-color: white; }
        
        /* Toggle Switch */
        .switch-input:checked + .slider { background-color: ${COLORS.primary}; }
        .switch-input:checked + .slider:before { transform: translateX(20px); }
      `}</style>

      {/* --- Main Modal Content --- */}
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Menu Management</h2>
            <p style={styles.subtitle}>Manage your dishes, pricing, and availability</p>
          </div>
          <button onClick={onClose} style={styles.iconBtn} className="btn-icon"><Icons.Close /></button>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Icons.Search />
            <input 
              placeholder="Search items..." 
              style={styles.searchInput} 
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddForm(true)} style={styles.primaryBtn} className="btn-primary">
            <Icons.Plus /> <span>Add Item</span>
          </button>
        </div>

        {/* Grid Content */}
        <div style={styles.content} className="custom-scroll">
          <div style={styles.grid}>
            {loading ? (
               Array(6).fill(0).map((_, i) => (
                 <div key={i} style={styles.skeletonCard}>
                   <div style={{height: 160}} className="skeleton"></div>
                   <div style={{padding: 16}}>
                     <div style={{height: 18, width: '60%', marginBottom: 10, borderRadius: 4}} className="skeleton"></div>
                     <div style={{height: 14, width: '40%', borderRadius: 4}} className="skeleton"></div>
                   </div>
                 </div>
               ))
            ) : (
              <>
                <div style={styles.addNewCard} onClick={() => setShowAddForm(true)} className="add-new-card">
                  <div style={styles.addIconCircle} className="icon-circle"><Icons.Plus /></div>
                  <span style={{fontWeight: 600, fontSize: '0.95rem'}}>Add New Dish</span>
                </div>

                {filteredItems.map(item => (
                  <MenuCard 
                    key={item.id || item._id} 
                    item={item} 
                    onToggle={handleToggleAvailability}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Slide-Over Form Drawer --- */}
      {showAddForm && (
        <>
          <div style={styles.backdrop} onClick={() => setShowAddForm(false)}></div>
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: COLORS.textPrimary }}>Add New Item</h3>
              <button onClick={() => setShowAddForm(false)} style={styles.iconBtn} className="btn-icon"><Icons.Close /></button>
            </div>
            
            <form onSubmit={handleAddItem} style={styles.formContent} className="custom-scroll">
              <div style={styles.formSection}>
                <label style={styles.label}>Dish Image</label>
                <div 
                  style={{
                    ...styles.imageUploadBox, 
                    borderColor: isDragOver ? COLORS.primary : COLORS.border, 
                    backgroundColor: isDragOver ? COLORS.primaryLight : COLORS.background
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                >
                  <input type="file" id="img-upload" accept="image/*" onChange={handleImageChange} hidden />
                  {newImage ? (
                    <div style={styles.previewContainer}>
                      <img src={newImage} alt="Preview" style={styles.previewImg} />
                      <label htmlFor="img-upload" style={styles.changeOverlay}>Change Photo</label>
                    </div>
                  ) : (
                    <label htmlFor="img-upload" style={styles.uploadPlaceholder}>
                      <div style={styles.uploadIconWrapper}><Icons.Image /></div>
                      <span style={{color: COLORS.textSecondary, fontWeight: 500, fontSize: '0.9rem'}}>Click or drag image here</span>
                    </label>
                  )}
                </div>
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Item Name</label>
                <input required className="form-input" style={styles.input} placeholder="e.g. Butter Chicken" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} />
              </div>

              <div style={styles.row}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Price (₹)</label>
                  <input required type="number" className="form-input" style={styles.input} placeholder="0.00" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value})} />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Category</label>
                  <select className="form-input" style={styles.select} value={newItem.category} onChange={e=>setNewItem({...newItem, category:e.target.value})}>
                    <option>Starters</option>
                    <option>Main Course</option>
                    <option>Breads</option>
                    <option>Beverages</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Description</label>
                <textarea className="form-input" style={{...styles.input, minHeight: 100, resize: 'vertical'}} placeholder="Describe ingredients..." value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value})} />
              </div>

              <div style={styles.toggleRow}>
                <span style={{fontWeight: 600, color: COLORS.textPrimary, fontSize: '0.9rem'}}>Vegetarian Dish</span>
                <label style={styles.switch}>
                  <input type="checkbox" className="switch-input" style={{ opacity: 0, width: 0, height: 0 }} checked={newItem.isVeg} onChange={e=>setNewItem({...newItem, isVeg:e.target.checked})} />
                  <span style={styles.slider} className="slider"></span>
                </label>
              </div>
            </form>

            <div style={styles.drawerFooter}>
              <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" onClick={handleAddItem} style={styles.saveBtn} className="btn-primary">Save Item</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Sub-Component: Menu Card ---
const MenuCard = ({ item, onToggle }) => {
  const isAvailable = item.available;

  return (
    <div style={styles.card} className="card-hover">
      <div style={{
        ...styles.cardContentWrapper,
        filter: isAvailable ? 'none' : 'grayscale(100%)',
        opacity: isAvailable ? 1 : 0.65
      }}>
        <div style={styles.cardImageWrapper}>
          {item.image ? (
            <img src={item.image} alt={item.name} style={styles.cardImage} />
          ) : (
            <div style={styles.cardPlaceholder}>{(item.name||'?')[0]}</div>
          )}
          <div style={styles.badges}>
            <span style={styles.vegBadge}>
              {item.isVeg ? <Icons.Veg /> : <Icons.NonVeg />}
            </span>
          </div>
        </div>
        
        <div style={styles.cardBody}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: 6}}>
            <h3 style={styles.cardTitle}>{item.name}</h3>
            <span style={styles.cardPrice}>₹{item.price}</span>
          </div>
          <p style={styles.cardDesc}>{item.description || 'No description provided.'}</p>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <span style={styles.categoryTag}>{item.category}</span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id || item._id, item.available);
          }}
          style={{
            ...styles.statusToggle,
            backgroundColor: isAvailable ? COLORS.dangerLight : COLORS.successLight,
            color: isAvailable ? COLORS.danger : COLORS.success,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%', 
            backgroundColor: isAvailable ? COLORS.danger : COLORS.success
          }}></span>
          {isAvailable ? 'Mark Sold Out' : 'Mark In Stock'}
        </button>
      </div>
    </div>
  );
};

// --- CSS-in-JS Styles ---
const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    backgroundColor: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    width: '92%', maxWidth: '1100px', height: '85vh',
    backgroundColor: COLORS.surface, borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  header: {
    padding: '1.25rem 2rem', backgroundColor: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`, display: 'flex', 
    justifyContent: 'space-between', alignItems: 'center'
  },
  title: { fontSize: '1.25rem', fontWeight: '700', color: COLORS.textPrimary, margin: 0 },
  subtitle: { fontSize: '0.875rem', color: COLORS.textSecondary, margin: '4px 0 0' },
  iconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: COLORS.textSecondary, padding: 8, borderRadius: '8px', 
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  toolbar: {
    padding: '1rem 2rem', display: 'flex', gap: '1rem',
    alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.background, padding: '0.5rem 1rem', borderRadius: '8px',
    flex: 1, maxWidth: '350px', color: COLORS.textSecondary, border: `1px solid ${COLORS.border}`
  },
  searchInput: { 
    border: 'none', background: 'transparent', outline: 'none', 
    width: '100%', fontSize: '0.9rem', color: COLORS.textPrimary 
  },
  primaryBtn: {
    border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
  },
  content: { flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', backgroundColor: COLORS.background },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem'
  },
  addNewCard: {
    border: '2px dashed', borderRadius: '12px', backgroundColor: COLORS.surface,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', minHeight: '300px',
  },
  addIconCircle: {
    width: 48, height: 48, borderRadius: '50%', backgroundColor: COLORS.background,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  
  // Card Styles
  card: {
    backgroundColor: COLORS.surface, borderRadius: '12px', overflow: 'hidden',
    border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column',
    minHeight: '300px', justifyContent: 'space-between'
  },
  cardContentWrapper: { transition: 'all 0.3s ease' },
  cardImageWrapper: { height: 160, position: 'relative', backgroundColor: COLORS.background },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#D1D5DB', fontWeight: 700 },
  badges: { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 },
  vegBadge: { backgroundColor: COLORS.surface, borderRadius: 6, padding: 6, display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  cardBody: { padding: '1rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: COLORS.textPrimary, margin: 0, lineHeight: 1.3 },
  cardPrice: { fontSize: '0.95rem', fontWeight: 700, color: COLORS.primary },
  cardDesc: { fontSize: '0.85rem', color: COLORS.textSecondary, margin: '6px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  
  cardFooter: { 
    marginTop: 'auto', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', padding: '0.75rem 1rem', borderTop: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.surface
  },
  categoryTag: { fontSize: '0.75rem', fontWeight: 600, color: COLORS.textSecondary, backgroundColor: COLORS.background, padding: '4px 8px', borderRadius: 4 },
  statusToggle: {
    padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, border: 'none',
    transition: 'all 0.2s',
  },
  
  skeletonCard: { backgroundColor: COLORS.surface, borderRadius: '12px', overflow: 'hidden', minHeight: '300px', border: `1px solid ${COLORS.border}` },
  backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10000 },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '450px',
    backgroundColor: COLORS.surface, boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
    zIndex: 10001, display: 'flex', flexDirection: 'column',
    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  drawerHeader: { padding: '1.25rem 1.5rem', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  formContent: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  drawerFooter: { padding: '1.25rem 1.5rem', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: '1rem', backgroundColor: COLORS.background },
  formSection: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 },
  input: { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: '0.9rem', color: COLORS.textPrimary },
  select: { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: '0.9rem', color: COLORS.textPrimary, appearance: 'none' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1.25rem' },
  
  imageUploadBox: { height: 160, border: '2px dashed', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' },
  uploadPlaceholder: { cursor: 'pointer', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  uploadIconWrapper: { width: 40, height: 40, borderRadius: '50%', backgroundColor: COLORS.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  previewContainer: { width: '100%', height: '100%', position: 'relative' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  changeOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(31, 41, 55, 0.8)', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(4px)' },
  
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: COLORS.surface, borderRadius: '8px', border: `1px solid ${COLORS.border}` },
  switch: { position: 'relative', display: 'inline-block', width: 40, height: 22 },
  slider: { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#D1D5DB', borderRadius: 22, transition: '0.3s', ':before': { position: 'absolute', content: '""', height: 18, width: 18, left: 2, bottom: 2, backgroundColor: 'white', borderRadius: '50%', transition: '0.3s' } },
  
  cancelBtn: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface, color: COLORS.textPrimary, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  saveBtn: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }
};

export default MenuManager;