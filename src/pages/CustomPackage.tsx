import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Hotel, Compass, Navigation, Calendar, 
  Users, CheckCircle, Info, Calculator, Award, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { City, Destination } from '../types/models';

export default function CustomPackage() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();

  // Load cities
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Config selections
  const [selectedCityId, setSelectedCityId] = useState('');
  const [daysCount, setDaysCount] = useState(3);
  const [travelersCount, setTravelersCount] = useState(2);
  const [startDate, setStartDate] = useState('');
  
  // Accommodation
  const [hotelType, setHotelType] = useState<'budget' | 'standard' | 'luxury'>('standard');
  
  // Transport
  const [transport, setTransport] = useState<'compact' | 'suv' | 'none'>('suv');

  // Guide
  const [includeGuide, setIncludeGuide] = useState(true);

  // Activities checkbox lists
  const [activities, setActivities] = useState({
    cityTour: true,
    desertSafari: false,
    museumTickets: true,
    traditionalDinner: false
  });

  useEffect(() => {
    api.regions.list()
      .then(() => api.regions.get('central_region')) // central fallback to load cities
      .then(res => {
        setCities(res.cities);
        if (res.cities.length > 0) {
          setSelectedCityId(res.cities[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Prices constants (SAR per unit)
  const prices = {
    hotel: { budget: 150, standard: 350, luxury: 850 },
    transport: { compact: 100, suv: 250, none: 0 },
    guide: 350,
    activities: { cityTour: 50, desertSafari: 180, museumTickets: 25, traditionalDinner: 120 }
  };

  // Real-time pricing calculator
  const calculateTotal = () => {
    const hotelCost = prices.hotel[hotelType] * daysCount;
    const transportCost = prices.transport[transport] * daysCount;
    const guideCost = includeGuide ? prices.guide * daysCount : 0;
    
    let activitiesCost = 0;
    if (activities.cityTour) activitiesCost += prices.activities.cityTour;
    if (activities.desertSafari) activitiesCost += prices.activities.desertSafari;
    if (activities.museumTickets) activitiesCost += prices.activities.museumTickets;
    if (activities.traditionalDinner) activitiesCost += prices.activities.traditionalDinner;
    
    const activitySum = activitiesCost * travelersCount;

    return hotelCost + transportCost + guideCost + activitySum;
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      alert(language === 'ar' ? 'الرجاء تحديد تاريخ السفر' : 'Please select travel start date.');
      return;
    }

    const city = cities.find(c => c.id === selectedCityId);

    const inclusionsEn: string[] = [
      `${hotelType.toUpperCase()} Hotel Stay (${daysCount} days)`,
      transport !== 'none' ? `${transport.toUpperCase()} Transport` : 'No Transport included',
      includeGuide ? 'Certified Local Guide' : 'Self guided tour'
    ];
    const inclusionsAr: string[] = [
      `إقامة فندقية فئة ${hotelType === 'budget' ? 'اقتصادي' : hotelType === 'standard' ? 'متوسط' : 'فاخر'} (${daysCount} أيام)`,
      transport !== 'none' ? `مواصلات سيارة ${transport === 'compact' ? 'اقتصادية' : 'عائلية دفعة رباعي'}` : 'بدون سيارة مواصلات',
      includeGuide ? 'مرشد سياحي محلي معتمد' : 'جولات مشي حرة بدون مرشد'
    ];

    const itinerary: any[] = Array.from({ length: daysCount }).map((_, i) => ({
      dayNumber: i + 1,
      activitiesEn: [
        { time: '09:00 AM', text: 'Hotel pickup and morning sightseeing tours.' },
        { time: '02:00 PM', text: 'Explore local markets and restaurants.' }
      ],
      activitiesAr: [
        { time: '09:00 ص', text: 'الاستقبال من الفندق وجولات صباحية لمشاهدة المعالم.' },
        { time: '02:00 م', text: 'زيارة الأسواق التراثية وتناول الطعام في المطاعم المحلية.' }
      ]
    }));

    try {
      await api.packages.saveCustom({
        nameEn: `Custom Trip to ${city?.nameEn || 'Saudi'}`,
        nameAr: `رحلة مخصصة إلى ${city?.nameAr || 'المملكة'}`,
        cityEn: city?.nameEn,
        cityAr: city?.nameAr,
        daysCount,
        startDate,
        endDate: new Date(new Date(startDate).getTime() + daysCount * 86400000).toISOString().split('T')[0],
        totalCost: calculateTotal(),
        inclusionsEn,
        inclusionsAr,
        itinerary
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  const totalCost = calculateTotal();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="pt-24 px-6 max-w-5xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8">
        <button
          onClick={() => navigate('/packages')}
          className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 mb-2 border-none bg-transparent cursor-pointer"
        >
          {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'ar' ? 'العودة للبكجات' : 'Back to Packages'}</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-primary mt-1 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-secondary shrink-0" />
          {language === 'ar' ? 'صمّم بكجك المخصص' : 'Custom Trip Designer'}
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-light">
          {language === 'ar' 
            ? 'حدد وجهتك، الفندق، المواصلات والخدمات واحسب السعر التقديري لرحلتك المثالية بشكل فوري.'
            : 'Configure your destination, hotel preference, transport, and guide to get a real-time price estimation.'
          }
        </p>
      </header>

      {success ? (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-[32px] p-8 text-center flex flex-col items-center gap-4 shadow-md">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-primary">{language === 'ar' ? 'تم تصميم البكج وحفظه!' : 'Trip Designed & Saved!'}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            {language === 'ar' 
              ? 'لقد قمنا بحفظ البكج المخصص لك بنجاح. يمكنك الآن الاطلاع عليه في صفحة البكجات لإكمال الحجز أو التعديل.'
              : 'Your custom designed trip configuration has been saved. You can check it under the packages list to finish booking.'
            }
          </p>
          <button
            onClick={() => navigate('/packages')}
            className="w-full py-4 bg-primary text-white font-bold rounded-full shadow-md hover:scale-101 transition-transform border-none cursor-pointer"
          >
            {language === 'ar' ? 'استعراض البكجات' : 'Go to Packages'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSavePackage} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Options Column */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col gap-6">
            
            {/* 1. Destination & Duration */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-secondary" />
                {language === 'ar' ? '1. الوجهة وتواريخ الرحلة' : '1. Destination & Duration'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">{language === 'ar' ? 'المدينة الوجهة' : 'Destination City'}</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">{language === 'ar' ? 'تاريخ السفر' : 'Start Date'}</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">{language === 'ar' ? 'عدد الأيام' : 'Duration (Days)'}</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">{language === 'ar' ? 'عدد المسافرين' : 'Travelers'}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Number(e.target.value))}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50 focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>

            {/* 2. Hotel Tier */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Hotel className="w-4 h-4 text-secondary" />
                {language === 'ar' ? '2. فئة الإقامة الفندقية' : '2. Accommodation Preferences'}
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'budget', labelEn: 'Budget', labelAr: 'اقتصادي (شقة/نزل)', rate: prices.hotel.budget },
                  { key: 'standard', labelEn: 'Standard', labelAr: 'متوسط فندق ٣ نجوم', rate: prices.hotel.standard },
                  { key: 'luxury', labelEn: 'Luxury', labelAr: 'فاخر فندق ٥ نجوم', rate: prices.hotel.luxury }
                ] as const).map(tier => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setHotelType(tier.key)}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hotelType === tier.key 
                        ? 'border-secondary bg-blue-50/20 text-slate-900 ring-2 ring-blue-50' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-350 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{language === 'ar' ? tier.labelAr : tier.labelEn}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold">{tier.rate} SAR / {language === 'ar' ? 'ليلة' : 'night'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Transport Type */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-secondary" />
                {language === 'ar' ? '3. وسيلة الانتقال' : '3. Transportation'}
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'compact', labelEn: 'Compact Sedan', labelAr: 'سيارة صغيرة', rate: prices.transport.compact },
                  { key: 'suv', labelEn: 'Family SUV', labelAr: 'سيارة عائلية/دفع رباعي', rate: prices.transport.suv },
                  { key: 'none', labelEn: 'No Car Rental', labelAr: 'بدون سيارة إيجار', rate: prices.transport.none }
                ] as const).map(tr => (
                  <button
                    key={tr.key}
                    type="button"
                    onClick={() => setTransport(tr.key)}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      transport === tr.key 
                        ? 'border-secondary bg-blue-50/20 text-slate-900 ring-2 ring-blue-50' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-350 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{language === 'ar' ? tr.labelAr : tr.labelEn}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold">{tr.rate} SAR / {language === 'ar' ? 'يوم' : 'day'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Local Guide Toggler */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-secondary" />
                {language === 'ar' ? '4. المرشد السياحي المحلي' : '4. Certified Tour Guide'}
              </h3>

              <div className="flex items-center justify-between p-4.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeGuide}
                    onChange={(e) => setIncludeGuide(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-secondary focus:ring-secondary mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{language === 'ar' ? 'توفير مرشد محلي مرافق' : 'Include local tourist guide'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{prices.guide} SAR / {language === 'ar' ? 'يوم كامل جولات مشي' : 'full day itinerary'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Activities list */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-secondary" />
                {language === 'ar' ? '5. الأنشطة والوجبات الإضافية' : '5. Excursions & Meals'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'cityTour', labelEn: 'City Guided Tour', labelAr: 'جولة تعريفية بالباص في المدينة', rate: prices.activities.cityTour },
                  { key: 'desertSafari', labelEn: 'Desert Dune Buggies', labelAr: 'مغامرات تخييم صحراوي وسفاري', rate: prices.activities.desertSafari },
                  { key: 'museumTickets', labelEn: 'Heritage Museums Tickets', labelAr: 'تذاكر المتاحف التاريخية بالمنطقة', rate: prices.activities.museumTickets },
                  { key: 'traditionalDinner', labelEn: 'Traditional Dinner Feast', labelAr: 'مأدبة عشاء بأكلات المنطقة المشهورة', rate: prices.activities.traditionalDinner }
                ] as const).map(act => (
                  <label 
                    key={act.key} 
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-2xl flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-700 select-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={activities[act.key as keyof typeof activities]}
                        onChange={(e) => setActivities(prev => ({ ...prev, [act.key]: e.target.checked }))}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                      />
                      <span>{language === 'ar' ? act.labelAr : act.labelEn}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold">+{act.rate} SAR</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Pricing Aggregations Sidebar */}
          <div>
            <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border border-slate-800 sticky top-24 flex flex-col gap-6">
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 pb-3.5 border-b border-white/10">
                <Calculator className="w-5.5 h-5.5 text-secondary" />
                {language === 'ar' ? 'تفاصيل التكلفة التقديرية' : 'Price Summary'}
              </h3>

              {/* Aggregation breakdown */}
              <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span>{language === 'ar' ? 'إجمالي السكن الفندقي' : 'Hotel Lodging'}</span>
                  <span className="font-extrabold text-slate-100">{prices.hotel[hotelType] * daysCount} SAR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'ar' ? 'إيجار سيارة الانتقال' : 'Vehicle Rent'}</span>
                  <span className="font-extrabold text-slate-100">{prices.transport[transport] * daysCount} SAR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'ar' ? 'المرشد السياحي' : 'Tourist Guide'}</span>
                  <span className="font-extrabold text-slate-100">{includeGuide ? prices.guide * daysCount : 0} SAR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{language === 'ar' ? 'الأنشطة الإضافية' : 'Excursions Sum'}</span>
                  <span className="font-extrabold text-slate-100">
                    {(
                      (activities.cityTour ? prices.activities.cityTour : 0) +
                      (activities.desertSafari ? prices.activities.desertSafari : 0) +
                      (activities.museumTickets ? prices.activities.museumTickets : 0) +
                      (activities.traditionalDinner ? prices.activities.traditionalDinner : 0)
                    ) * travelersCount} SAR
                  </span>
                </div>
              </div>

              {/* Total Cost Display */}
              <div className="border-t border-white/15 pt-5 pb-1 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === 'ar' ? 'المجموع التقريبي' : 'Approximate Total'}</span>
                  <span className="text-3xl font-black text-secondary">{totalCost} SAR</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mb-1">{language === 'ar' ? 'شامل الضرائب' : 'Incl. Taxes'}</span>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4 text-[10px] text-slate-400 leading-relaxed font-light">
                <span className="font-extrabold text-slate-200 block mb-1">{language === 'ar' ? 'ملاحظة:' : 'Notice:'}</span>
                {language === 'ar' 
                  ? 'هذا السعر تقديري بناءً على خيارات التصميم الخاص بك. سيتم إرسال طلب عرض أسعار للشركات المحلية لتوثيقه.'
                  : 'This cost is approximated. A custom quote request will be sent to local horizon offices for finalizing.'
                }
              </div>

              <button
                type="submit"
                className="w-full h-13 bg-secondary hover:bg-blue-600 text-white rounded-full font-black text-xs shadow-lg transition-transform hover:scale-[1.01] border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                {language === 'ar' ? 'حفظ وتصميم البكج' : 'Save Custom Package'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
