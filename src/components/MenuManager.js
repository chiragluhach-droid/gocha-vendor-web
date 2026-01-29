import React, { useEffect, useState, useCallback } from 'react';
import { restaurantAPI } from '../api';

// --- Modern Icons ---
const Icons = {
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Image: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Veg: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="22" height="22" stroke="#16A34A" strokeWidth="2"/><circle cx="12" cy="12" r="6" fill="#16A34A"/></svg>,
  NonVeg: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="22" height="22" stroke="#DC2626" strokeWidth="2"/><path d="M12 6L6 18H18L12 6Z" fill="#DC2626"/></svg>,
  Trash: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .hover-scale:hover { transform: scale(1.02); }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>

      {/* --- Main Modal Content --- */}
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Menu Management</h2>
            <p style={styles.subtitle}>Manage your dishes, pricing, and availability</p>
          </div>
          <button onClick={onClose} style={styles.iconBtn}><Icons.Close /></button>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Icons.Search />
            <input 
              placeholder="Search items..." 
              style={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddForm(true)} style={styles.primaryBtn}>
            <Icons.Plus /> <span>Add Item</span>
          </button>
        </div>

        {/* Grid Content */}
        <div style={styles.content} className="custom-scroll">
          <div style={styles.grid}>
            {loading ? (
               Array(6).fill(0).map((_, i) => (
                 <div key={i} style={styles.skeletonCard}>
                   <div style={{height: 140}} className="skeleton"></div>
                   <div style={{padding: 16}}>
                     <div style={{height: 20, width: '70%', marginBottom: 10}} className="skeleton"></div>
                     <div style={{height: 16, width: '40%'}} className="skeleton"></div>
                   </div>
                 </div>
               ))
            ) : (
              <>
                <div style={styles.addNewCard} onClick={() => setShowAddForm(true)} className="hover-scale">
                  <div style={styles.addIconCircle}><Icons.Plus /></div>
                  <span style={{fontWeight: 600}}>Add New Dish</span>
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
              <h3>Add New Item</h3>
              <button onClick={() => setShowAddForm(false)} style={styles.iconBtn}><Icons.Close /></button>
            </div>
            
            <form onSubmit={handleAddItem} style={styles.formContent} className="custom-scroll">
              <div style={styles.formSection}>
                <label style={styles.label}>Dish Image</label>
                <div 
                  style={{...styles.imageUploadBox, borderColor: isDragOver ? '#3b82f6' : '#e5e7eb', backgroundColor: isDragOver ? '#eff6ff' : '#f9fafb'}}
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
                      <span style={{color: '#374151', fontWeight: 500}}>Click or drag image</span>
                    </label>
                  )}
                </div>
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Item Name</label>
                <input required style={styles.input} placeholder="e.g. Butter Chicken" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} />
              </div>

              <div style={styles.row}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Price (₹)</label>
                  <input required type="number" style={styles.input} placeholder="0.00" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value})} />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Category</label>
                  <select style={styles.select} value={newItem.category} onChange={e=>setNewItem({...newItem, category:e.target.value})}>
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
                <textarea style={{...styles.input, minHeight: 100, resize: 'vertical'}} placeholder="Describe ingredients..." value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value})} />
              </div>

              <div style={styles.toggleRow}>
                <div style={styles.toggleLabel}>
                  <span style={{fontWeight: 600}}>Vegetarian</span>
                </div>
                <label style={styles.switch}>
                  <input type="checkbox" checked={newItem.isVeg} onChange={e=>setNewItem({...newItem, isVeg:e.target.checked})} />
                  <span style={styles.slider}></span>
                </label>
              </div>
            </form>

            <div style={styles.drawerFooter}>
              <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" onClick={handleAddItem} style={styles.saveBtn}>Save Item</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Sub-Component: Menu Card (Updated for B&W Effect) ---
