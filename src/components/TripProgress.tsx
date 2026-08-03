import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface Milestone {
  id: string;
  textEn: string;
  textAr: string;
  completed: boolean;
}

const defaultMilestones: Milestone[] = [
  { id: '1', textEn: 'Book Flights', textAr: 'حجز رحلات الطيران', completed: false },
  { id: '2', textEn: 'Reserve Accommodation', textAr: 'حجز مكان الإقامة', completed: false },
  { id: '3', textEn: 'Plan Itinerary', textAr: 'تخطيط مسار الرحلة', completed: false },
  { id: '4', textEn: 'Pack Bags', textAr: 'تجهيز الحقائب', completed: false },
];

export default function TripProgress({ destinationId }: { destinationId: string }) {
  const { language, dir } = useLanguage();
  const storageKey = `trip-progress-${destinationId}`;
  
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultMilestones;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(milestones));
  }, [milestones, storageKey]);

  const toggleMilestone = (id: string) => {
    setMilestones(prev => 
      prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m)
    );
  };

  const progress = Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 mb-8 shadow-sm"
      dir={dir}
    >
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary mb-1">
            {language === 'ar' ? 'مسار الرحلة' : 'Trip Progress'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {language === 'ar' ? 'قائمة التحقق الخاصة بك' : 'Your preparation checklist'}
          </p>
        </div>
        <div className="text-2xl font-black text-secondary">{progress}%</div>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-secondary rounded-full"
        />
      </div>

      <div className="flex flex-col gap-3">
        {milestones.map((milestone) => (
          <button
            key={milestone.id}
            onClick={() => toggleMilestone(milestone.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
              milestone.completed 
                ? 'bg-slate-50 border-slate-200 opacity-70' 
                : 'bg-white border-slate-200 hover:border-secondary hover:shadow-sm'
            }`}
          >
            {milestone.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 shrink-0" />
            )}
            <span className={`font-semibold ${milestone.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {language === 'ar' ? milestone.textAr : milestone.textEn}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
