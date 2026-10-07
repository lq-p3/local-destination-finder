import React, { useState, useEffect } from 'react';
import { 
  Building, Calendar, Plus, Trash2, Check, X, 
  DollarSign, Star, Briefcase, Award, ArrowUpRight, Compass, ShieldAlert, Clock 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { Package, Booking } from '../types/models';

export default function OfficeDashboard() {
  const { t, language, dir } = useLanguage();
  
  const [stats, setStats] = useState({
    packagesCount: 0,
    bookingsCount: 0,
    totalSales: 0,
    avgRating: 5.0
  });

  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'packages' | 'bookings' | 'stats'>('packages');
  const [loading, setLoading] = useState(true);
  
  // Create Package Form States
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState(300);
  const [duration, setDuration] = useState(2);
  const [inclusionsEn, setInclusionsEn] = useState('');
  const [inclusionsAr, setInclusionsAr] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [role, setRole] = useState(localStorage.getItem('userEmail') || '');

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.offices.getStats(),
      api.packages.list(),
      api.offices.getBookings()
    ]).then(([statsRes, allPkgs, bookingsRes]) => {
      setStats(statsRes);
      // Filter packages created by this office (mock identifier matches)
      const userEmail = localStorage.getItem('userEmail') || '';
      const officeId = userEmail === 'sarah.travels@example.com' ? 'office_saudi_tours' : userEmail;
      setPackages(allPkgs.filter(p => p.officeId === officeId));
      setBookings(bookingsRes);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboardData();
    
    // Listen to simulated switch role events
    const handleStorageChange = () => {
      setRole(localStorage.getItem('userEmail') || '');
      loadDashboardData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) return;

    try {
      const newPkg = {
        nameEn,
        nameAr,
        category: 'adventure',
        pricePerPerson: Number(price),
        durationDays: Number(duration),
        images: ['https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=400&q=80'],
        citiesEn: [language === 'ar' ? 'أبها' : 'Abha'],
        citiesAr: ['أبها'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * duration).toISOString().split('T')[0],
        itinerary: [
          {
            dayNumber: 1,
            activitiesEn: [{ time: '09:00 AM', text: 'Sightseeing in historic center' }],
            activitiesAr: [{ time: '09:00 ص', text: 'جولة تعريفية في وسط المدينة الأثري' }]
          }
        ],
        totalSeats: 20,
        remainingSeats: 20,
        inclusionsEn: inclusionsEn.split(',').map(s => s.trim()),
        inclusionsAr: inclusionsAr.split(',').map(s => s.trim()),
        exclusionsEn: ['Personal spending'],
        exclusionsAr: ['المصاريف الشخصية'],
        termsEn: 'Non-refundable within 48h of start.',
        termsAr: 'غير قابلة للاسترداد خلال ٤٨ ساعة من البدء.',
        cancellationPolicyEn: 'Standard cancellation terms.',
        cancellationPolicyAr: 'تطبق الشروط القياسية للإلغاء.',
        transportTypeEn: 'Air-conditioned bus',
        transportTypeAr: 'حافلة مكيفة'
      };

      await api.offices.createPackage(newPkg);
      setIsAdding(false);
      setNameEn('');
      setNameAr('');
      setInclusionsEn('');
      setInclusionsAr('');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا البكج؟' : 'Are you sure you want to delete this package?')) return;
    try {
      await api.offices.deletePackage(id);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingAction = async (id: string, action: 'confirmed' | 'rejected') => {
    try {
      await api.offices.bookingAction(id, action);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Check if role allows viewing dashboard
  const userRole = localStorage.getItem('isLoggedIn') === 'true' ? 'office' : 'user'; // Simulated role fallback

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      {/* Simulation Info Bar */}
      <div className="mb-6 p-4.5 bg-blue-50/60 border border-blue-150 rounded-2xl flex items-center gap-3.5">
        <Building className="w-6 h-6 text-secondary shrink-0" />
        <div>
          <span className="font-extrabold text-xs text-slate-800 block">
            {language === 'ar' ? 'محاكاة حساب شريك: مكتب سفر' : 'Simulating Partner Role: Travel Office'}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
            {language === 'ar' 
              ? 'تسمح لك هذه اللوحة بإدارة الجولات السياحية، مراجعة فواتير الحجز والمبيعات الواردة.' 
              : 'Allows managing tourism packages, monitoring invoices, and accepting incoming bookings.'
            }
          </span>
        </div>
      </div>

      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary">{t('officeDashboard')}</h1>
          <p className="text-slate-500 text-xs font-light mt-1">
            {language === 'ar' ? 'إحصائيات المبيعات، البكجات وحجوزات السائحين الفعالة.' : 'Control panel for tours packages, bookings, and revenue logs.'}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-transform flex items-center gap-1.5 border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة بكج سياحي' : 'Add New Package'}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: language === 'ar' ? 'إجمالي البكجات' : 'Tour Packages', value: stats.packagesCount, icon: Compass, color: 'text-secondary bg-blue-50 border-blue-100' },
          { label: language === 'ar' ? 'طلبات الحجز' : 'Booking Orders', value: stats.bookingsCount, icon: Calendar, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: language === 'ar' ? 'الأرباح المحققة' : 'Total Revenue', value: `${stats.totalSales} SAR`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: language === 'ar' ? 'متوسط التقييم' : 'Average Rating', value: `${stats.avgRating.toFixed(1)} / 5`, icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-100' },
        ].map((c, i) => (
          <div key={i} className={`p-5 rounded-3xl border bg-white shadow-sm flex items-center justify-between`}>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{c.label}</span>
              <span className="text-xl font-black text-slate-800 block mt-1">{c.value}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color} shrink-0`}>
              <c.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Form Add Package Modal Drawer */}
      {isAdding && (
        <form onSubmit={handleCreatePackage} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 mb-8 flex flex-col gap-4 max-w-xl">
          <h3 className="font-extrabold text-sm text-primary border-b border-slate-100 pb-2.5">{language === 'ar' ? 'بيانات البكج السياحي الجديد' : 'New Tour Package Information'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
              <input type="text" required value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Summer AlUla Tour" className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
              <input type="text" required value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="جولة العلا الصيفية" className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'السعر للشخص (SAR)' : 'Price per person (SAR)'}</label>
              <input type="number" required value={price} onChange={e => setPrice(Number(e.target.value))} className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'مدة الرحلة بالأيام' : 'Duration (Days)'}</label>
              <input type="number" required value={duration} onChange={e => setDuration(Number(e.target.value))} className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'الخدمات المشمولة بالإنجليزية (مفصولة بفاصلة)' : 'Inclusions English (comma separated)'}</label>
            <input type="text" value={inclusionsEn} onChange={e => setInclusionsEn(e.target.value)} placeholder="Hotel booking, Private guide, Breakfast" className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'الخدمات المشمولة بالعربية (مفصولة بفاصلة)' : 'Inclusions Arabic (comma separated)'}</label>
            <input type="text" value={inclusionsAr} onChange={e => setInclusionsAr(e.target.value)} placeholder="حجز الفندق, مرشد سياحي خاص, وجبة الإفطار" className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none" />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2.5 bg-slate-100 text-slate-650 rounded-xl font-bold text-xs cursor-pointer border-none">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer border-none">{language === 'ar' ? 'حفظ ونشر البكج' : 'Publish Package'}</button>
          </div>
        </form>
      )}

      {/* Tabs selector */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {[
          { id: 'packages', label: language === 'ar' ? 'إدارة البكجات' : 'Tour Packages' },
          { id: 'bookings', label: language === 'ar' ? 'الحجوزات الواردة' : 'Tour Bookings' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 px-4 font-black text-xs border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === t.id ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activeTab === 'packages' ? (
        /* Package list manager view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white border border-slate-200 rounded-[32px] font-bold text-slate-400 text-xs">
              {language === 'ar' ? 'لم تقم بنشر أي بكجات بعد.' : 'No travel packages created yet.'}
            </div>
          ) : (
            packages.map(pkg => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="h-44 overflow-hidden relative">
                  <img src={pkg.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-103 transition-transform" />
                  <button 
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="absolute top-3 right-3 p-2 bg-white/95 rounded-xl text-slate-400 hover:text-red-500 shadow-sm cursor-pointer border-none"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">{language === 'ar' ? pkg.nameAr : pkg.nameEn}</h3>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.durationDays} {language === 'ar' ? 'أيام' : 'days'}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <span className="text-sm font-black text-secondary">{pkg.pricePerPerson} SAR</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Incoming Bookings requests */
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" dir={dir}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-black text-slate-500">{language === 'ar' ? 'رقم الفاتورة' : 'Invoice ID'}</th>
                  <th className="p-4 text-xs font-black text-slate-500">{language === 'ar' ? 'اسم البكج' : 'Package Name'}</th>
                  <th className="p-4 text-xs font-black text-slate-500">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Price'}</th>
                  <th className="p-4 text-xs font-black text-slate-500">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 text-xs font-black text-slate-500">{language === 'ar' ? 'الخيارات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs font-bold text-slate-400">
                      {language === 'ar' ? 'لا توجد حجوزات سائحين حالياً.' : 'No customer bookings received yet.'}
                    </td>
                  </tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-xs font-extrabold text-slate-700">{b.invoiceNumber}</td>
                      <td className="p-4 text-xs font-semibold text-slate-800">{language === 'ar' ? b.itemNameAr : b.itemNameEn}</td>
                      <td className="p-4 text-xs font-black text-secondary">{b.priceDetails.totalPrice} SAR</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          b.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBookingAction(b.id, 'confirmed')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 cursor-pointer transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBookingAction(b.id, 'rejected')}
                              className="p-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg border border-red-100 cursor-pointer transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
