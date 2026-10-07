import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Columns, Columns4, ArrowLeft, ArrowRight, Trash2, Heart, 
  Star, DollarSign, Clock, ShieldCheck, Share2, Sparkles, Navigation 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { comparePackages } from '../api/packagesApi';
import { Package } from '../types/models';

export default function Compare() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();

  const [compareItems, setCompareItems] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.comparisons.get()
      .then(compData => {
        if (compData.itemIds.length >= 2) {
          comparePackages(compData.itemIds)
            .then(res => setCompareItems(res.packages as any))
            .catch(() => setCompareItems([]));
        } else {
          api.packages.list().then(pkgList => {
            setCompareItems(pkgList.filter(p => compData.itemIds.includes(p.id)));
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const updated = await api.comparisons.remove(id);
      setCompareItems(prev => prev.filter(p => updated.itemIds.includes(p.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = (id: string) => {
    alert(language === 'ar' ? 'تم بدء طلب الحجز للبكج المحدد!' : 'Booking sequence initiated for selected package!');
  };

  // Calculations for dynamic badge highlights
  const getCheapestId = () => {
    if (compareItems.length === 0) return null;
    let minPrice = Infinity;
    let minId = '';
    compareItems.forEach(item => {
      if (item.pricePerPerson < minPrice) {
        minPrice = item.pricePerPerson;
        minId = item.id;
      }
    });
    return minId;
  };

  const getHighestRatedId = () => {
    if (compareItems.length === 0) return null;
    let maxRating = -Infinity;
    let maxId = '';
    compareItems.forEach(item => {
      if (item.rating > maxRating) {
        maxRating = item.rating;
        maxId = item.id;
      }
    });
    return maxId;
  };

  const getMostInclusiveId = () => {
    if (compareItems.length === 0) return null;
    let maxIncLength = -Infinity;
    let maxId = '';
    compareItems.forEach(item => {
      if (item.inclusionsEn.length > maxIncLength) {
        maxIncLength = item.inclusionsEn.length;
        maxId = item.id;
      }
    });
    return maxId;
  };

  const cheapestId = getCheapestId();
  const highestRatedId = getHighestRatedId();
  const mostInclusiveId = getMostInclusiveId();

  // Best Value: Highest rating relative to price
  const getBestValueId = () => {
    if (compareItems.length === 0) return null;
    let bestRatio = -Infinity;
    let bestId = '';
    compareItems.forEach(item => {
      const ratio = item.rating / item.pricePerPerson;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = item.id;
      }
    });
    return bestId;
  };
  const bestValueId = getBestValueId();

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8">
        <button
          onClick={() => navigate('/packages')}
          className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 mb-2 border-none bg-transparent cursor-pointer"
        >
          {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'ar' ? 'العودة للبكجات' : 'Back to Packages'}</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-primary mt-1 flex items-center gap-2">
          <Columns className="w-8 h-8 text-secondary shrink-0" />
          {t('compareTitle')}
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-light">
          {language === 'ar' 
            ? 'مقارنة الفروقات بين البكجات السياحية المختارة لمساعدتك على اتخاذ القرار الأنسب.'
            : 'Compare detail properties between chosen travel packages side-by-side to make the best decision.'
          }
        </p>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : compareItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] text-slate-400 font-bold shadow-sm max-w-md mx-auto">
          <Columns4 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          {language === 'ar' ? 'لم تقم باختيار أي بكجات للمقارنة بعد.' : 'No packages selected for comparison yet.'}
          <button 
            onClick={() => navigate('/packages')}
            className="mt-4 px-6 py-3.5 bg-primary text-white font-bold text-xs rounded-full shadow-md block mx-auto border-none cursor-pointer"
          >
            {language === 'ar' ? 'تصفح البكجات' : 'Browse Packages'}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-x-auto hide-scrollbar">
          <div className="min-w-[700px] divide-y divide-slate-100">
            {/* Headers row */}
            <div className="grid grid-cols-4 p-6 bg-slate-50/50">
              <div className="self-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'البكج والمميزات' : 'Compare metrics'}</span>
                <span className="text-xs font-bold text-slate-600 block mt-1">{compareItems.length} {language === 'ar' ? 'خيارات مضافة' : 'options added'}</span>
              </div>
              
              {compareItems.map(item => {
                const name = language === 'ar' ? item.nameAr : item.nameEn;
                const office = language === 'ar' ? item.officeNameAr : item.officeNameEn;
                return (
                  <div key={item.id} className="px-4 flex flex-col justify-between h-full relative border-l border-slate-100">
                    <div>
                      {/* Image thumbnail */}
                      <div className="h-24 rounded-2xl overflow-hidden border border-slate-200 mb-3 relative">
                        <img 
                          src={item.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-lg text-slate-400 hover:text-red-500 shadow-sm cursor-pointer border-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="text-[9px] font-bold text-slate-400 block uppercase">{office}</span>
                      <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 mt-0.5">{name}</h3>
                    </div>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.id === cheapestId && (
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {t('cheapest')}
                        </span>
                      )}
                      {item.id === highestRatedId && (
                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {t('highestRated')}
                        </span>
                      )}
                      {item.id === bestValueId && (
                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {t('bestValue')}
                        </span>
                      )}
                      {item.id === mostInclusiveId && (
                        <span className="text-[8px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {t('mostInclusive')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price row */}
            <div className="grid grid-cols-4 p-6">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-400" />
                {language === 'ar' ? 'السعر للشخص' : 'Price per person'}
              </div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 self-center">
                  <span className="text-lg font-black text-secondary">{item.pricePerPerson} SAR</span>
                </div>
              ))}
            </div>

            {/* Duration Days */}
            <div className="grid grid-cols-4 p-6">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {language === 'ar' ? 'مدة الرحلة' : 'Duration'}
              </div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 self-center font-bold text-slate-700 text-sm">
                  {item.durationDays} {t('days')}
                </div>
              ))}
            </div>

            {/* Star Rating */}
            <div className="grid grid-cols-4 p-6">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Star className="w-4 h-4 text-slate-400" />
                {t('rating')}
              </div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 self-center flex items-center text-xs font-bold text-amber-500 gap-1">
                  <Star className="w-4.5 h-4.5 fill-current" />
                  <span>{item.rating} ({item.reviewsCount} {t('reviews')})</span>
                </div>
              ))}
            </div>

            {/* Transport type */}
            <div className="grid grid-cols-4 p-6">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-slate-400" />
                {t('transport')}
              </div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 self-center text-slate-600 text-xs font-medium">
                  {language === 'ar' ? item.transportTypeAr : item.transportTypeEn}
                </div>
              ))}
            </div>

            {/* Cancellation Policy */}
            <div className="grid grid-cols-4 p-6">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                {t('cancelPolicy')}
              </div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 self-center text-slate-500 text-xs leading-relaxed">
                  {language === 'ar' ? item.cancellationPolicyAr : item.cancellationPolicyEn}
                </div>
              ))}
            </div>

            {/* Inclusions */}
            <div className="grid grid-cols-4 p-6">
              <div className="font-bold text-slate-800 text-xs flex items-start gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-400 mt-0.5" />
                {t('inclusions')}
              </div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 text-xs text-slate-600 space-y-1">
                  {(language === 'ar' ? item.inclusionsAr : item.inclusionsEn).map((inc, i) => (
                    <div key={i} className="flex gap-1.5 items-center leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div className="grid grid-cols-4 p-6 bg-slate-50/50">
              <div></div>
              {compareItems.map(item => (
                <div key={item.id} className="px-4 border-l border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => handleBook(item.id)}
                    className="w-full h-11 bg-primary hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-[1.01] border-none cursor-pointer"
                  >
                    {t('bookNow')}
                  </button>
                  <button
                    onClick={() => navigate('/packages')}
                    className="w-full h-11 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {language === 'ar' ? 'تفاصيل الإ itinerary' : 'View Schedule'}
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
