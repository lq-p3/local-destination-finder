import React, { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import { 
  Bell, Search, X, Check, Settings, Trash2, Shield, Eye,
  Menu, ChevronDown, Compass, MapPin, Luggage, Hotel, Map, Users, Sparkles, FileText, MessageSquare, LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../api/notificationsApi';
import { getSignalRConnection, startSignalRConnection } from '../realtime/signalRClient';
import { Notification, User } from '../../server/types';

export default function TopBar() {
  const { t, dir, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);

  // Notifications API states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifCategory, setNotifCategory] = useState<'all' | 'booking' | 'system'>('all');
  const [user, setUser] = useState<User | null>(null);

  // Settings fields
  const [settings, setSettings] = useState({
    bookings: true,
    offers: true,
    messages: true,
    system: true,
    weather: true
  });

  const loadNotifications = () => {
    if (!isLoggedIn) return;
    getNotifications()
      .then(res => setNotifications(res as any))
      .catch(console.error);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      api.auth.me()
        .then(res => {
          setUser(res);
          if (res.notificationSettings) {
            setSettings(res.notificationSettings);
          }
        })
        .catch(console.error);

      // Periodically refresh notifications
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const isHomePage = location.pathname === '/';
  const showTransparent = isHomePage && !isScrolled;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleSwitchRole = (newRole: string) => {
    api.auth.switchRole(newRole)
      .then(() => {
        // Refresh User point/badge state
        api.auth.me().then(setUser);
        // Dispatch event for components to listen
        window.dispatchEvent(new Event('storage'));
        alert(language === 'ar' ? `تم تغيير نوع الحساب بنجاح لـ: ${newRole}` : `Switched simulation account role to: ${newRole}`);
      })
      .catch(console.error);
  };

  const markAllAsRead = () => {
    markAllNotificationsRead()
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      })
      .catch(console.error);
  };

  const handleReadNotification = (n: Notification) => {
    markNotificationRead(n.id)
      .then(() => {
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
        if (n.link) {
          navigate(n.link);
        }
        setShowNotifications(false);
      })
      .catch(console.error);
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id)
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(console.error);
  };

  const handleSaveSettings = () => {
    api.notifications.saveSettings(settings)
      .then(() => {
        setShowNotifSettings(false);
      })
      .catch(console.error);
  };

  const filteredNotifications = notifications.filter(n => {
    if (notifCategory === 'all') return true;
    if (notifCategory === 'booking') return n.type === 'booking';
    return n.type === 'system' || n.type === 'weather' || n.type === 'offer';
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const currentRole = user?.role || 'user';

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[1010] px-6 py-4 flex items-center justify-between transition-all duration-300 ${
        showTransparent 
          ? 'bg-gradient-to-b from-black/60 via-black/35 to-transparent border-b border-transparent text-white' 
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm text-slate-800'
      }`} 
      dir={dir}
    >
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="LDF Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className={`hidden text-2xl font-black tracking-tighter ${showTransparent ? 'text-white' : 'text-primary'}`}>LDF</span>
        </Link>
        
        {/* Services Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowServicesMenu(!showServicesMenu)}
            className={`flex items-center gap-2 h-10 px-4.5 rounded-full text-xs font-black transition-all cursor-pointer select-none border shrink-0 ${
              showTransparent
                ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span>{language === 'ar' ? 'الخدمات السياحية' : 'Services'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showServicesMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showServicesMenu && (
            <>
              {/* Click-away backdrop */}
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowServicesMenu(false)}
              />
              {/* Dropdown Menu Panel */}
              <div 
                className={`absolute top-12 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-64 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 flex flex-col gap-1 text-slate-800`}
                onClick={() => setShowServicesMenu(false)}
              >
                <Link 
                  to="/" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Compass className="w-4 h-4 text-secondary" />
                  <span>{t('explore')}</span>
                </Link>

                <Link 
                  to="/regions" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/regions' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span>{t('regions')}</span>
                </Link>

                <Link 
                  to="/packages" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/packages' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Luggage className="w-4 h-4 text-secondary" />
                  <span>{t('packages')}</span>
                </Link>

                <Link 
                  to="/accommodations" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/accommodations' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Hotel className="w-4 h-4 text-secondary" />
                  <span>{t('lodgings')}</span>
                </Link>

                <Link 
                  to="/map" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/map' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Map className="w-4 h-4 text-secondary" />
                  <span>{t('map')}</span>
                </Link>

                <Link 
                  to="/guides" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/guides' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 text-secondary" />
                  <span>{t('guides')}</span>
                </Link>

                <Link 
                  to="/ai-planner" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/ai-planner' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span>{t('aiPlanner')}</span>
                </Link>

                <Link 
                  to="/quotes" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/quotes' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-secondary" />
                  <span>{t('quotes')}</span>
                </Link>

                <Link 
                  to="/chats" 
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-colors ${
                    location.pathname === '/chats' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-secondary" />
                  <span>{t('chats')}</span>
                </Link>

                {(currentRole === 'office' || currentRole === 'admin') && (
                  <Link 
                    to="/office-dashboard" 
                    className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black border-t border-slate-100 transition-colors ${
                      location.pathname === '/office-dashboard' ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-secondary" />
                    <span>{t('officeDashboard')}</span>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 relative">
        {/* Desktop Search */}
        <form onSubmit={handleSearchSubmit} className="relative group hidden md:block mr-2 w-60 lg:w-72">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('searchDestinations')} 
            className={`w-full h-10 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${
              showTransparent 
                ? 'bg-white/15 text-white placeholder-white/60 focus:bg-white/25 focus:ring-white/40' 
                : 'bg-slate-100 text-slate-800 placeholder-slate-400 focus:ring-secondary focus:bg-white'
            } border-none rounded-full text-xs transition-all outline-none`} 
          />
          <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-2.5 w-5 h-5 transition-colors ${showTransparent ? 'text-white/60 group-hover:text-white' : 'text-slate-400 group-hover:text-secondary'}`} />
        </form>

        {/* Mobile Search Trigger */}
        <button 
          onClick={() => navigate('/')} 
          className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            showTransparent ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Language Toggler */}
        <button 
          onClick={toggleLanguage}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
            showTransparent ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {language === 'en' ? 'عربي' : 'EN'}
        </button>



        {isLoggedIn ? (
          <>
            {/* Notifications Bell Button */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowNotifSettings(false);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-colors cursor-pointer shrink-0 ${
                  showTransparent ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className={`absolute top-1.5 ${dir === 'rtl' ? 'left-2' : 'right-2'} w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white`}></span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className={`absolute top-12 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4.5 z-50 flex flex-col gap-3 text-slate-800`}>
                  
                  {/* Settings toggle / Main Panel */}
                  {!showNotifSettings ? (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-sm text-primary">{t('notificationTitle')}</span>
                          <button
                            onClick={() => setShowNotifSettings(true)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer border-none"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {notifications.length > 0 && (
                          <div className="flex gap-2">
                            <button 
                              onClick={markAllAsRead} 
                              className="text-[10px] font-bold text-secondary hover:underline cursor-pointer border-none bg-transparent"
                            >
                              {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Notification Filters */}
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-150 gap-0.5">
                        {(['all', 'booking', 'system'] as const).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setNotifCategory(cat)}
                            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all border-none cursor-pointer ${
                              notifCategory === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                            }`}
                          >
                            {cat === 'all' ? (language === 'ar' ? 'الكل' : 'All') : cat === 'booking' ? (language === 'ar' ? 'حجوزات' : 'Bookings') : (language === 'ar' ? 'نظام وطقس' : 'System')}
                          </button>
                        ))}
                      </div>

                      {/* Notifications List */}
                      <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-0.5">
                        {filteredNotifications.length === 0 ? (
                          <div className="text-center py-6 text-xs font-semibold text-slate-400">
                            {t('noNotifications')}
                          </div>
                        ) : (
                          filteredNotifications.map((n) => {
                            const title = language === 'ar' ? n.titleAr : n.titleEn;
                            const text = language === 'ar' ? n.contentAr : n.contentEn;
                            return (
                              <div 
                                key={n.id} 
                                onClick={() => handleReadNotification(n)}
                                className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 transition-colors cursor-pointer group hover:bg-slate-50 ${
                                  n.isRead ? 'bg-slate-50/50 border-slate-100 text-slate-400' : 'bg-blue-50/40 border-blue-100 text-slate-700 font-medium'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-slate-300' : 'bg-secondary'}`}></span>
                                <div className="flex-1">
                                  <span className="font-extrabold text-slate-800 block mb-0.5">{title}</span>
                                  <span>{text}</span>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteNotification(n.id, e)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-300 group-hover:text-red-500 cursor-pointer border-none bg-transparent"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  ) : (
                    /* Notification Preferences settings view */
                    <div className="flex flex-col gap-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="font-extrabold text-sm text-primary">{language === 'ar' ? 'إعدادات التنبيهات' : 'Alert Settings'}</span>
                        <button
                          onClick={() => setShowNotifSettings(false)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer border-none bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {Object.entries({
                          bookings: language === 'ar' ? 'تأكيدات الحجز والرحلات' : 'Bookings and trips updates',
                          offers: language === 'ar' ? 'العروض والتخفيضات' : 'Offers and reductions',
                          messages: language === 'ar' ? 'رسائل المرشدين ومكاتب السفر' : 'Messages from local guides',
                          system: language === 'ar' ? 'تنبيهات حالة المكان المضاف' : 'Contributions updates',
                          weather: language === 'ar' ? 'تنبيهات الطقس والطرق' : 'Weather alerts & closures'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer group text-xs text-slate-700 font-semibold select-none">
                            <input
                              type="checkbox"
                              checked={settings[key as keyof typeof settings]}
                              onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={handleSaveSettings}
                        className="w-full py-2.5 mt-2 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:scale-[1.01] transition-transform border-none cursor-pointer"
                      >
                        {language === 'ar' ? 'حفظ الخيارات' : 'Save Settings'}
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <Link to="/profile" className="w-10 h-10 rounded-full bg-primary p-0.5 shadow-md overflow-hidden cursor-pointer border-2 border-white flex items-center justify-center shrink-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full rounded-full object-cover" />
            </Link>
          </>
        ) : (
          <Link 
            to="/login" 
            className="px-5 py-2 bg-gradient-to-r from-secondary to-blue-700 text-white rounded-full text-xs font-extrabold shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center border-none cursor-pointer shrink-0"
          >
            {t('login')}
          </Link>
        )}
      </div>
    </div>
  );
}

