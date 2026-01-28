import React, { useEffect, useState, useCallback } from 'react';
import { restaurantAPI } from '../api';

// --- Icons ---
const Icons = {
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Plus: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Leaf: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,8,17,8,17,8Z"/></svg>,
  Trash: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
};

const MenuManager = ({ restaurantId, onClose, onMenuChanged }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newImage, setNewImage] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Uncategorized',
    isVeg: true,
    available: true
  });

  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming API returns { sections: [...] }
      const data = await restaurantAPI.getMenu(restaurantId, true);
      // Flatten sections to list for display
      const sections = data.sections || [];
      const items = sections.reduce((acc, s) => acc.concat(s.data || []), []);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadMenu();
    // Disable background scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [loadMenu]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const item = {
        ...newItem,
        price: parseFloat(newItem.price),
        image: newImage
      };
      await restaurantAPI.addMenuItem(restaurantId, item);
      
      // Reset & Refresh
      setNewItem({ name: '', description: '', price: '', category: 'Uncategorized', isVeg: true, available: true });
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
    if (file) {
      if (file.size > 5000000) { alert("File too large (Max 5MB)"); return; }
      const reader = new FileReader();
      reader.onload = (event) => setNewImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleToggleAvailability = async (itemId, currentlyAvailable) => {
    // Optimistic UI Update
    setMenuItems(prev => prev.map(item => 
      (item.id === itemId || item._id === itemId) ? { ...item, available: !currentlyAvailable } : item
    ));
    try {
      await restaurantAPI.updateMenuItem(itemId, { available: !currentlyAvailable });
      onMenuChanged && onMenuChanged();
    } catch (err) {
      loadMenu(); // Revert on error
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="fade-in-up">
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Menu Manager</h2>
            <p style={styles.subtitle}>Managing {menuItems.length} items</p>
          </div>
          <button onClick={onClose} style={styles.closeBtnHeader}>
            <Icons.Close />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {loading ? (
             <div style={styles.centerMsg}>
               <div className="spinner"></div>
               <p style={{marginTop: 15}}>Loading Menu...</p>
             </div>
          ) : (
            <div style={styles.grid}>
              {/* Add New Button */}
              <button onClick={() => setShowAddForm(true)} style={styles.addNewCard}>
                <div style={styles.addIconCircle}><Icons.Plus /></div>
                <span>Add New Item</span>
              </button>

              {/* Items */}
              {menuItems.map(item => (
                <div key={item.id || item._id} style={{
                  ...styles.card,
                  opacity: item.available ? 1 : 0.7,
                  filter: item.available ? 'none' : 'grayscale(100%)'
                }}>
                  <div style={styles.cardImageContainer}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={styles.cardImage} />
                    ) : (
                      <div style={styles.cardPlaceholder}>{(item.name||'?')[0]}</div>
                    )}
                    <span style={{
                      ...styles.vegBadge,
                      backgroundColor: item.isVeg ? '#dcfce7' : '#fee2e2',
                      color: item.isVeg ? '#166534' : '#991b1b'
                    }}>
                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>

                  <div style={styles.cardDetails}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                       <h3 style={styles.itemName}>{item.name}</h3>
                       <span style={styles.itemPrice}>₹{item.price}</span>
                    </div>
                    <p style={styles.itemDesc}>{item.description || 'No description'}</p>
                    
                    <div style={styles.cardFooter}>
                      <span style={styles.catBadge}>{item.category}</span>
                      <button
                        onClick={() => handleToggleAvailability(item.id || item._id, item.available)}
                        style={{
                          ...styles.toggleBtn,
                          ...(item.available ? styles.btnActive : styles.btnInactive)
                        }}
                      >
                        {item.available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- ADD ITEM SLIDE-OVER FORM --- */}
        {showAddForm && (
          <div style={styles.formOverlay}>
            <div style={styles.backdrop} onClick={() => setShowAddForm(false)}></div>
            <form onSubmit={handleAddItem} style={styles.drawer}>
              
              <div style={styles.drawerHeader}>
                <h3>Add New Item</h3>
                <button type="button" onClick={() => setShowAddForm(false)} style={styles.closeBtn}>
                  <Icons.Close />
                </button>
              </div>

              <div style={styles.drawerBody}>
                {/* Image Upload */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Item Image</label>
                  <div style={styles.imageUpload}>
                    <input type="file" id="f-up" accept="image/*" onChange={handleImageChange} hidden />
                    {newImage ? (
                      <div style={styles.previewBox}>
                        <img src={newImage} alt="Preview" style={styles.imgPreview} />
                        <label htmlFor="f-up" style={styles.changeBtn}>Change</label>
                      </div>
                    ) : (
                      <label htmlFor="f-up" style={styles.uploadBtn}>
                        <Icons.Upload />
                        <span style={{fontSize:'0.85rem', marginTop:8}}>Upload Photo</span>
                      </label>
                    )}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Item Name</label>
                  <input required type="text" style={styles.input} 
                    value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} />
                </div>

                <div style={styles.row}>
                  <div style={{flex:1}}>
                    <label style={styles.label}>Price</label>
                    <input required type="number" step="1" style={styles.input} 
                      value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value})} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={styles.label}>Category</label>
                    <input type="text" style={styles.input} list="categories"
                      value={newItem.category} onChange={e=>setNewItem({...newItem, category:e.target.value})} />
                    <datalist id="categories">
                        <option value="Starters" />
                        <option value="Main Course" />
                        <option value="Beverages" />
                    </datalist>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea style={{...styles.input, minHeight:80}} 
                    value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value})} />
                </div>

                <div style={styles.checkboxWrapper}>
                  <input type="checkbox" checked={newItem.isVeg} 
                    onChange={e=>setNewItem({...newItem, isVeg:e.target.checked})} 
                    style={{width:20, height:20, accentColor:'#166534'}}/>
                  <span>Is Vegetarian?</span>
                </div>
              </div>

              <div style={styles.drawerFooter}>
                <button type="submit" style={styles.saveBtn}>Save Item</button>
              </div>
            </form>
          </div>
        )}

      </div>
      
      {/* Styles Injection for Animation */}
      <style>{`
        .fade-in-up { animation: fadeInUp 0.3s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spinner { width: 30px; height: 30px; border: 3px solid #e5e7eb; border-top-color: #059669; border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// --- Styles System ---
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Crucial: High Z-Index
    padding: '1rem'
  },
  modal: {
    backgroundColor: '#f3f4f6',
    width: '100%',
    maxWidth: '1100px',
    height: '90dvh', // Dynamic height
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    position: 'relative'
  },
  header: {
    padding: '1.25rem 2rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#111827' },
  subtitle: { margin: '4px 0 0 0', fontSize: '0.85rem', color: '#6b7280' },
  closeBtnHeader: {
    background: '#f3f4f6', border: 'none', borderRadius: '50%',
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#4b5563', transition: 'background 0.2s'
  },
  content: { flex: 1, overflowY: 'auto', padding: '2rem' },
  centerMsg: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
  
  // Grid & Cards
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
    paddingBottom: '2rem'
  },
  addNewCard: {
    border: '2px dashed #d1d5db', borderRadius: '12px', background: 'transparent',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '280px', cursor: 'pointer', color: '#6b7280', fontWeight: '600'
  },
  addIconCircle: {
    width: 50, height: 50, borderRadius: '50%', background: '#e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  card: {
    background: 'white', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
    transition: 'transform 0.2s'
  },
  cardImageContainer: { height: 160, background: '#e5e7eb', position: 'relative' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#9ca3af', fontWeight: 'bold' },
  vegBadge: { position: 'absolute', top: 8, right: 8, padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 'bold' },
  cardDetails: { padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' },
  itemName: { margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemPrice: { fontWeight: '700', color: '#059669' },
  itemDesc: { fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { fontSize: '0.75rem', background: '#f3f4f6', padding: '2px 8px', borderRadius: 10, color: '#4b5563' },
  toggleBtn: { padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', border: 'none' },
  btnActive: { background: '#d1fae5', color: '#065f46' },
  btnInactive: { background: '#fee2e2', color: '#991b1b' },

  // Drawer / Form
  formOverlay: {
    position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end'
  },
  backdrop: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' },
  drawer: {
    position: 'relative', width: '100%', maxWidth: '450px', background: 'white', height: '100%',
    boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
    animation: 'slideIn 0.3s ease-out'
  },
  drawerHeader: { padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  drawerBody: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  drawerFooter: { padding: '1.5rem', borderTop: '1px solid #e5e7eb', background: '#f9fafb' },
  formGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: '500', color: '#374151' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 6, outline: 'none' },
  row: { display: 'flex', gap: '1rem', marginBottom: '1.25rem' },
  imageUpload: { height: 180, border: '2px dashed #d1d5db', borderRadius: 8, background: '#f9fafb', position: 'relative' },
  uploadBtn: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' },
  previewBox: { width: '100%', height: '100%', position: 'relative' },
  imgPreview: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 },
  changeBtn: { position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' },
  checkboxWrapper: { display: 'flex', alignItems: 'center', gap: 10 },
  saveBtn: { width: '100%', padding: '0.85rem', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontWeight: '600', fontSize: '1rem', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }
};

export default MenuManager;