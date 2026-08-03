import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Calendar, ArrowRight, ArrowLeft, AlertTriangle, RefreshCw, Inbox } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { getRegions } from '../api/regionsApi';
import { mapRegionApiToRegion } from '../mappers/regionMapper';
import { Region } from '../../server/types';

export default function Regions() {
  const { t, language, dir } = useLanguage();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getRegions(signal)
      .then(apiData => {
        const mapped = apiData.map(mapRegionApiToRegion);
        setRegions(mapped);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch regions from ASP.NET Core Backend:', err);
        setError(language === 'ar' ? 'فشل الاتصال بالخادم لجلب المناطق السياحية.' : 'Failed to connect to backend server for regions.');
      })
      .finally(() => setLoading(false));
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRegions(controller.signal);
    return () => controller.abort();
  }, [fetchRegions]);

  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-24" dir={dir}>
      <header className="mb-10 text-center md:text-start">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-secondary font-bold text-sm tracking-wider uppercase"
        >
          {language === 'ar' ? 'استكشف جغرافية المملكة' : 'Explore Saudi Geography'}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-primary mt-1"
        >
          {t('regions')}
        </motion.h1>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-96 rounded-[32px] bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="w-full bg-red-50/60 border border-red-100 rounded-[32px] p-10 text-center flex flex-col items-center justify-center gap-4 my-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-xl">{language === 'ar' ? 'تعذر تحميل المناطق' : 'Failed to Load Regions'}</h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">{error}</p>
          <button
            onClick={() => fetchRegions()}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition-all border-none cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
          </button>
        </div>
      ) : regions.length === 0 ? (
        <div className="w-full bg-slate-50 border border-slate-100 rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-3 my-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-1">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600">
            {language === 'ar' ? 'لا توجد مناطق سياحية متاحة حالياً.' : 'No regions available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regions.map((region, idx) => {
            const name = language === 'ar' ? region.nameAr : region.nameEn;
            const desc = language === 'ar' ? region.descriptionAr : region.descriptionEn;
            const visit = language === 'ar' ? region.bestTimeToVisitAr : region.bestTimeToVisitEn;

            return (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-96 rounded-[32px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100"
              >
                {/* Cover Image */}
                <img 
                  src={region.coverImage} 
                  alt={name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                />

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-secondary/10 mix-blend-overlay z-10"></div>

                {/* Content */}
                <div className="absolute inset-x-6 bottom-6 z-20 text-white flex flex-col gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider w-fit border border-white/25">
                    <Calendar className="w-3 h-3" />
                    {visit}
                  </span>

                  <h2 className="text-2xl font-black tracking-tight">{name}</h2>
                  <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-light">{desc}</p>
                  
                  <Link 
                    to={`/region/${region.id}`}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-secondary hover:text-blue-300 w-fit transition-colors"
                  >
                    <span>{language === 'ar' ? 'تصفح مدن المنطقة' : 'Browse Region Cities'}</span>
                    <BackIcon className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

