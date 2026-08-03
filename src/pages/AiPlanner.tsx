import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Compass, DollarSign, Navigation, 
  MapPin, Star, Trash2, ArrowUp, ArrowDown, Printer, Share2, Hotel, CheckCircle, ChevronDown 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

interface Activity {
  time: string;
  textEn: string;
  textAr: string;
  estimatedCostSar: number;
}

interface ItineraryDay {
  dayNumber: number;
  activitiesEn: Activity[];
  activitiesAr: Activity[];
}

export default function AiPlanner() {
  const { t, language, dir } = useLanguage();

  // Inputs
  const [selectedCities, setSelectedCities] = useState<string[]>(['Abha']);
  const [budget, setBudget] = useState<'economic' | 'medium' | 'luxury'>('medium');
  const [daysCount, setDaysCount] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['nature']);
  const [tripType, setTripType] = useState('family');
  const [transport, setTransport] = useState('car');
  const [accommodation, setAccommodation] = useState('hotel');

  // Generator states
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [budgetBreakdown, setBudgetBreakdown] = useState<any | null>(null);
  const [routeSummary, setRouteSummary] = useState({ en: '', ar: '' });
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const citiesList = [
    { id: 'Riyadh', labelAr: 'الرياض', labelEn: 'Riyadh' },
    { id: 'Abha', labelAr: 'أبها', labelEn: 'Abha' },
    { id: 'AlUla', labelAr: 'العلا', labelEn: 'AlUla' },
    { id: 'Jeddah', labelAr: 'جدة', labelEn: 'Jeddah' }
  ];

  const interestsList = [
    { id: 'nature', labelAr: 'طبيعة وجبال', labelEn: 'Nature & Mountains' },
    { id: 'history', labelAr: 'تراث وتاريخ', labelEn: 'History & Heritage' },
    { id: 'adventure', labelAr: 'مغامرات وهايكنج', labelEn: 'Adventure' },
    { id: 'shopping', labelAr: 'تسوق وترفيه', labelEn: 'Shopping & Leisure' }
  ];

  const handleCityToggle = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(prev => prev.filter(c => c !== city));
    } else {
      setSelectedCities(prev => [...prev, city]);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleGenerate = async () => {
    if (selectedCities.length === 0) {
      alert(language === 'ar' ? 'يرجى اختيار مدينة واحدة على الأقل!' : 'Select at least one city!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.chat.getPlannerItinerary({
        cities: selectedCities,
        budget,
        daysCount,
        interests: selectedInterests,
        tripType,
        transport,
        accommodation
      });
      
      const data = res.itinerary;
      if (data && Array.isArray(data)) {
        setItinerary(data);
        setHotels([]);
        setRestaurants([]);
        setBudgetBreakdown(null);
        setRouteSummary({ en: '', ar: '' });
      } else if (data && data.days) {
        setItinerary(data.days);
        setHotels(data.hotels || []);
        setRestaurants(data.restaurants || []);
        setBudgetBreakdown(data.budgetBreakdown || null);
        setRouteSummary({
          en: data.routeSummaryEn || '',
          ar: data.routeSummaryAr || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Drag-and-Drop rearrange simulations
  const moveActivity = (dayIndex: number, actIndex: number, direction: 'up' | 'down') => {
    const nextItinerary = [...itinerary];
    const day = { ...nextItinerary[dayIndex] };
    const activitiesEn = [...day.activitiesEn];
    const activitiesAr = [...day.activitiesAr];

    const targetIndex = direction === 'up' ? actIndex - 1 : actIndex + 1;
    if (targetIndex < 0 || targetIndex >= activitiesEn.length) return;

    // Swap En
    const tempEn = activitiesEn[actIndex];
    activitiesEn[actIndex] = activitiesEn[targetIndex];
    activitiesEn[targetIndex] = tempEn;

    // Swap Ar
    const tempAr = activitiesAr[actIndex];
    activitiesAr[actIndex] = activitiesAr[targetIndex];
    activitiesAr[targetIndex] = tempAr;

    day.activitiesEn = activitiesEn;
    day.activitiesAr = activitiesAr;
    nextItinerary[dayIndex] = day;
    setItinerary(nextItinerary);
  };

  const deleteActivity = (dayIndex: number, actIndex: number) => {
    const nextItinerary = [...itinerary];
    const day = { ...nextItinerary[dayIndex] };
    day.activitiesEn = day.activitiesEn.filter((_, idx) => idx !== actIndex);
    day.activitiesAr = day.activitiesAr.filter((_, idx) => idx !== actIndex);
    nextItinerary[dayIndex] = day;
    setItinerary(nextItinerary);
  };

  const handleBookActivity = (actName: string, cost: number) => {
    alert(language === 'ar' 
      ? `تم حجز النشاط المختار (${actName}) بقيمة ${cost} SAR بنجاح!` 
      : `Successfully booked selected activity (${actName}) for ${cost} SAR!`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    setShared(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28 print:pt-0" dir={dir}>
      <header className="mb-8 print:hidden">
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-secondary shrink-0 animate-pulse" />
          {t('plannerTitle')}
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-light">
          {language === 'ar' 
            ? 'خطط لمسارات رحلتك اليومية بدعم الذكاء الاصطناعي من Gemini لتجربة لا تنسى.' 
            : 'Formulate customized daily schedules and itineraries powered by Gemini AI.'
          }
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Controls Panel */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col gap-5 print:hidden">
          <h3 className="font-extrabold text-sm text-primary border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-secondary" />
            {language === 'ar' ? 'تخصيص الخيارات' : 'Planner Filters'}
          </h3>

          {/* Cities checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'المدن المستهدفة' : 'Cities'}</label>
            <div className="flex flex-wrap gap-2">
              {citiesList.map(city => {
                const active = selectedCities.includes(city.id);
                const label = language === 'ar' ? city.labelAr : city.labelEn;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCityToggle(city.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      active ? 'bg-secondary text-white border-secondary' : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'الميزانية التقريبية' : 'Estimated Budget'}</label>
            <select
              value={budget}
              onChange={e => setBudget(e.target.value as any)}
              className="h-11 px-3 border border-slate-150 rounded-xl text-xs bg-slate-50 font-bold outline-none cursor-pointer"
            >
              <option value="economic">{language === 'ar' ? 'اقتصادية' : 'Economic'}</option>
              <option value="medium">{language === 'ar' ? 'متوسطة' : 'Moderate'}</option>
              <option value="luxury">{language === 'ar' ? 'فاخرة' : 'Luxury'}</option>
            </select>
          </div>

          {/* Days count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'عدد أيام السفر' : 'Number of Days'}</label>
            <input 
              type="number" 
              min="1" 
              max="10"
              value={daysCount} 
              onChange={e => setDaysCount(Number(e.target.value))}
              className="h-11 px-3 border border-slate-150 rounded-xl text-xs bg-slate-50 font-bold outline-none" 
            />
          </div>

          {/* Interests */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'الاهتمامات الأساسية' : 'Key Interests'}</label>
            <div className="flex flex-wrap gap-2">
              {interestsList.map(int => {
                const active = selectedInterests.includes(int.id);
                const label = language === 'ar' ? int.labelAr : int.labelEn;
                return (
                  <button
                    key={int.id}
                    type="button"
                    onClick={() => handleInterestToggle(int.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      active ? 'bg-secondary text-white border-secondary' : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 border-none cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            {loading ? (language === 'ar' ? 'جاري توليد مسار الرحلة...' : 'Generating itinerary...') : (language === 'ar' ? 'توليد المخطط الذكي' : 'Generate AI Plan')}
          </button>
        </div>

        {/* Itinerary Timeline Display */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] shadow-sm">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="font-bold text-xs text-slate-450 block">{language === 'ar' ? 'يقوم المخطط الذكي بجمع المسارات المناسبة من خوارزميات Gemini...' : 'AI Travel Planner is parsing custom days via Gemini...'}</span>
            </div>
          ) : itinerary.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] shadow-sm font-bold text-slate-400 text-xs print:hidden">
              {language === 'ar' ? 'اضبط خيارات التصفية وانقر فوق توليد لإنشاء رحلة مصممة لك.' : 'Set filters and click generate to create custom day layouts.'}
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Actions Header Row */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex justify-between items-center print:hidden">
                <span className="font-bold text-xs text-slate-650">
                  {language === 'ar' ? 'مسار الرحلة الذكي' : 'AI Custom Schedule'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border-none"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border-none flex items-center gap-1.5 text-[10px] font-bold"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{shared ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'مشاركة' : 'Share')}</span>
                  </button>
                </div>
              </div>

              {/* Route Summary Alert */}
              {(routeSummary.en || routeSummary.ar) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5 shadow-sm text-xs leading-relaxed text-slate-700">
                  <span className="font-extrabold text-[10px] text-secondary uppercase tracking-widest block mb-1">
                    📍 {language === 'ar' ? 'مسار الرحلة المقترح' : 'Optimized Travel Route'}
                  </span>
                  <p>{language === 'ar' ? routeSummary.ar : routeSummary.en}</p>
                </div>
              )}

              {/* Budget Breakdown & Accommodation / Restaurant Recommendations */}
              {(budgetBreakdown || hotels.length > 0 || restaurants.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                  
                  {/* Budget breakdown card */}
                  {budgetBreakdown && (
                    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col gap-4">
                      <h4 className="font-black text-sm text-slate-100 border-b border-white/10 pb-2.5 flex items-center gap-1.5">
                        💸 {language === 'ar' ? 'تفاصيل الميزانية المقدرة' : 'Estimated Cost Breakdown'}
                      </h4>
                      <div className="text-xs space-y-2.5">
                        <div className="flex justify-between text-slate-400">
                          <span>🏨 {language === 'ar' ? 'السكن والإقامة' : 'Lodging'}</span>
                          <span className="font-bold text-slate-100">{budgetBreakdown.lodgingCostSar} SAR</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>🚗 {language === 'ar' ? 'المواصلات والتنقل' : 'Transportation'}</span>
                          <span className="font-bold text-slate-100">{budgetBreakdown.transportCostSar} SAR</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>🎟️ {language === 'ar' ? 'الفعاليات والتذاكر' : 'Activities & Tickets'}</span>
                          <span className="font-bold text-slate-100">{budgetBreakdown.activitiesCostSar} SAR</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>🍽️ {language === 'ar' ? 'الوجبات والمأكولات' : 'Food & Dining'}</span>
                          <span className="font-bold text-slate-100">{budgetBreakdown.foodCostSar} SAR</span>
                        </div>
                        <div className="flex justify-between border-t border-white/15 pt-3 text-sm">
                          <span className="font-extrabold text-secondary">{language === 'ar' ? 'المجموع الإجمالي التقريبي' : 'Total Estimated Cost'}</span>
                          <span className="font-black text-secondary">{budgetBreakdown.totalCostSar} SAR</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hotels & Restaurants recommendations */}
                  {(hotels.length > 0 || restaurants.length > 0) && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                      
                      {/* Hotels */}
                      {hotels.length > 0 && (
                        <div>
                          <h4 className="font-extrabold text-xs text-primary border-b border-slate-100 pb-2 flex items-center gap-1.5 mb-3">
                            🏨 {language === 'ar' ? 'الفنادق الموصى بها' : 'Recommended Lodging'}
                          </h4>
                          <div className="space-y-2.5 text-xs text-slate-650">
                            {hotels.map((h, i) => (
                              <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                <div>
                                  <span className="font-extrabold text-slate-800 block">{language === 'ar' ? h.nameAr : h.nameEn}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">⭐ {h.rating}</span>
                                </div>
                                <span className="font-black text-secondary shrink-0">{h.pricePerNightSar} SAR/{language === 'ar' ? 'ليلة' : 'night'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Restaurants */}
                      {restaurants.length > 0 && (
                        <div>
                          <h4 className="font-extrabold text-xs text-primary border-b border-slate-100 pb-2 flex items-center gap-1.5 mb-3">
                            🍽️ {language === 'ar' ? 'أماكن ومطاعم مقترحة' : 'Suggested Dining'}
                          </h4>
                          <div className="space-y-2.5 text-xs text-slate-650">
                            {restaurants.map((r, i) => (
                              <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                <div>
                                  <span className="font-extrabold text-slate-800 block">{language === 'ar' ? r.nameAr : r.nameEn}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? r.typeAr : r.typeEn}</span>
                                </div>
                                <span className="font-black text-slate-700 shrink-0">~{r.avgCostPerPersonSar} SAR/{language === 'ar' ? 'شخص' : 'person'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* Day-by-Day Timeline */}
              {itinerary.map((day, dayIdx) => (
                <div key={day.dayNumber} className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm relative overflow-hidden break-inside-avoid">
                  
                  {/* Day Label Tag */}
                  <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 mb-6">
                    <h3 className="text-lg font-black text-primary">
                      {language === 'ar' ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                    </h3>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {daysCount} {language === 'ar' ? 'أيام كلية' : 'Total Days'}
                    </span>
                  </div>

                  {/* Activities chronological grid */}
                  <div className="space-y-6 relative border-l-2 border-slate-100 dir-ltr:border-l-0 dir-ltr:border-r-2 pr-6 dir-ltr:pl-6 dir-ltr:pr-0">
                    {day.activitiesEn.length === 0 ? (
                      <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'لا توجد أنشطة مجدولة لهذا اليوم.' : 'No activities scheduled for today.'}</span>
                    ) : (
                      day.activitiesEn.map((_, actIdx) => {
                        const actEn = day.activitiesEn[actIdx];
                        const actAr = day.activitiesAr[actIdx];
                        const text = language === 'ar' ? actAr.textAr : actEn.textEn;
                        const time = language === 'ar' ? actAr.time : actEn.time;
                        const cost = language === 'ar' ? actAr.estimatedCostSar : actEn.estimatedCostSar;

                        return (
                          <div key={actIdx} className="relative group">
                            
                            {/* Point on timeline */}
                            <div className={`absolute -right-[31px] dir-ltr:-left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white shadow-sm`} />

                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-secondary block">{time}</span>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{text}</h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                                  <DollarSign className="w-3 h-3 text-secondary" />
                                  <span>{language === 'ar' ? 'التكلفة التقريبية' : 'Estimated Cost'}: {cost === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `${cost} SAR`}</span>
                                </span>
                              </div>

                              {/* Rearrange & actions panel */}
                              <div className="flex items-center gap-1 shrink-0 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => moveActivity(dayIdx, actIdx, 'up')}
                                  disabled={actIdx === 0}
                                  className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-550 rounded border border-slate-200 cursor-pointer disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => moveActivity(dayIdx, actIdx, 'down')}
                                  disabled={actIdx === day.activitiesEn.length - 1}
                                  className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-550 rounded border border-slate-200 cursor-pointer disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleBookActivity(text, cost)}
                                  className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded border border-emerald-150 cursor-pointer text-[9px] font-black uppercase px-2"
                                >
                                  {t('bookNow') || 'Book'}
                                </button>
                                <button
                                  onClick={() => deleteActivity(dayIdx, actIdx)}
                                  className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded border border-red-150 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