const MenuCard = ({ item, onToggle }) => {
  const isAvailable = item.available;

  return (
    <div style={styles.card}>
      {/* We apply the B&W filter to the Image Wrapper and the Description Body 
        The footer (button) remains unaffected so it stands out 
      */}
      <div style={{
        ...styles.cardContentWrapper,
        filter: isAvailable ? 'none' : 'grayscale(100%)',
        opacity: isAvailable ? 1 : 0.6
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
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4}}>
            <h3 style={styles.cardTitle}>{item.name}</h3>
            <span style={styles.cardPrice}>₹{item.price}</span>
          </div>
          <p style={styles.cardDesc}>{item.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Footer remains outside of the grayscale wrapper */}
      <div style={styles.cardFooter}>
        <span style={styles.categoryTag}>{item.category}</span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id || item._id, item.available);
          }}
          style={{
            ...styles.statusToggle,
            // Logic Flipped:
            // If Available -> Warn to Mark Sold Out (Red)
            // If Sold Out -> Encourage to Mark In Stock (Green)
            backgroundColor: isAvailable ? '#FEF2F2' : '#ECFDF5', // Red-50 vs Green-50
            color: isAvailable ? '#DC2626' : '#059669', // Red-600 vs Green-600
            border: `1px solid ${isAvailable ? '#FECACA' : '#A7F3D0'}`
          }}
        >
          {/* Visual indicator dot */}
          <span style={{
            width: 8, height: 8, borderRadius: '50%', 
            backgroundColor: isAvailable ? '#DC2626' : '#059669'
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
    backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    width: '90%', maxWidth: '1200px', height: '85vh',
    backgroundColor: '#F9FAFB', borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: '1px solid #ffffff'
  },
  header: {
    padding: '1.5rem 2rem', backgroundColor: 'white',
    borderBottom: '1px solid #f3f4f6', display: 'flex', 
    justifyContent: 'space-between', alignItems: 'center'
  },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' },
  subtitle: { fontSize: '0.9rem', color: '#6b7280', margin: '4px 0 0' },
  iconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#6b7280', padding: 8, borderRadius: '50%', transition: 'all 0.2s',
    ':hover': { backgroundColor: '#f3f4f6', color: '#111' }
  },
  toolbar: {
    padding: '1rem 2rem', display: 'flex', gap: '1rem',
    alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', borderBottom: '1px solid #f3f4f6'
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    backgroundColor: '#f3f4f6', padding: '0.6rem 1rem', borderRadius: '12px',
    flex: 1, maxWidth: '400px', color: '#6b7280'
  },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' },
  primaryBtn: {
    backgroundColor: '#111827', color: 'white', border: 'none',
    padding: '0.7rem 1.2rem', borderRadius: '10px', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  content: { flex: 1, overflowY: 'auto', padding: '2rem' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  addNewCard: {
    border: '2px dashed #e5e7eb', borderRadius: '16px', backgroundColor: 'white',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', minHeight: '340px', color: '#6b7280', transition: 'all 0.2s',
    ':hover': { borderColor: '#111', color: '#111' }
  },
  addIconCircle: {
    width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f3f4f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    color: '#374151'
  },
  
  // Card Styles
  card: {
    backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
    border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s',
    minHeight: '340px', justifyContent: 'space-between'
  },
  cardContentWrapper: { transition: 'all 0.3s ease' },
  cardImageWrapper: { height: 180, position: 'relative', backgroundColor: '#f9fafb' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#d1d5db', fontWeight: 800 },
  badges: { position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 },
  vegBadge: { backgroundColor: 'white', borderRadius: 6, padding: 4, display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  cardBody: { padding: '1.25rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 },
  cardPrice: { fontSize: '1rem', fontWeight: 700, color: '#059669' },
  cardDesc: { fontSize: '0.85rem', color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  
  cardFooter: { 
    marginTop: 'auto', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #f9fafb',
    backgroundColor: 'white' // Ensures footer stays white even if body is grayscale
  },
  categoryTag: { fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: 6 },
  statusToggle: {
    padding: '8px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.02em'
  },
  
  skeletonCard: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', minHeight: '320px', border: '1px solid #f3f4f6' },
  backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 10000 },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '500px',
    backgroundColor: 'white', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)',
    zIndex: 10001, display: 'flex', flexDirection: 'column',
    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  drawerHeader: { padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  formContent: { flex: 1, overflowY: 'auto', padding: '2rem' },
  drawerFooter: { padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem', backgroundColor: '#f9fafb' },
  formSection: { marginBottom: '1.5rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 },
  input: { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' },
  select: { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', backgroundColor: 'white' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  imageUploadBox: { height: 200, border: '2px dashed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  uploadPlaceholder: { cursor: 'pointer', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  uploadIconWrapper: { width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', marginBottom: 12 },
  previewContainer: { width: '100%', height: '100%', position: 'relative' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  changeOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' },
  switch: { position: 'relative', display: 'inline-block', width: 44, height: 24 },
  slider: { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#e5e7eb', borderRadius: 34, transition: '.4s', ':before': { position: 'absolute', content: '""', height: 20, width: 20, left: 2, bottom: 2, backgroundColor: 'white', borderRadius: '50%', transition: '.4s' } },
  cancelBtn: { flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
};

export default MenuManager;