import { Link, useLocation } from 'react-router-dom';
import { Compass, Map as MapIcon, Heart, Calendar, MessageSquare, User, LayoutDashboard, FileText, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { getNotifications } from '../api/notificationsApi';

export default function Navigation() {
  const location = useLocation();
  const { t, dir, language } = useLanguage();
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('role') || 'user';

  useEffect(() => {
    if (!isLoggedIn) return;
    const checkNotifications = () => {
      getNotifications()
        .then((data) => {
          setUnreadNotifications(data.some((n: any) => !n.isRead));
        })
        .catch(() => {});
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Role-based Navigation Items
  const getNavItems = () => {
    if (role === 'office' || role === 'provider') {
      return [
        { path: '/office-dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'اللوحة' : 'Dashboard' },
        { path: '/quotes', icon: FileText, label: language === 'ar' ? 'العروض' : 'Quotes' },
        { path: '/chats', icon: MessageSquare, label: language === 'ar' ? 'المحادثات' : 'Chats' },
        { path: '/profile', icon: User, label: language === 'ar' ? 'حسابي' : 'Profile' },
      ];
    }

    if (role === 'admin') {
      return [
        { path: '/office-dashboard', icon: LayoutDashboard, label: language === 'ar' ? 'التحكم' : 'Admin' },
        { path: '/packages', icon: Package, label: language === 'ar' ? 'البكجات' : 'Packages' },
        { path: '/chats', icon: MessageSquare, label: language === 'ar' ? 'المحادثات' : 'Chats' },
        { path: '/profile', icon: User, label: language === 'ar' ? 'الملف' : 'Profile' },
      ];
    }

    // Default Traveler / Guest Navigation
    return [
      { path: '/', icon: Compass, label: language === 'ar' ? 'استكشف' : 'Explore' },
      { path: '/wishlists', icon: Heart, label: language === 'ar' ? 'المفضلة' : 'Wishlist' },
      { path: '/bookings', icon: Calendar, label: language === 'ar' ? 'حجوزاتي' : 'Bookings' },
      { path: '/chats', icon: MessageSquare, label: language === 'ar' ? 'محادثة' : 'Chat' },
      { path: '/profile', icon: User, label: language === 'ar' ? 'حسابي' : 'Profile' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md md:hidden" dir={dir}>
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white shadow-2xl rounded-full px-5 py-2.5 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-emerald-500/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon className="w-5.5 h-5.5 relative z-10" strokeWidth={isActive ? 2.5 : 1.8} />
                {item.path === '/profile' && unreadNotifications && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 z-20"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 relative z-10 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
