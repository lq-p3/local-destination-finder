import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShieldCheck, MapPin, Building, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { destinations } from '../api';

export default function AdminCms() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'destinations' | 'hotels' | 'events'>('destinations');
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPending() {
      setIsLoading(true);
      try {
        const res = await destinations.getPending();
        setPendingItems(res || []);
      } catch (err) {
        console.warn('Failed to load pending moderation items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await destinations.approve(id);
      setPendingItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to approve destination:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await destinations.reject(id, 'Unsuitable image resolution or missing required location metadata');
      setPendingItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to reject destination:', err);
    }
  };

  return (
    <PageContainer className="space-y-8">
      <SectionHeader
        title={isAr ? 'لوحة إدارة المحتوى والإشراف (Admin CMS)' : 'Admin Content Management System'}
        subtitle={isAr ? 'مراجعة واعتماد الوجهات والمعالم والفعاليات السياحية' : 'Review and approve tourism destinations, hotels, and events'}
        icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
      />

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'destinations', labelAr: 'الوجهات المعلقة', labelEn: 'Pending Destinations', icon: MapPin },
          { id: 'hotels', labelAr: 'الفنادق والإقامة', labelEn: 'Hotels & Stay', icon: Building },
          { id: 'events', labelAr: 'الفعاليات والمواسم', labelEn: 'Events & Seasons', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                isActive ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          {isAr ? 'جاري تحميل الطلبات المعلقة...' : 'Loading pending review items...'}
        </div>
      ) : pendingItems.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{isAr ? 'جميع المحتويات مراجعة ومكتملة' : 'All Items Reviewed'}</h3>
          <p className="text-xs text-slate-500">{isAr ? 'لا توجد طلبات إضافة جديدة بانتظار الإشراف حالياً.' : 'There are no pending submissions awaiting moderation.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{isAr ? item.nameAr : item.nameEn}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.status}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{isAr ? item.descriptionAr : item.descriptionEn}</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'اعتماد ونشر' : 'Approve & Publish'}</span>
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-2xl text-xs hover:bg-red-100 transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isAr ? 'رفض' : 'Reject'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
