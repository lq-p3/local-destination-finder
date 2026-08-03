import { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Clock, Heart, ChevronRight, ChevronLeft, Moon, Globe, LogOut, Compass, Award, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { t, language, setLanguage, dir } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const Chevron = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const settingsItems = [
    { icon: Heart, label: t('wishlist'), value: t('placesCount'), onClick: () => navigate('/wishlists') },
    { icon: Bookmark, label: t('myBookings'), value: t('upcomingCount'), onClick: () => navigate('/bookings') },
    { icon: Clock, label: t('travelHistory'), value: t('tripsCount') },
    { icon: Compass, label: t('addPlace'), value: '', onClick: () => navigate('/add-place') },
    { icon: Globe, label: t('language'), value: language === 'en' ? 'English' : 'العربية', onClick: toggleLanguage },
    { icon: Moon, label: t('darkMode'), value: darkMode ? t('on') : t('off'), isToggle: true, onClick: toggleDarkMode },
    { icon: LogOut, label: t('logout'), value: '', onClick: handleLogout, isDanger: true },
  ];

  return (
    <div className="pt-24 px-6 max-w-2xl mx-auto" dir={dir}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="w-24 h-24 rounded-full bg-secondary p-1 mb-4 shadow-lg border-4 border-white">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover" 
          />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">{userName}</h1>
        <p className="text-slate-500 font-medium">{userEmail}</p>

        {user && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-black rounded-full text-xs uppercase tracking-wider">
                {user.role}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-secondary font-black rounded-full text-xs border border-blue-100 shadow-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-secondary animate-pulse" />
                {user.points || 0} {t('points')}
              </span>
            </div>
            {user.badges && user.badges.map((badge: string, i: number) => (
              <span key={i} className="text-[9px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-secondary" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <div className="space-y-4 mb-24">
        {settingsItems.map((item, i) => (
          <motion.div
            key={item.label}
            onClick={item.onClick}
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white border border-slate-200 shadow-sm rounded-[24px] p-4 flex items-center justify-between cursor-pointer group hover:bg-slate-50 transition-colors ${
              item.isDanger ? 'hover:bg-red-50/40' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                item.isDanger 
                  ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' 
                  : 'bg-slate-100 text-slate-600 group-hover:bg-secondary group-hover:text-white'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`font-bold ${item.isDanger ? 'text-red-500' : 'text-slate-800'}`}>{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              {item.value && !item.isToggle && <span className="text-sm font-semibold text-slate-400">{item.value}</span>}
              {item.isToggle ? (
                <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-secondary' : 'bg-slate-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm border border-slate-200 transition-all ${
                    darkMode 
                      ? (dir === 'rtl' ? 'right-6.5' : 'left-6.5') 
                      : (dir === 'rtl' ? 'right-0.5' : 'left-0.5')
                  }`}></div>
                </div>
              ) : (
                <Chevron className={`w-5 h-5 text-slate-300 transition-colors ${
                  item.isDanger ? 'group-hover:text-red-500' : 'group-hover:text-primary'
                }`} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


