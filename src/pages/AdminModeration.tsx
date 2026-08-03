import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge, PrimaryButton, SecondaryButton } from '../components/ui/ButtonsAndBadges';
import { EmptyState } from '../components/ui/States';

export default function AdminModeration() {
  const { language, dir } = useLanguage();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReasonModal, setRejectReasonModal] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');

  const loadSubmissions = () => {
    setLoading(true);
    api.destinations.getPending()
      .then(res => setSubmissions(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.destinations.approve(id);
      loadSubmissions();
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReasonModal) return;
    try {
      await api.destinations.reject(rejectReasonModal, reasonText);
      setRejectReasonModal(null);
      setReasonText('');
      loadSubmissions();
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  return (
    <PageContainer dir={dir}>
      <SectionHeader
        title={language === 'ar' ? 'لوحة إشراف واعتماد الوجهات' : 'Destination Moderation Panel'}
        subtitle={language === 'ar' ? 'مراجعة وتدقيق الوجهات المقدمة من المستخدمين قبل نشرها للجمهور' : 'Review user-submitted destinations before public indexing'}
        icon={<ShieldCheck className="w-7 h-7 text-emerald-600" />}
        action={
          <SecondaryButton onClick={loadSubmissions} icon={<RefreshCw className="w-4 h-4" />}>
            {language === 'ar' ? 'تحديث السجلات' : 'Refresh Data'}
          </SecondaryButton>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? 'قيد الانتظار' : 'Pending Review'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title={language === 'ar' ? 'لا توجد طلبات وجهات جديدة حالياً' : 'No pending destination requests'}
          description={language === 'ar' ? 'تمت مراجعة واعتماد جميع الطلبات المرفوعة في المنصة.' : 'All submitted destination requests have been audited.'}
        />
      ) : (
        <div className="space-y-4">
          {submissions.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80'}
                  alt={item.nameEn}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">
                      {language === 'ar' ? item.nameAr || item.nameEn : item.nameEn}
                    </h4>
                    <Badge variant="amber">{item.status || 'Pending'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl line-clamp-2">
                    {language === 'ar' ? item.descriptionAr || item.descriptionEn : item.descriptionEn}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{language === 'ar' ? `المدينة: ${item.cityId}` : `City: ${item.cityId}`}</span>
                    <span>•</span>
                    <span>{language === 'ar' ? `الفئة: ${item.category}` : `Category: ${item.category}`}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <PrimaryButton
                  onClick={() => handleApprove(item.id)}
                  variant="emerald"
                  icon={<Check className="w-4 h-4" />}
                  className="text-xs py-2 px-3"
                >
                  {language === 'ar' ? 'موافقة واعتماد' : 'Approve'}
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => setRejectReasonModal(item.id)}
                  className="text-xs py-2 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
                  icon={<X className="w-4 h-4 text-rose-600" />}
                >
                  {language === 'ar' ? 'رفض' : 'Reject'}
                </SecondaryButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ar' ? 'سبب رفض الوجهة' : 'Reason for Rejection'}
            </h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={language === 'ar' ? 'ادخل سبب الرفض الموضح للمستخدم (مثال: عدم وضوح الصور أو نقص المعلومات)...' : 'Enter the reason for rejection...'}
                className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
              <div className="flex gap-2 justify-end">
                <SecondaryButton type="button" onClick={() => setRejectReasonModal(null)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </SecondaryButton>
                <PrimaryButton type="submit" variant="dark">
                  {language === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
