import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Compass, Sparkles, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PrimaryButton, SecondaryButton, Badge } from '../components/ui/ButtonsAndBadges';

export default function Trips() {
  const { language, dir } = useLanguage();

  const [trips, setTrips] = useState<any[]>([
    {
      id: 'trip_1',
      title: language === 'ar' ? 'رحلة صيف أبها والسودة' : 'Summer Abha & Soodah Escape',
      durationDays: 3,
      cities: ['Abha', 'Soodah'],
      budget: 'Mid-range',
      days: [
        {
          dayNumber: 1,
          title: language === 'ar' ? 'اليوم الأول: استكشاف قمم السودة والمطلات' : 'Day 1: Soodah Peaks & Views',
          items: [
            { time: '09:00 AM', title: language === 'ar' ? 'الانطلاق إلى منتزه السودة' : 'Depart to Soodah Park', type: 'nature' },
            { time: '01:00 PM', title: language === 'ar' ? 'غداء في مطعم نكهات عسير' : 'Lunch at Asir Flavors', type: 'food' },
            { time: '05:00 PM', title: language === 'ar' ? 'جولة التلفريك ومشاهدة التلفريك' : 'Cable Car & Sunset View', type: 'activity' }
          ]
        },
        {
          dayNumber: 2,
          title: language === 'ar' ? 'اليوم الثاني: قرية رجال Almaa والتراث العسيري' : 'Day 2: Rijal Almaa Heritage Village',
          items: [
            { time: '10:00 AM', title: language === 'ar' ? 'زيارة قرية رجال ألمع التراثية' : 'Visit Rijal Almaa Heritage', type: 'history' },
            { time: '04:00 PM', title: language === 'ar' ? 'شارع الفن وممشى السحاب' : 'Art Street & Cloud Walk', type: 'walk' }
          ]
        }
      ]
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [duration, setDuration] = useState(3);
  const [selectedCity, setSelectedCity] = useState('Abha');

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = {
      id: 'trip_' + Date.now(),
      title: newTitle.trim(),
      durationDays: duration,
      cities: [selectedCity],
      budget: 'Budget',
      days: [
        {
          dayNumber: 1,
          title: language === 'ar' ? 'اليوم الأول: الاستكشاف المبدئي' : 'Day 1: Initial Discovery',
          items: [
            { time: '10:00 AM', title: language === 'ar' ? 'الوصول وزيارة المعلم الرئيسي' : 'Arrival & Key Landmark', type: 'nature' }
          ]
        }
      ]
    };

    setTrips(prev => [created, ...prev]);
    setNewTitle('');
    setShowModal(false);
  };

  return (
    <PageContainer dir={dir}>
      <SectionHeader
        title={language === 'ar' ? 'خطط رحلاتك السياحية' : 'Your Trip Itineraries'}
        subtitle={language === 'ar' ? 'نظم وجهاتك المفضلة والأنشطة اليومية في جداول زمنية مخصصة' : 'Organize your favorite destinations and activities into daily itineraries'}
        icon={<Calendar className="w-7 h-7 text-blue-600" />}
        action={
          <PrimaryButton
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            {language === 'ar' ? 'إنشاء رحلة جديدة' : 'Create New Trip'}
          </PrimaryButton>
        }
      />

      {/* Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {trips.map(trip => (
          <div key={trip.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <Badge variant="emerald" className="mb-2">
                  {trip.durationDays} {language === 'ar' ? 'أيام' : 'Days'}
                </Badge>
                <h3 className="text-xl font-bold text-slate-900">{trip.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {trip.cities.join(', ')}
                  </span>
                  <span>•</span>
                  <span>{trip.budget}</span>
                </div>
              </div>
              <SecondaryButton className="text-xs py-1.5 px-3">
                {language === 'ar' ? 'تعديل الخطة' : 'Edit Itinerary'}
              </SecondaryButton>
            </div>

            {/* Daily Steps */}
            <div className="space-y-4">
              {trip.days.map((day: any) => (
                <div key={day.dayNumber} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-black">
                      {day.dayNumber}
                    </span>
                    {day.title}
                  </h4>
                  <div className="space-y-2 pl-8 rtl:pr-8 rtl:pl-0">
                    {day.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{item.time}</span>
                          <span className="text-slate-900 font-medium">{item.title}</span>
                        </div>
                        <Badge variant="blue" className="text-[10px] uppercase">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                {language === 'ar' ? 'خطة مقترحة مدعومة بالتوصيات الذكية' : 'Suggested itinerary powered by recommendations'}
              </span>
              <button className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                {language === 'ar' ? 'عرض التفاصيل' : 'View Full Details'}
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'إنشاء رحلة سياحية جديدة' : 'Create New Trip'}
            </h3>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'عنوان الرحلة' : 'Trip Title'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: رحلة نهاية الأسبوع بالرياض' : 'e.g. Weekend Trip in Riyadh'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'المدينة الرئيسية' : 'Primary City'}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Abha">أبها (Abha)</option>
                  <option value="Riyadh">الرياض (Riyadh)</option>
                  <option value="Jeddah">جدة (Jeddah)</option>
                  <option value="AlUla">العلا (AlUla)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'مدة الرحلة (بالأيام)' : 'Duration (Days)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </SecondaryButton>
                <PrimaryButton type="submit">
                  {language === 'ar' ? 'حفظ الرحلة' : 'Save Trip'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
