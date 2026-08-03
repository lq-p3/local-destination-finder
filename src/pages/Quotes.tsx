import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Compass, DollarSign, Calendar, Clock, Check, X,
  FileText, Plus, Send, Landmark, BadgePercent, CheckCircle, User 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { getQuoteRequests, createQuoteRequest, submitQuoteProposal, acceptQuoteProposal } from '../api/quotesApi';

export default function Quotes() {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState(localStorage.getItem('userEmail') || '');
  const userRole = localStorage.getItem('isLoggedIn') === 'true' 
    ? (role === 'sarah.travels@example.com' ? 'user' : 'office')
    : 'user';

  const [loading, setLoading] = useState(true);
  
  // Tourist requests list & form
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [targetCities, setTargetCities] = useState<string[]>(['Abha']);
  const [startDate, setStartDate] = useState('');
  const [daysCount, setDaysCount] = useState(3);
  const [budget, setBudget] = useState<'economic' | 'medium' | 'luxury'>('medium');
  const [notes, setNotes] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Office requests tracker & proposal states
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [proposalPrice, setProposalPrice] = useState(1000);
  const [proposalItinerary, setProposalItinerary] = useState('');
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const loadData = () => {
    setLoading(true);
    getQuoteRequests()
      .then(res => {
        setMyRequests(res);
        setAllRequests(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    // Listen to role changes
    const handleStorageChange = () => {
      setRole(localStorage.getItem('userEmail') || '');
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [role]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || targetCities.length === 0) return;

    try {
      await createQuoteRequest({
        cities: targetCities,
        startDate,
        daysCount,
        budget,
        notes
      });
      setRequestSuccess(true);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote request.');
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !proposalItinerary.trim()) return;

    try {
      await submitQuoteProposal(selectedReq.id, {
        price: Number(proposalPrice),
        itinerarySummary: proposalItinerary
      });
      setProposalSuccess(true);
      setProposalItinerary('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote proposal.');
    }
  };

  const handleAcceptProposal = async (proposalId: string, price: number) => {
    if (!selectedReq) return;
    try {
      await acceptQuoteProposal(selectedReq.id, proposalId);
      alert(language === 'ar' ? 'تم قبول عرض السعر بنجاح!' : 'Quote proposal accepted successfully!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote proposal.');
    }
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      
      {/* Role Simulator Message */}
      <div className="mb-6 p-4.5 bg-blue-50/60 border border-blue-150 rounded-2xl flex items-center gap-3.5">
        <Building className="w-6 h-6 text-secondary shrink-0" />
        <div>
          <span className="font-extrabold text-xs text-slate-800 block">
            {userRole === 'office' 
              ? (language === 'ar' ? 'محاكاة لوحة عروض الأسعار: مكتب سفر' : 'Quotes Board: Travel Office View')
              : (language === 'ar' ? 'لوحة عروض الأسعار المخصصة: سائح' : 'Quotes Center: Tourist View')
            }
          </span>
          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
            {userRole === 'office'
              ? (language === 'ar' ? 'يمكنك تصفح طلبات السائحين وتقديم عروض أسعار تنافسية.' : 'Browse tourist requirements and submit travel package bids.')
              : (language === 'ar' ? 'اطلب مخططات أسعار مخصصة لرحلتك من مكاتب السفر المحلية.' : 'Request personalized trip budgets from registered local agencies.')
            }
          </span>
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-2">
          <BadgePercent className="w-8 h-8 text-secondary shrink-0" />
          {language === 'ar' ? 'عروض الأسعار المخصصة' : 'Custom Trip Quotes'}
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-light">
          {language === 'ar'
            ? 'تواصل مع مكاتب السفر المحلية للحصول على ميزانيات وجداول مخصصة لرحلتك.'
            : 'Acquire direct bid estimations and planned schedules from local agencies.'
          }
        </p>
      </header>

      {userRole === 'office' ? (
        /* Office Bid Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Requests list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-700 mb-2">{language === 'ar' ? 'طلبات السائحين المتاحة' : 'Active Tourist Requests'}</h3>
            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : allRequests.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-[32px] font-bold text-slate-400 text-xs">
                {language === 'ar' ? 'لا توجد طلبات جارية حالياً.' : 'No tourist quote requests active.'}
              </div>
            ) : (
              allRequests.map(r => (
                <div
                  key={r.id}
                  onClick={() => { setSelectedReq(r); setProposalSuccess(false); }}
                  className={`p-5 bg-white border rounded-[28px] shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center ${
                    selectedReq?.id === r.id ? 'border-secondary ring-1 ring-secondary' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-secondary" />
                      <span>{r.userName}</span>
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-800 mt-2">{r.cities.join(' • ')}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{r.startDate} • {r.daysCount} {language === 'ar' ? 'أيام' : 'days'}</span>
                    </span>
                  </div>
                  <span className="text-xs font-black text-secondary uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {r.budget}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Bid Proposal Submission Box */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
            {!selectedReq ? (
              <div className="text-center py-20 text-slate-400 font-bold text-xs">
                {language === 'ar' ? 'حدد طلباً لتقديم عرض سعر.' : 'Select a tourist request to submit pricing proposal.'}
              </div>
            ) : (
              <>
                <h3 className="font-extrabold text-sm text-primary mb-1">{language === 'ar' ? 'تقديم عرض سعر مخصص' : 'Submit Agency Bid'}</h3>
                <span className="text-[10px] font-bold text-slate-400">{selectedReq.userName} • {selectedReq.cities.join(', ')}</span>

                {proposalSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-emerald-600 font-bold text-xs flex flex-col items-center gap-2 mt-4">
                    <CheckCircle className="w-8 h-8" />
                    <span>{language === 'ar' ? 'تم إرسال عرض السعر للسائح!' : 'Bid submitted to client!'}</span>
                  </div>
                ) : (
                  <form onSubmit={handleProposalSubmit} className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'السعر الإجمالي للرحلة (SAR)' : 'Total Price Bid (SAR)'}</label>
                      <input type="number" required value={proposalPrice} onChange={e => setProposalPrice(Number(e.target.value))} className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'تفاصيل الخدمات وموجز البرنامج' : 'Itinerary & Services Description'}</label>
                      <textarea required rows={4} value={proposalItinerary} onChange={e => setProposalItinerary(e.target.value)} placeholder={language === 'ar' ? 'اكتب تفاصيل الفنادق والجولات المشمولة...' : 'Explain hotel tiers, guide details, and schedules included...'} className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none resize-none" />
                    </div>

                    <button type="submit" className="w-full h-12 bg-primary text-white font-bold text-xs rounded-xl shadow-md border-none cursor-pointer">
                      {language === 'ar' ? 'إرسال عرض السعر' : 'Send proposal'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

        </div>
      ) : (
        /* Tourist Request & Bids Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Request Form */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-primary border-b border-slate-100 pb-2.5">{language === 'ar' ? 'طلب عرض سعر جديد' : 'New Quote Request'}</h3>
            
            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'المدن المستهدفة' : 'Cities'}</label>
                <div className="flex flex-wrap gap-2">
                  {['Abha', 'AlUla', 'Riyadh', 'Jeddah'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        if (targetCities.includes(city)) {
                          setTargetCities(prev => prev.filter(c => c !== city));
                        } else {
                          setTargetCities(prev => [...prev, city]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        targetCities.includes(city) ? 'bg-secondary text-white border-secondary' : 'bg-slate-50 text-slate-650 border-slate-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'عدد الأيام' : 'Days Count'}</label>
                  <input type="number" required min="1" value={daysCount} onChange={e => setDaysCount(Number(e.target.value))} className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'الميزانية المفضلة' : 'Preferred Budget'}</label>
                <select value={budget} onChange={e => setBudget(e.target.value as any)} className="h-11 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none cursor-pointer">
                  <option value="economic">{language === 'ar' ? 'اقتصادية' : 'Economic'}</option>
                  <option value="medium">{language === 'ar' ? 'متوسطة' : 'Moderate'}</option>
                  <option value="luxury">{language === 'ar' ? 'فاخرة' : 'Luxury'}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{language === 'ar' ? 'طلبات خاصة إضافية' : 'Notes & Requests'}</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={language === 'ar' ? 'مثال: حجز طيران داخلي، فنادق مطله، مرشد نسائي...' : 'Example: indoor pool, flight booking, mountain guides...'} className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none resize-none focus:ring-2 focus:ring-secondary" />
              </div>

              <button type="submit" className="w-full h-12 bg-primary text-white font-bold text-xs rounded-xl shadow-md border-none cursor-pointer">
                {language === 'ar' ? 'نشر طلب عرض السعر' : 'Post Quote Request'}
              </button>
            </form>
          </div>

          {/* Submissions list with agency offers comparison */}
          <div className="lg:col-span-2 space-y-5">
            <h3 className="font-extrabold text-sm text-slate-700">{language === 'ar' ? 'طلباتك النشطة والعروض المقدمة' : 'My Requests & Agency Bids'}</h3>
            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-[32px] font-bold text-slate-400 text-xs">
                {language === 'ar' ? 'لم تقم بنشر أي طلبات بعد.' : 'No custom quote requests posted yet.'}
              </div>
            ) : (
              myRequests.map(req => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start pb-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">{req.cities.join(' • ')}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{req.startDate} • {req.daysCount} {language === 'ar' ? 'أيام' : 'days'}</span>
                      </span>
                    </div>
                    <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      {req.budget}
                    </span>
                  </div>

                  {/* Bids received list */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{language === 'ar' ? 'عروض الأسعار المستلمة' : 'Incoming Agency Bids'} ({req.proposals?.length || 0})</span>
                    
                    {(!req.proposals || req.proposals.length === 0) ? (
                      <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'قيد انتظار عروض الوكالات المحلية...' : 'Waiting for local agency bids...'}</span>
                    ) : (
                      req.proposals.map((prop: any) => (
                        <div key={prop.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-secondary" />
                              <span>{language === 'ar' ? prop.officeNameAr : prop.officeNameEn}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-light block leading-relaxed">{prop.itinerarySummary}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                            <div className="text-right">
                              <span className="text-sm font-black text-secondary block">{prop.price} SAR</span>
                            </div>
                            <button
                              onClick={() => handleAcceptProposal(prop.id, prop.price)}
                              className="px-4 py-2.5 bg-primary hover:bg-slate-900 text-white font-bold text-[10px] rounded-xl shadow-md border-none cursor-pointer transition-colors"
                            >
                              {language === 'ar' ? 'قبول ودفع الديبوزيت' : 'Accept & Checkout'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
