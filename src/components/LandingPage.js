import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Store, 
  CreditCard, 
  ChevronRight, 
  Smartphone, 
  Search, 
  CheckCircle2,
  Menu,
  X,
  Heart,
  Star,
  MapPin,
  Home,
  User,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>MR-BITES</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#features" className="text-gray-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-brand-600 transition-colors">How it Works</a>
            <a href="#vendors" className="text-gray-600 hover:text-brand-600 transition-colors">For Vendors</a>
            <button onClick={() => navigate('/login')} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
              Vendor Login
            </button>
          </div>

          <button 
            className="md:hidden text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-white shadow-xl py-4 px-4 flex flex-col gap-4 border-t border-gray-100 md:hidden"
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">How it Works</a>
          <a href="#vendors" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">For Vendors</a>
          <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="bg-brand-600 text-white px-5 py-3 rounded-xl font-medium mt-2">
            Vendor Login
          </button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-brand-50">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-100 rounded-bl-[100px] opacity-50 -z-0 hidden md:block"></div>
      <div className="absolute -top-4 -right-24 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-48 -left-24 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/2 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-brand-100 text-brand-600 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Campus Food Delivery
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900 tracking-tight">
              Skip the Queue.<br/>
              <span className="text-brand-600">Order Smart.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Order food from your campus outlets instantly. Pay online, skip the waiting lines, and save your precious time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 shadow-lg">
                <Smartphone size={24} />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-1">Coming Soon</div>
                  <div className="text-sm font-semibold leading-none">App Store</div>
                </div>
              </button>
              <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 shadow-sm">
                <Smartphone size={24} className="text-brand-600" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 leading-none mb-1">Coming Soon</div>
                  <div className="text-sm font-semibold leading-none">Play Store</div>
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full md:w-1/2 relative flex justify-center"
          >
            <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[40px] border-[8px] border-gray-900 shadow-2xl overflow-hidden z-10">
              {/* Mock App UI */}
              <div className="absolute inset-0 bg-[#F9FAFB] flex flex-col">
                {/* Header Section */}
                <div className="bg-[#056548] px-4 pt-8 pb-10 relative">
                  {/* Status Bar Mock */}
                  <div className="absolute top-2 left-0 right-0 flex justify-between px-5">
                    <span className="text-[10px] text-white font-medium">9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-3 h-2 bg-white rounded-[2px] opacity-90"></div>
                      <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
                    </div>
                  </div>
                  
                  {/* Greeting Row */}
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-[8px] text-white/70 font-bold tracking-wider mb-0.5">GOOD AFTERNOON</p>
                      <p className="text-white text-lg font-extrabold tracking-tight font-italic">Chirag 👋</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/30 bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">C</span>
                    </div>
                  </div>
                </div>

                {/* Body Section */}
                <div className="flex-1 relative px-4">
                  {/* Search Bar (Overlapping) */}
                  <div className="absolute -top-5 left-4 right-4 h-10 bg-white rounded-xl shadow-md flex items-center px-3 border border-transparent z-20">
                    <Search size={14} className="text-gray-400 mr-2" />
                    <span className="text-xs text-gray-400 font-medium">Search restaurants...</span>
                  </div>

                  {/* Scroll Content */}
                  <div className="pt-8 pb-4 h-full overflow-hidden flex flex-col gap-3">
                    
                    {/* Wishlist Banner */}
                    <div className="bg-[#FFF8F1] border border-[#FFEDD5] rounded-2xl p-3 flex justify-between items-center shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10 w-[70%]">
                        <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0">
                          <Heart size={14} className="text-[#EF4444]" fill="#EF4444" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 mb-0.5">Your Favorites</p>
                          <p className="text-[8px] leading-[10px] text-gray-500 pr-2">Tap ❤️ on dishes you love to save them!</p>
                        </div>
                      </div>
                      <div className="w-12 h-10 bg-orange-200 rounded-lg overflow-hidden relative z-10 shrink-0">
                         <img src="/logo.png" alt="" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#056548] rounded-full flex items-center justify-center border border-[#FFF8F1]">
                           <span className="text-white text-[8px] font-bold">→</span>
                         </div>
                      </div>
                    </div>

                    {/* Section Header */}
                    <div className="flex justify-between items-end mt-1 mb-0.5">
                      <h3 className="text-sm font-extrabold text-gray-900">Nearby Outlets</h3>
                      <span className="text-[9px] text-gray-500 font-bold">3 places</span>
                    </div>

                    {/* Restaurant Card 1 */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                         <img src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=200" alt="Nescafe" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 py-0.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-gray-900 truncate pr-1">Nescafe</h4>
                            <div className="flex items-center bg-amber-50 px-1 py-0.5 rounded text-[8px] font-bold text-amber-700">
                              <Star size={8} fill="currentColor" className="mr-0.5" /> 4.8
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-500 mt-0.5 flex items-center">
                            <MapPin size={8} className="mr-0.5" /> Library Block A
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div>
                            <span className="text-[8px] font-bold text-emerald-600 uppercase">5-10 min</span>
                          </div>
                          <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 text-[10px] font-bold">›</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Restaurant Card 2 */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                         <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=200" alt="CHAIGARAM" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 py-0.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-gray-900 truncate pr-1">CHAIGARAM</h4>
                            <div className="flex items-center bg-amber-50 px-1 py-0.5 rounded text-[8px] font-bold text-amber-700">
                              <Star size={8} fill="currentColor" className="mr-0.5" /> 4.5
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-500 mt-0.5 flex items-center">
                            <MapPin size={8} className="mr-0.5" /> Main Gate
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div>
                            <span className="text-[8px] font-bold text-emerald-600 uppercase">10 min</span>
                          </div>
                          <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 text-[10px] font-bold">›</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-4 left-4 right-4 z-50">
                  {/* Floating Action Button (Center) */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#056548] rounded-full flex items-center justify-center shadow-lg border-[3px] border-white z-20">
                    <ShoppingBag size={20} className="text-white" />
                  </div>
                  
                  {/* Glassmorphic Pill */}
                  <div className="bg-white/90 backdrop-blur-md rounded-[24px] h-[52px] flex items-center justify-between px-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-gray-100">
                    <div className="flex flex-col items-center justify-center w-9 h-full relative">
                      <Home size={18} className="text-[#056548]" fill="#056548" />
                      <div className="w-1 h-1 bg-[#056548] rounded-full absolute bottom-1"></div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-9 h-full">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    
                    {/* Spacer for FAB */}
                    <div className="w-12 h-full"></div>
                    
                    <div className="flex flex-col items-center justify-center w-9 h-full relative">
                      <ShoppingCart size={18} className="text-gray-400" />
                      <div className="absolute top-2 right-0 bg-red-500 w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white">
                        <span className="text-[6px] font-bold text-white leading-none">2</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-9 h-full">
                      <Heart size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements behind phone */}
            <div className="absolute top-1/4 -right-12 bg-white p-4 rounded-2xl shadow-xl glass-card z-20 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">Order Ready!</p>
                  <p className="text-xs text-gray-500">Pick up at Counter 2</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Clock size={28} />,
      title: "Fast Ordering",
      description: "Browse menus and place orders in seconds. No more standing in long lines during breaks.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <div className="w-10 h-10 overflow-hidden rounded-xl"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>,
      title: "No Waiting",
      description: "Get notified when your food is ready. Just walk up to the counter and collect it.",
      color: "bg-brand-100 text-brand-600"
    },
    {
      icon: <Store size={28} />,
      title: "Multiple Vendors",
      description: "Access all your campus canteens and cafes from a single, unified app interface.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <CreditCard size={28} />,
      title: "Easy Payments",
      description: "Pay securely via UPI, cards, or net banking directly from your phone.",
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 tracking-tight">Everything you need</h2>
          <p className="text-lg text-gray-600">Designed specifically for students to make campus dining effortless and completely frictionless.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl border border-gray-100 hover:border-brand-100 hover:shadow-xl transition-all duration-300 group bg-gray-50/50 hover:bg-white"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { num: "01", title: "Browse Menu", desc: "Select your favorite campus outlet and view their full menu." },
    { num: "02", title: "Place Order", desc: "Customize your items and add them to your cart." },
    { num: "03", title: "Pay Online", desc: "Complete payment quickly using UPI or other digital methods." },
    { num: "04", title: "Pick Up Food", desc: "Collect your food immediately when you receive the ready notification." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-900 text-white overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">How MR-BITES Works</h2>
          <p className="text-lg text-gray-400">Four simple steps to get your food without the hassle of waiting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full border-t-2 border-dashed border-gray-700"></div>
              )}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-gray-800 border-4 border-gray-900 rounded-full flex items-center justify-center text-2xl font-bold text-brand-500 mb-6 shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Vendors = () => {
  const navigate = useNavigate();

  return (
    <section id="vendors" className="py-24 bg-brand-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold mb-6 w-max">
              <Store size={16} />
              For Canteen Owners
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">Grow your business with MR-BITES</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Digitize your campus outlet. Manage orders efficiently, reduce counter chaos, and increase your daily sales with our smart vendor system.
            </p>
            <ul className="space-y-4 mb-10">
              {['Increase daily order volume', 'Streamlined digital payments', 'Real-time order management dashboard'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-brand-500 flex-shrink-0" size={20} />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/login')} className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-md w-max font-medium">
              Join as Vendor / Login <ChevronRight size={20} />
            </button>
          </div>
          <div className="w-full md:w-1/2 bg-brand-600 relative overflow-hidden min-h-[400px]">
             {/* Abstract pattern or dashboard mock */}
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px'}}></div>
             <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] bg-white rounded-2xl shadow-2xl p-6 rotate-[-5deg]"
             >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Vendor Dashboard</h3>
                    <p className="text-sm text-gray-500">Live Orders</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Online</div>
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                      <div>
                        <p className="font-bold">Order #{8492 + i}</p>
                        <p className="text-sm text-gray-500">2x Burger, 1x Coke</p>
                      </div>
                      <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">MR-BITES</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="text-gray-500 hover:text-brand-600 font-medium">Features</a>
            <a href="#vendors" className="text-gray-500 hover:text-brand-600 font-medium">For Vendors</a>
            <a href="mailto:hello@mr-bites.com" className="text-gray-500 hover:text-brand-600 font-medium">Contact</a>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} MR-BITES. All rights reserved.</p>
          <p className="text-gray-500 font-medium flex items-center gap-1">
            Made with <span className="text-brand-500">❤️</span> for students
          </p>
        </div>
      </div>
    </footer>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Vendors />
      <Footer />
    </div>
  );
}

export default LandingPage;
