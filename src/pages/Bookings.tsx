import React, { useState, useEffect } from 'react';
import { 
  Bookmark, Calendar, DollarSign, QrCode, ShieldCheck, 
  Trash2, X, Check, Star, RefreshCw, MessageSquare, AlertCircle, Clock 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { getBookings, cancelBooking } from '../api/bookingsApi';
import { Booking } from '../../server/types';

export default function Bookings() {
  const { t, language, dir } = useLanguage();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [cleanliness, setCleanliness] = useState(5);
  const [safety, setSafety] = useState(5);
  const [price, setPrice] = useState(5);
  const [service, setService] = useState(5);
  const [crowding, setCrowding] = useState(3);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadBookings = () => {
    setLoading(true);
    getBookings()
      .then(res => {
        setBookings(res as any);
        if (selectedBooking) {
          const found = (res as any[]).find(b => b.id === selectedBooking.id);
          setSelectedBooking(found || null);
        }
      })
      .catch(err => {
        console.error('Failed to load bookings from ASP.NET Core:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
      await api.bookings.complete(id);
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !reviewComment.trim()) return;

    try {
      await api.bookings.submitReview(selectedBooking.id, {
        rating: reviewRating,
        comment: reviewComment,
        cleanliness,
        safety,
        price,
        service,
        crowding
      });
      setReviewSuccess(true);
      setReviewComment('');
      setShowReviewModal(false);
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-secondary shrink-0" />
          {t('myBookings')}
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-light">
          {language === 'ar'
            ? 'تتبع حالة حجوزاتك، اطلع على فواتير الشراء، واستخدم أكواد التذاكر لتسجيل الدخول.'
            : 'Track reservation status, inspect receipts, and display QR code tickets for check-in.'
          }
        </p>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] font-bold text-slate-400 shadow-sm max-w-md mx-auto">
          {language === 'ar' ? 'لا توجد حجوزات نشطة حالياً.' : 'No active bookings found in your travel logs.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            {bookings.map(b => {
              const name = language === 'ar' ? b.itemNameAr : b.itemNameEn;
              const isSelected = selectedBooking?.id === b.id;
              
              return (
                <div
                  key={b.id}
                  onClick={() => { setSelectedBooking(b); setReviewSuccess(false); }}
                  className={`p-5 bg-white border rounded-[28px] shadow-sm hover:shadow-md cursor-pointer transition-all flex gap-4 items-center justify-between ${
                    isSelected ? 'border-secondary ring-1 ring-secondary' : 'border-slate-200'
                  }`}
                >
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                      <img src={b.itemImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {b.type}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-800 truncate mt-1">{name}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{b.startDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-secondary block">{b.priceDetails.totalPrice} SAR</span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1.5 inline-block ${
                      b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      b.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      b.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ticket Details & QR Invoice */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-6">
            {!selectedBooking ? (
              <div className="text-center py-20 text-slate-400 font-bold text-xs">
                {language === 'ar' ? 'اختر حجزاً لمشاهدة تفاصيل التذكرة والفاتورة.' : 'Select a booking to view ticket receipt & QR details.'}
              </div>
            ) : (
              <>
                {/* Header info */}
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{selectedBooking.invoiceNumber}</span>
                  <h3 className="font-extrabold text-base text-slate-800 mt-1">{language === 'ar' ? selectedBooking.itemNameAr : selectedBooking.itemNameEn}</h3>
                </div>

                {/* Simulated QR Code Coupon */}
                <div className="bg-slate-50 border border-dashed border-slate-250 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${selectedBooking.qrCode}`} 
                      alt="Ticket QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">{selectedBooking.qrCode.slice(0, 15)}...</span>
                </div>

                {/* Receipt Invoices breakdown */}
                <div className="space-y-2 pb-4 border-b border-slate-100 text-xs font-semibold text-slate-650">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pb-1">{t('invoice') || 'Receipt'}</span>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'السعر الأساسي' : 'Base Price'}</span>
                    <span>{selectedBooking.priceDetails.basePrice} SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                    <span>{selectedBooking.priceDetails.taxes} SAR</span>
                  </div>
                  <div className="flex justify-between font-black text-secondary text-sm pt-1 border-t border-slate-100">
                    <span>{language === 'ar' ? 'الإجمالي الكلي' : 'Total Invoice'}</span>
                    <span>{selectedBooking.priceDetails.totalPrice} SAR</span>
                  </div>
                </div>

                {/* Simulation Control actions for verification */}
                <div className="flex flex-col gap-2">
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => handleCompleteBooking(selectedBooking.id)}
                        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 border-none cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        {language === 'ar' ? 'محاكاة: اكتمال الرحلة' : 'Simulate: Complete Stay'}
                      </button>
                      
                      <button
                        onClick={() => handleCancelBooking(selectedBooking.id)}
                        className="w-full h-11 bg-white hover:bg-red-50 text-red-500 border border-slate-200 hover:border-red-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        {language === 'ar' ? 'إلغاء هذا الحجز' : 'Cancel Reservation'}
                      </button>
                    </>
                  )}

                  {selectedBooking.status === 'completed' && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full h-11 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 border-none cursor-pointer"
                    >
                      <MessageSquare className="w-4.5 h-4.5" />
                      {language === 'ar' ? 'اكتب تقييم التجربة' : 'Write Experience Review'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      )}

      {/* Review Modal Dialog */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div onClick={() => setShowReviewModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white border border-slate-200 shadow-2xl rounded-[32px] p-6 max-w-md w-full relative z-10 flex flex-col gap-4 max-h-[85vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black text-primary">{language === 'ar' ? 'تقييم تجربة حجز مكتملة' : 'Rate Completed Experience'}</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">{t('rating')}</label>
                <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="h-10 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50">
                  {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} {language === 'ar' ? 'نجوم' : 'stars'}</option>)}
                </select>
              </div>

              {/* Cleanliness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-slate-650">
                  <span>{t('cleanliness')}</span>
                  <span>{cleanliness}/5</span>
                </div>
                <input type="range" min="1" max="5" value={cleanliness} onChange={e => setCleanliness(Number(e.target.value))} className="w-full accent-secondary" />
              </div>

              {/* Safety */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-slate-650">
                  <span>{t('safety')}</span>
                  <span>{safety}/5</span>
                </div>
                <input type="range" min="1" max="5" value={safety} onChange={e => setSafety(Number(e.target.value))} className="w-full accent-secondary" />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-slate-650">
                  <span>{t('price')}</span>
                  <span>{price}/5</span>
                </div>
                <input type="range" min="1" max="5" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full accent-secondary" />
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">{language === 'ar' ? 'اكتب انطباعك بالتفصيل' : 'Write your comment'}</label>
                <textarea required rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-slate-50 resize-none outline-none focus:ring-2 focus:ring-secondary" />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-primary text-white font-bold text-xs rounded-xl shadow-md border-none cursor-pointer"
              >
                {language === 'ar' ? 'إرسال التقييم المعتمد' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
