import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Compass, Calendar, MapPin, Star, Award, Clock, Heart, 
  Sparkles, ShieldCheck, ChevronRight, ChevronLeft, Columns, Info, Bookmark, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { getPackages } from '../api/packagesApi';
import { Package, PackageCategory, FavoriteList } from '../types/models';

export default function Packages() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();

  // List states
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<PackageCategory | 'all'>('all');
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  // Compare queue
  const [compareIds, setCompareIds] = useState<string[]>([]);
  
  // Custom lists (for wishlist adding)
  const [wishlists, setWishlists] = useState<FavoriteList[]>([]);
  const [showListsDropdown, setShowListsDropdown] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getPackages(activeCategory === 'all' ? undefined : activeCategory, undefined, controller.signal)
      .then(pkgData => {
        setPackages(pkgData as any);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Failed to load packages from ASP.NET Core:', err);
      })
      .finally(() => setLoading(false));

    api.comparisons.get().then(compData => setCompareIds(compData.itemIds)).catch(console.error);
    api.favoriteLists.list().then(listsData => setWishlists(listsData)).catch(console.error);

    return () => controller.abort();
  }, [activeCategory]);

  const handleToggleCompare = async (pkgId: string) => {
    try {
      if (compareIds.includes(pkgId)) {
        const updated = await api.comparisons.remove(pkgId);
        setCompareIds(updated.itemIds);
      } else {
        if (compareIds.length >= 3) {
          alert(language === 'ar' ? 'يمكنك مقارنة ٣ خيارات كحد أقصى' : 'You can compare up to 3 options maximum.');
          return;
        }
        const updated = await api.comparisons.add(pkgId);
        setCompareIds(updated.itemIds);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update comparisons.');
    }
  };

  const handleAddToWishlist = async (listId: string, pkgId: string) => {
    try {
      await api.favoriteLists.addItem(listId, 'package', pkgId);
      setShowListsDropdown(null);
      alert(language === 'ar' ? 'تمت إضافة البكج لقائمتك!' : 'Package added to list!');
    } catch (err: any) {
      alert(err.message || 'Failed to add item to wishlist.');
    }
  };

  const handleBookPackage = async (pkgId: string) => {
    alert(language === 'ar' ? 'تم إرسال طلب الحجز بنجاح! سيتم إخطارك عند تأكيد الطلب.' : 'Booking request sent successfully! You will be notified on confirmation.');
    setSelectedPkg(null);
  };

  const categories: { key: PackageCategory | 'all'; label: string }[] = [
    { key: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { key: 'family', label: language === 'ar' ? 'عائلية' : 'Family' },
    { key: 'youth', label: language === 'ar' ? 'شبابية' : 'Youth' },
    { key: 'adventure', label: language === 'ar' ? 'مغامرات' : 'Adventure' },
    { key: 'honeymoon', label: language === 'ar' ? 'شهر عسل' : 'Honeymoon' },
    { key: 'oneday', label: language === 'ar' ? 'يوم واحد' : '1 Day' },
    { key: 'weekend', label: language === 'ar' ? 'نهاية الأسبوع' : 'Weekend' },
    { key: 'economic', label: language === 'ar' ? 'اقتصادية' : 'Economic' },
    { key: 'luxury', label: language === 'ar' ? 'فاخرة' : 'Luxury' },
    { key: 'seasonal', label: language === 'ar' ? 'موسمية' : 'Seasonal' },
  ];

  const filteredPkgs = packages.filter(p => activeCategory === 'all' || p.category === activeCategory);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{t('explore')}</span>
          <h1 className="text-3xl md:text-4xl font-black text-primary mt-1">
            {t('packages')}
          </h1>
        </div>

        <Link
          to="/custom-package"
          className="px-6 py-3.5 bg-gradient-to-r from-secondary to-blue-600 text-white rounded-full text-xs font-black shadow-lg hover:scale-101 transition-transform border-none flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>{language === 'ar' ? 'صمّم بكجك الخاص' : 'Design Custom Package'}</span>
        </Link>
      </header>

      {/* Comparisons Tray Overlay */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-28 inset-x-6 z-[1002] max-w-lg mx-auto bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
              {compareIds.length}
            </div>
            <div>
              <span className="font-extrabold text-xs block">{language === 'ar' ? 'مقارنة البكجات نشطة' : 'Comparison Queue Active'}</span>
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'تم اختيار بكجات للمقارنة' : 'packages selected'}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/compare')}
            className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-600 transition-colors border-none cursor-pointer"
          >
            {language === 'ar' ? 'قارن الآن' : 'Compare Now'}
          </button>
        </div>
      )}

      {/* Category selector */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-3.5 -mx-6 px-6 md:mx-0 md:px-0 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-all shadow-sm ${
              activeCategory === cat.key 
                ? 'bg-primary text-white border border-primary' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPkgs.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 font-bold bg-white border border-slate-200 rounded-[32px]">
              {language === 'ar' ? 'لا تتوفر بكجات حالياً ضمن هذا التصنيف.' : 'No packages found under this category.'}
            </div>
          ) : (
            filteredPkgs.map((pkg) => {
              const pName = language === 'ar' ? pkg.nameAr : pkg.nameEn;
              const pOffice = language === 'ar' ? pkg.officeNameAr : pkg.officeNameEn;
              const citiesText = (language === 'ar' ? pkg.citiesAr : pkg.citiesEn).join(', ');
              const inCompare = compareIds.includes(pkg.id);

              return (
                <div 
                  key={pkg.id}
                  className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm group hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Cover photo */}
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={pkg.images[0]} 
                        alt={pName} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      
                      <div className="absolute top-3 right-3 flex gap-2">
                        {/* Wishlist dropdown button */}
                        <div className="relative">
                          <button
                            onClick={() => setShowListsDropdown(showListsDropdown === pkg.id ? null : pkg.id)}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-red-500 shadow-sm cursor-pointer border-none"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          
                          {showListsDropdown === pkg.id && (
                            <div className={`absolute top-9 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-44 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-30 flex flex-col gap-1.5`}>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block p-1">{language === 'ar' ? 'حفظ في قائمة:' : 'Save to list:'}</span>
                              {wishlists.map(list => (
                                <button
                                  key={list.id}
                                  onClick={() => handleAddToWishlist(list.id, pkg.id)}
                                  className="w-full text-right hover:bg-slate-50 p-1.5 rounded text-xs font-semibold text-slate-700 border-none cursor-pointer"
                                >
                                  {list.name}
                                </button>
                              ))}
                              <Link 
                                to="/wishlists"
                                className="text-secondary font-bold text-[10px] text-center block mt-1 hover:underline"
                              >
                                + {t('createList')}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Compare toggle button */}
                        <button
                          onClick={() => handleToggleCompare(pkg.id)}
                          className={`p-2 rounded-full shadow-sm cursor-pointer border-none transition-colors ${
                            inCompare ? 'bg-secondary text-white' : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:text-secondary'
                          }`}
                        >
                          <Columns className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {pkg.durationDays} {t('days')}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pOffice}</span>
                        <div className="flex items-center text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          {pkg.rating}
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-primary leading-snug line-clamp-1 mb-2">{pName}</h3>
                      
                      <div className="flex items-center text-slate-500 text-xs font-semibold gap-1 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        {citiesText}
                      </div>

                      {/* Small details */}
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.inclusionsAr.slice(0, 3).map((inc, i) => (
                          <span key={i} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {language === 'ar' ? inc : pkg.inclusionsEn[i]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-5 pt-4 border-t border-slate-150 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">{pkg.remainingSeats} {t('seatsLeft')}</span>
                      <span className="text-lg font-black text-secondary">{pkg.pricePerPerson} SAR</span>
                    </div>
                    <button 
                      onClick={() => setSelectedPkg(pkg)}
                      className="px-5 py-3.5 bg-primary text-white font-black text-xs rounded-xl shadow-md hover:scale-101 transition-transform border-none cursor-pointer"
                    >
                      {language === 'ar' ? 'عرض البرنامج' : 'View Itinerary'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Package Detail Modal & Daily collapsible schedule */}
      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPkg(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 border border-slate-100 max-h-[85vh] flex flex-col justify-between"
            >
              {/* Image banner */}
              <div className="relative h-48 md:h-56 overflow-hidden shrink-0">
                <img 
                  src={selectedPkg.images[0]} 
                  alt={selectedPkg.nameEn} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className={`absolute bottom-5 ${dir === 'rtl' ? 'right-6 text-right' : 'left-6 text-left'} right-6 z-10 text-white`}>
                  <span className="text-[9px] font-black bg-secondary text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedPkg.durationDays} {t('days')} • {selectedPkg.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black mt-1">{language === 'ar' ? selectedPkg.nameAr : selectedPkg.nameEn}</h3>
                </div>
              </div>

              {/* Scrollable details content */}
              <div className="p-6 overflow-y-auto flex flex-col gap-6 hide-scrollbar">
                
                {/* Office info & Transport */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">{language === 'ar' ? 'مقدم الخدمة' : 'Provider'}</span>
                    <span className="text-xs font-bold text-slate-700">{language === 'ar' ? selectedPkg.officeNameAr : selectedPkg.officeNameEn}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">{t('transport')}</span>
                    <span className="text-xs font-bold text-slate-700">{language === 'ar' ? selectedPkg.transportTypeAr : selectedPkg.transportTypeEn}</span>
                  </div>
                </div>

                {/* Day-by-day Itinerary */}
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-secondary" />
                    {language === 'ar' ? 'البرنامج اليومي للرحلة' : 'Daily Trip Program'}
                  </h4>
                  
                  <div className="flex flex-col gap-3.5">
                    {selectedPkg.itinerary.map((day) => (
                      <div key={day.dayNumber} className="border border-slate-150 rounded-2xl p-4">
                        <span className="text-xs font-black text-secondary block mb-2">{language === 'ar' ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}</span>
                        <div className="flex flex-col gap-2.5">
                          {(language === 'ar' ? day.activitiesAr : day.activitiesEn).map((act, idx) => (
                            <div key={idx} className="flex gap-3 text-xs">
                              <span className="font-bold text-slate-400 w-16 shrink-0">{act.time}</span>
                              <div>
                                <span className="text-slate-700 font-medium">{act.text}</span>
                                {act.location && (
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-secondary" />
                                    <span>{act.location}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4.5 text-xs">
                    <span className="font-bold text-emerald-700 block mb-2">{t('inclusions')}</span>
                    <ul className="list-disc list-inside text-emerald-800 space-y-1">
                      {(language === 'ar' ? selectedPkg.inclusionsAr : selectedPkg.inclusionsEn).map((inc, i) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50/40 border border-red-100 rounded-2xl p-4.5 text-xs">
                    <span className="font-bold text-red-700 block mb-2">{t('exclusions')}</span>
                    <ul className="list-disc list-inside text-red-800 space-y-1">
                      {(language === 'ar' ? selectedPkg.exclusionsAr : selectedPkg.exclusionsEn).map((exc, i) => (
                        <li key={i}>{exc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Terms and Cancellation policies */}
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Info className="w-4 h-4 text-slate-400" />
                      {t('terms')}
                    </span>
                    <p className="text-slate-500 leading-relaxed font-light">{language === 'ar' ? selectedPkg.termsAr : selectedPkg.termsEn}</p>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      {t('cancelPolicy')}
                    </span>
                    <p className="text-slate-500 leading-relaxed font-light">{language === 'ar' ? selectedPkg.cancellationPolicyAr : selectedPkg.cancellationPolicyEn}</p>
                  </div>
                </div>

              </div>

              {/* Action pricing footer */}
              <div className="p-6 border-t border-slate-200 shrink-0 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === 'ar' ? 'السعر الإجمالي' : 'Total Price'}</span>
                  <span className="text-2xl font-black text-secondary">{selectedPkg.pricePerPerson} SAR</span>
                </div>
                <button
                  onClick={() => handleBookPackage(selectedPkg.id)}
                  className="px-8 h-13 bg-primary hover:bg-slate-900 text-white font-black text-xs rounded-full shadow-lg transition-transform hover:scale-[1.01] border-none cursor-pointer"
                >
                  {t('bookNow')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
export { X };
