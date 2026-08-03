import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import TopBar from './TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const { dir } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden" dir={dir}>
      <TopBar />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)', scale: 0.98 }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, y: -20, filter: 'blur(8px)', scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-28 min-h-screen"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      
      <Navigation />
    </div>
  );
}
