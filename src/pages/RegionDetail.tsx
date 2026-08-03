import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Calendar, CloudSun, MapPin, 
  Star, Compass, Utensils, Heart, Share2, Award, Users, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { getRegionById } from '../api/regionsApi';
import { mapRegionApiToRegion, mapCityApiToCity } from '../mappers/regionMapper';
import { Region, City, Destination, Package } from '../../server/types';

export default function RegionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  
  const [region, setRegion] = useState<Region | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cities' | 'destinations' | 'packages' | 'culture'>('cities');

  const fetchRegionDetails = useCallback((signal?: AbortSignal) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getRegionById(id, signal)
      .then(res => {
        setRegion(mapRegionApiToRegion(res.region));
        setCities(res.cities.map(mapCityApiToCity));
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch region details from ASP.NET Core:', err);
        if (err.status === 404) {
          setError('404');
        } else {
          setError(language === 'ar' ? 'تعذر جلب تفاصيل المنطقة من الخادم.' : 'Failed to fetch region details from server.');
        }
      })
      .finally(() => setLoading(false));
  }, [id, language]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRegionDetails(controller.signal);
    return () => controller.abort();
  }, [fetchRegionDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error === '404' || !region) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center flex flex-col items-center justify-center gap-4" dir={dir}>
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">
          {language === 'ar' ? 'المنطقة غير موجودة' : 'Region Not Found'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          {language === 'ar' ? 'عذراً، تعذر العثور على المنطقة السياحية المطلوبة. قد تكون تمت إزالتها أو أن الرابط غير صحيح.' : 'Sorry, the requested region could not be found. It may have been removed or the URL is invalid.'}
        </p>
        <Link 
          to="/regions" 
          className="mt-3 px-6 py-3 bg-primary text-white text-xs font-bold rounded-full shadow-md hover:bg-slate-800 transition-all border-none"
        >
          {language === 'ar' ? 'العودة إلى قائمة المناطق' : 'Back to Regions'}
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center flex flex-col items-center justify-center gap-4" dir={dir}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">
          {language === 'ar' ? 'خطأ في الاتصال' : 'Connection Error'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchRegionDetails()}
          className="mt-3 inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition-all border-none cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
        </button>
      </div>
    );
  }

  const name = language === 'ar' ? region.nameAr : region.nameEn;
  const desc = language === 'ar' ? region.descriptionAr : region.descriptionEn;
  const bestTime = language === 'ar' ? region.bestTimeToVisitAr : region.bestTimeToVisitEn;
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const tabs = [
    { key: 'cities', label: language === 'ar' ? 'المدن والمحافظات' : 'Cities & Towns' },
    { key: 'destinations', label: language === 'ar' ? 'الوجهات الشهيرة' : 'Famous Spots' },
    { key: 'packages', label: language === 'ar' ? 'البكجات السياحية' : 'Tour Packages' },
    { key: 'culture', label: language === 'ar' ? 'التجارب والأكلات' : 'Local Culture' },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-28" dir={dir}>
      {/* Cover Header */}
      <div className="relative h-[50vh] w-full rounded-b-[40px] overflow-hidden shadow-lg">
        <img 
          src={region.coverImage} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Navigation Action Buttons */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pt-20">
          <button 
            onClick={() => navigate('/regions')}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer border-none"
          >
            <BackIcon className="w-6 h-6" />
          </button>
          <button 
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer border-none"
          >
            <Share2 className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className={`absolute bottom-8 ${dir === 'rtl' ? 'right-8 text-right' : 'left-8 text-left'} right-8 z-10 text-white`}>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-blue-50/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              {language === 'ar' ? 'استكشف المنطقة' : 'Explore Region'}
            </span>
            <h1 className="text-4xl md:text-6xl font-black mt-2.5 tracking-tight">{name}</h1>
        </div>
      </div>

      {/* Intro info box */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Description */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-primary mb-3">
              {language === 'ar' ? `نبذة عن ${name}` : `About ${name}`}
            </h2>
            <p className="text-slate-600 leading-relaxed font-light text-sm">
              {desc}
            </p>
          </div>

          {/* Quick info card */}
          <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3.5 border-b border-white/10">
              <Calendar className="w-6 h-6 text-secondary shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{t('bestTimeToVisit')}</span>
                <span className="text-xs font-bold text-slate-100">{bestTime}</span>
              </div>
            </div>

            {/* Weather status summary for main city */}
            {cities.length > 0 && (
              <div className="flex items-center gap-3">
                <CloudSun className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{language === 'ar' ? 'الطقس الحالي' : 'Current Weather'}</span>
                  <span className="text-xs font-bold text-slate-100">
                    {cities[0].nameEn}: {cities[0].weather.temp}°C, {language === 'ar' ? cities[0].weather.statusAr : cities[0].weather.statusEn}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Tabbed view content */}
        <div className="mt-12">
          {/* Tabs header */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-2.5 border-b border-slate-200 mb-8 -mx-6 px-6 lg:mx-0 lg:px-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white text-slate-500 hover:text-primary border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tabs Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* --- 1. Cities Tab --- */}
              {activeTab === 'cities' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cities.map((city) => {
                    const cName = language === 'ar' ? city.nameAr : city.nameEn;
                    const cDesc = language === 'ar' ? city.descriptionAr : city.descriptionEn;
                    return (
                      <div 
                        key={city.id}
                        className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            src={city.coverImage} 
                            alt={cName} 
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-[10px] font-black tracking-widest text-white px-2.5 py-1 rounded-full border border-white/10">
                            {city.weather.temp}°C {language === 'ar' ? city.weather.statusAr : city.weather.statusEn}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-black text-primary mb-1.5">{cName}</h3>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">{cDesc}</p>
                          
                          <button 
                            onClick={() => navigate(`/?search=${encodeURIComponent(cName)}`)}
                            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-100"
                          >
                            <MapPin className="w-3.5 h-3.5 text-secondary" />
                            {language === 'ar' ? 'تصفح وجهات المدينة' : 'Browse City Spots'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- 2. Destinations Tab --- */}
              {activeTab === 'destinations' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 font-bold">
                      {language === 'ar' ? 'لا توجد أماكن مسجلة في هذه المنطقة حالياً.' : 'No destinations registered under this region yet.'}
                    </div>
                  ) : (
                    destinations.map((dest) => {
                      const dName = language === 'ar' ? dest.nameAr : dest.nameEn;
                      const dCat = language === 'ar' ? t(dest.category.toLowerCase()) : dest.category;
                      return (
                        <Link 
                          key={dest.id}
                          to={`/destination/${dest.id}`}
                          className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm group hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-44 overflow-hidden relative">
                              <img 
                                src={dest.image} 
                                alt={dName} 
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-5">
                              <span className="text-[10px] font-black text-secondary tracking-widest block uppercase mb-1.5">{dCat}</span>
                              <h3 className="text-lg font-black text-primary mb-2">{dName}</h3>
                              <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{language === 'ar' ? dest.descriptionAr : dest.descriptionEn}</p>
                            </div>
                          </div>
                          
                          <div className="p-5 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between">
                            <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                              {dest.rating}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{dest.reviews} {t('reviews')}</span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {/* --- 3. Packages Tab --- */}
              {activeTab === 'packages' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 font-bold">
                      {language === 'ar' ? 'لا توجد بكجات سياحية متوفرة لهذه المنطقة حالياً.' : 'No packages available for this region yet.'}
                    </div>
                  ) : (
                    packages.map((pkg) => {
                      const pName = language === 'ar' ? pkg.nameAr : pkg.nameEn;
                      return (
                        <div 
                          key={pkg.id}
                          className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-44 overflow-hidden relative">
                              <img 
                                src={pkg.images[0]} 
                                alt={pName} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                {pkg.durationDays} {t('days')}
                              </div>
                            </div>
                            <div className="p-5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                {language === 'ar' ? pkg.officeNameAr : pkg.officeNameEn}
                              </span>
                              <h3 className="text-lg font-black text-primary mb-2 line-clamp-1">{pName}</h3>
                              <div className="flex gap-1.5 flex-wrap mt-3">
                                {pkg.inclusionsAr.slice(0, 3).map((inc, i) => (
                                  <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {language === 'ar' ? inc : pkg.inclusionsEn[i]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === 'ar' ? 'تبدأ من' : 'Starts from'}</span>
                              <span className="text-lg font-black text-secondary">{pkg.pricePerPerson} SAR</span>
                            </div>
                            <Link 
                              to="/packages"
                              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:scale-103 transition-transform"
                            >
                              {t('viewAll')}
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* --- 4. Culture Tab --- */}
              {activeTab === 'culture' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Famous Foods */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                    <h3 className="text-xl font-bold tracking-tight text-primary mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-secondary" />
                      {t('famousFoods')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(language === 'ar' ? region.famousFoodsAr : region.famousFoodsEn).map((food, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary text-sm shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-800">{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural experiences */}
                  <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-100 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-secondary" />
                        {language === 'ar' ? 'التراث والتجربة المحلية' : 'Heritage & Local Experience'}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-light mb-4">
                        {language === 'ar' 
                          ? 'تتميز هذه المنطقة بتنوعها الثقافي والاجتماعي الممتد لقرون. جرب الفعاليات التقليدية واستكشف الأسواق القديمة التي تجسد عراقة وأصالة الضيافة السعودية الكلاسيكية.' 
                          : 'This region is defined by its deep cultural diversity spanning centuries. Join traditional events and visit heritage souqs reflecting the genuine, classic Saudi hospitality.'
                        }
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/guides')}
                      className="w-full py-3.5 bg-secondary text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors border-none"
                    >
                      <Users className="w-4 h-4" />
                      {language === 'ar' ? 'احجز مرشداً محلياً لخوض التجربة' : 'Book Local Guide for the Experience'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
