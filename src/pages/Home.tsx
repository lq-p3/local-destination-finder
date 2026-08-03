import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { destinations as staticDestinations, categories } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import DestinationCardSkeleton from '../components/DestinationCardSkeleton';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

export default function Home() {
  const { t, language, dir } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState('All');
  const [liked, setLiked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('liked-places');
    return saved ? JSON.parse(saved) : {};
  });
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    localStorage.setItem('liked-places', JSON.stringify(liked));
  }, [liked]);

  useEffect(() => {
    setLoading(true);
    api.destinations.list()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        setDestinations(list.length > 0 ? list : staticDestinations);
      })
      .catch(err => {
        console.error("Failed to fetch dynamic destinations, using static fallback", err);
        setDestinations(staticDestinations);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeCategory !== 'All' || searchQuery || destinations.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % destinations.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeCategory, searchQuery, destinations.length]);

  const handleNextSlide = () => {
    if (destinations.length === 0) return;
    setCurrentSlide(prev => (prev + 1) % destinations.length);
  };

  const handlePrevSlide = () => {
    if (destinations.length === 0) return;
    setCurrentSlide(prev => (prev - 1 + destinations.length) % destinations.length);
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDestinations = destinations.filter(d => {
    const categoryMatch = activeCategory === 'All' || d.category === activeCategory;
    const nameToSearch = (language === 'ar' ? d.nameAr || d.name : d.nameEn || d.name || '').toLowerCase();
    const descriptionToSearch = (language === 'ar' ? d.descriptionAr || d.description : d.descriptionEn || d.description || '').toLowerCase();
    const searchMatch = !searchQuery || nameToSearch.includes(searchQuery.toLowerCase()) || descriptionToSearch.includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const showHero = activeCategory === 'All' && !searchQuery;
  const currentDestination = (destinations.length > 0 ? (destinations[currentSlide] || destinations[0]) : null);

  return (
    <div className="w-full min-h-screen bg-background pb-28" dir={dir}>
      {/* Immersive Full-Width Slideshow Hero Area at the absolute top */}
      {showHero && currentDestination && (
        <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden shadow-2xl mb-8 group">
          {loading ? (
            <div className="w-full h-full bg-slate-900 animate-pulse flex flex-col justify-between p-12 md:p-20">
              <div className="flex justify-center w-full mt-12">
                <div className="w-80 h-10 bg-white/10 rounded-full"></div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-32 h-6 bg-white/10 rounded-full"></div>
                <div className="w-3/4 h-16 bg-white/10 rounded-2xl"></div>
                <div className="w-1/2 h-6 bg-white/10 rounded-xl hidden md:block"></div>
                <div className="w-40 h-12 bg-white/10 rounded-full mt-2"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Animated Slideshow Background Images */}
              <div className="absolute inset-0 bg-slate-950 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={currentDestination.id || currentSlide}
                    src={currentDestination.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'}
                    alt={language === 'ar' ? currentDestination.nameAr || currentDestination.name : currentDestination.nameEn || currentDestination.name}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 0.8 },
                      scale: { duration: 6.5, ease: 'linear' }
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/45 z-10"></div>
              <div className="absolute inset-0 bg-secondary/15 mix-blend-overlay z-10"></div>

              {/* Interactive Top Regions Selector */}
              <div className="absolute top-28 inset-x-6 z-20 flex justify-center overflow-x-auto hide-scrollbar">
                <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-2xl flex gap-1.5 max-w-full">
                  {destinations.slice(0, 6).map((dest, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <button
                        key={dest.id || idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-300 whitespace-nowrap cursor-pointer border-none ${
                          isActive 
                            ? 'bg-white text-slate-900 shadow-xl scale-105' 
                            : 'bg-transparent text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {language === 'ar' ? dest.nameAr || dest.name : dest.nameEn || dest.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slide Content Card */}
              <div className={`absolute bottom-16 md:bottom-20 ${dir === 'rtl' ? 'right-8 left-16 md:right-16 md:left-24 text-right' : 'left-8 right-16 md:left-16 md:right-24 text-left'} z-20 text-white max-w-2xl flex flex-col gap-3.5`}>
                <motion.div 
                  key={`badge-${currentSlide}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider w-fit border border-white/20 shadow-md"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  {currentDestination.category || 'Destination'}
                </motion.div>

                <motion.h2 
                  key={`title-${currentSlide}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-md leading-tight"
                >
                  {language === 'ar' ? currentDestination.nameAr || currentDestination.name : currentDestination.nameEn || currentDestination.name}
                </motion.h2>

                <motion.p 
                  key={`desc-${currentSlide}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm md:text-base text-slate-200 font-light leading-relaxed drop-shadow-sm max-w-xl line-clamp-3"
                >
                  {language === 'ar' ? currentDestination.descriptionAr || currentDestination.description : currentDestination.descriptionEn || currentDestination.description}
                </motion.p>

                <motion.div
                  key={`btn-${currentSlide}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3"
                >
                  <Link 
                    to={`/destination/${currentDestination.id}`}
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-secondary text-white font-black text-xs rounded-full shadow-xl transition-all hover:scale-[1.03] active:scale-95 border-none cursor-pointer"
                  >
                    {language === 'ar' ? 'استكشف الوجهة' : 'Explore Destination'}
                  </Link>
                </motion.div>
              </div>

              {/* Glassmorphic Side Navigation Chevron Arrows */}
              <div className="absolute bottom-8 right-8 rtl:right-auto rtl:left-8 z-30 flex items-center gap-3">
                <button
                  onClick={handlePrevSlide}
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-white hover:text-slate-900 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                  aria-label="Previous Slide"
                >
                  {dir === 'rtl' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={handleNextSlide}
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-white hover:text-slate-900 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                  aria-label="Next Slide"
                >
                  {dir === 'rtl' ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </div>

              {/* Pagination Pill Indicators */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {destinations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-500 border-none cursor-pointer ${
                      idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/85'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-6 max-w-7xl mx-auto space-y-12">
        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 hide-scrollbar">
          {categories.map(catName => {
            const isActive = activeCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={`px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 whitespace-nowrap cursor-pointer border-none shadow-sm flex items-center gap-2 ${
                  isActive 
                    ? 'bg-secondary text-white shadow-secondary/30 scale-105' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-primary border border-slate-200'
                }`}
              >
                <span>{catName}</span>
              </button>
            );
          })}
        </div>

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-primary tracking-tight">
              {searchQuery 
                ? (language === 'ar' ? `نتائج البحث عن "${searchQuery}"` : `Search Results for "${searchQuery}"`)
                : (language === 'ar' ? 'أبرز الوجهات السياحية' : 'Featured Tourist Destinations')}
            </h2>
            <p className="text-sm text-slate-500 font-light mt-1">
              {language === 'ar' 
                ? 'استكشف أفضل الوجهات الطبيعية والتاريخية في جميع مناطق المملكة' 
                : 'Explore top natural and historical destinations across all Saudi regions'}
            </p>
          </div>
          
          <Link
            to="/explore"
            className="text-xs font-black text-secondary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{language === 'ar' ? 'عرض جميع الوجهات' : 'View All Destinations'}</span>
            <span>{dir === 'rtl' ? '←' : '→'}</span>
          </Link>
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DestinationCardSkeleton />
            <DestinationCardSkeleton />
            <DestinationCardSkeleton />
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ?
            </div>
            <h3 className="text-lg font-black text-primary">
              {language === 'ar' ? 'لم نثمل على وجهات مطابقة' : 'No Destinations Found'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'جرب البحث بكلمات مختلفة أو قم بإلغاء التصفية الحالية.' : 'Try adjusting your search terms or active filters.'}
            </p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchParams({}); }}
              className="px-6 py-2.5 bg-secondary text-white font-black text-xs rounded-full shadow-lg border-none cursor-pointer"
            >
              {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((dest, idx) => (
              <motion.div
                key={dest.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link 
                  to={`/destination/${dest.id}`}
                  className="group bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1"
                >
                  <div className="relative h-60 overflow-hidden bg-slate-900">
                    <img 
                      src={dest.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'} 
                      alt={language === 'ar' ? dest.nameAr || dest.name : dest.nameEn || dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    
                    <button
                      onClick={(e) => toggleLike(dest.id, e)}
                      className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer border-none"
                    >
                      <Heart className={`w-5 h-5 ${liked[dest.id] ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block border border-white/20">
                        {dest.category || 'Nature'}
                      </span>
                      <h3 className="text-xl font-black leading-tight drop-shadow-md">
                        {language === 'ar' ? dest.nameAr || dest.name : dest.nameEn || dest.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2">
                      {language === 'ar' ? dest.descriptionAr || dest.description : dest.descriptionEn || dest.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{dest.rating || 4.8}</span>
                        <span className="text-slate-400 font-normal">({dest.reviewsCount || 48})</span>
                      </div>

                      <span className="text-secondary font-black group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                        {language === 'ar' ? 'التفاصيل ←' : 'Details →'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
