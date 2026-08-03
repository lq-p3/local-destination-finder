import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function AuthLayout() {
  const { dir, language, setLanguage } = useLanguage();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden" dir={dir}>
      <button 
        onClick={toggleLanguage}
        className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 transition-colors`}
      >
        {language === 'en' ? 'عربي' : 'EN'}
      </button>

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          {/* Using /logo.png which you uploaded. The fallback handles if the path is slightly different. */}
          <img
            src="/logo.png"
            alt="LDF Logo"
            className="h-32 w-auto object-contain drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
              e.currentTarget.nextElementSibling?.classList.add('flex');
            }}
          />
          <div className="hidden flex-col items-center justify-center">
             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white mb-2">LDF</div>
             <span className="font-bold text-primary tracking-widest text-sm">LOCAL DESTINATION FINDER</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)', scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
