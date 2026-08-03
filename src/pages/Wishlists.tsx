import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FolderPlus, Heart, Share2, Trash2, Users, Check, Lock, 
  Globe, Vote, Plus, X, Search, MapPin, Star, AlertCircle, Trash 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { createFavoriteFolder, deleteFavoriteFolder, removeFavorite } from '../api/favoritesApi';
import { FavoriteList, Destination, Package } from '../../server/types';

export default function Wishlists() {
  const { t, language, dir } = useLanguage();
  const [searchParams] = useSearchParams();
  const sharedListId = searchParams.get('shared');

  // Lists state
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [selectedList, setSelectedList] = useState<FavoriteList | null>(null);
  const [loading, setLoading] = useState(true);

  // Content helpers for detail display
  const [allDests, setAllDests] = useState<Destination[]>([]);
  const [allPkgs, setAllPkgs] = useState<Package[]>([]);

  // Create list form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listName, setListName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // User state
  const currentUserId = localStorage.getItem('isLoggedIn') === 'true' ? 'user_sarah' : 'guest';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.favoriteLists.list(),
      api.destinations.list(),
      api.packages.list()
    ]).then(([listsData, dests, pkgs]) => {
      setLists(listsData);
      setAllDests(dests);
      setAllPkgs(pkgs);

      // If opening a shared link
      if (sharedListId) {
        const shared = listsData.find(l => l.id === sharedListId);
        if (shared) {
          setSelectedList(shared);
        }
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [sharedListId]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    try {
      const folderRes = await createFavoriteFolder({ name: listName.trim(), isPublic });
      const newList: FavoriteList = {
        id: folderRes.id,
        userId: currentUserId,
        name: folderRes.name,
        isPublic: folderRes.isPublic,
        invitees: [],
        votes: {},
        items: []
      };
      setLists(prev => [...prev, newList]);
      setSelectedList(newList);
      setListName('');
      setIsPublic(false);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleDeleteList = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه القائمة؟' : 'Are you sure you want to delete this list?')) return;
    
    try {
      await deleteFavoriteFolder(id);
      setLists(prev => prev.filter(l => l.id !== id));
      if (selectedList?.id === id) {
        setSelectedList(null);
      }
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
  };

  const handleRemoveItem = async (listId: string, type: string, itemId: string) => {
    try {
      await removeFavorite(type, itemId);
      setLists(prev => prev.map(l => {
        if (l.id !== listId) return l;
        const items = l.items || [];
        const filtered = items.filter((i: any) => !(i.type === type && i.itemId === itemId));
        return { ...l, items: filtered };
      }));
      if (selectedList && selectedList.id === listId) {
        const items = selectedList.items || [];
        const filtered = items.filter((i: any) => !(i.type === type && i.itemId === itemId));
        setSelectedList({ ...selectedList, items: filtered });
      }
    } catch (err) {
      console.error('Failed to remove favorite item:', err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList || !inviteEmail.trim()) return;

    try {
      await api.favoriteLists.invite(selectedList.id, inviteEmail.trim());
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 3000);
      
      // Refresh list details
      const listsData = await api.favoriteLists.list();
      setLists(listsData);
      const updated = listsData.find(l => l.id === selectedList.id);
      if (updated) setSelectedList(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (itemId: string) => {
    if (!selectedList) return;
    try {
      const updatedList = await api.favoriteLists.vote(selectedList.id, itemId);
      setLists(prev => prev.map(l => l.id === selectedList.id ? updatedList : l));
      setSelectedList(updatedList);
    } catch (err) {
      console.error(err);
    }
  };

  const copyShareLink = () => {
    if (!selectedList) return;
    const link = `${window.location.origin}/wishlists?shared=${selectedList.id}`;
    navigator.clipboard.writeText(link)
      .then(() => alert(language === 'ar' ? 'تم نسخ رابط المشاركة!' : 'Share link copied to clipboard!'))
      .catch(console.error);
  };

  // Find detailed content of items in the current list
  const getListItemDetails = (item: { type: string; itemId: string }) => {
    if (item.type === 'destination') {
      const dest = allDests.find(d => d.id === item.itemId);
      if (dest) return {
        id: dest.id,
        name: language === 'ar' ? dest.nameAr : dest.nameEn,
        image: dest.image,
        category: dest.category,
        rating: dest.rating,
        link: `/destination/${dest.id}`
      };
    } else if (item.type === 'package') {
      const pkg = allPkgs.find(p => p.id === item.itemId);
      if (pkg) return {
        id: pkg.id,
        name: language === 'ar' ? pkg.nameAr : pkg.nameEn,
        image: pkg.images[0],
        category: 'Package',
        rating: pkg.rating,
        link: '/packages'
      };
    }
    return null;
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-28" dir={dir}>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{t('wishlist')}</span>
          <h1 className="text-3xl md:text-4xl font-black text-primary mt-1">
            {t('customLists')}
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-full text-xs font-black shadow-lg hover:scale-101 transition-transform border-none cursor-pointer"
        >
          <FolderPlus className="w-4.5 h-4.5" />
          <span>{t('createList')}</span>
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Left Sidebar: folders list */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">
              {language === 'ar' ? 'مجلداتي المفضلة' : 'My Wishlist Folders'}
            </h2>
            {lists.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 text-center text-slate-400 text-xs font-bold shadow-sm">
                {language === 'ar' ? 'لا توجد قوائم مفضلة حالياً.' : 'No wishlist folders created yet.'}
              </div>
            ) : (
              lists.map((list) => {
                const isSelected = selectedList?.id === list.id;
                return (
                  <div
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`bg-white border p-4.5 rounded-[24px] shadow-sm flex items-center justify-between cursor-pointer group transition-all ${
                      isSelected ? 'border-secondary ring-2 ring-blue-50' : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Heart className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-primary transition-colors">{list.name}</h3>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">
                          {list.items.length} {language === 'ar' ? 'عناصر' : 'items'} • {list.isPublic ? t('makePublic') : (language === 'ar' ? 'خاصة' : 'Private')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteList(list.id, e)}
                      className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer border-none"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* 2. Main Content panel: list details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedList ? (
                <motion.div
                  key={selectedList.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col gap-6"
                >
                  {/* Folder Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        {selectedList.isPublic ? <Globe className="w-3.5 h-3.5 text-secondary" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{selectedList.isPublic ? t('makePublic') : (language === 'ar' ? 'خاصة' : 'Private')}</span>
                      </div>
                      <h2 className="text-2xl font-black text-primary mt-1">{selectedList.name}</h2>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={copyShareLink}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        {language === 'ar' ? 'مشاركة الرابط' : 'Share Link'}
                      </button>
                    </div>
                  </div>

                  {/* Collaborative Invite Section */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-2.5">
                      <Users className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">{language === 'ar' ? 'التعاون والمشاركة الجماعية' : 'Invite & Collab'}</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                          {language === 'ar' 
                            ? 'ادعُ أصدقاءك للتعاون في إضافة عناصر لهذه القائمة والتصويت على وجهات رحلتكم المقترحة!' 
                            : 'Invite friends to collaborate by contributing items and voting on travel destinations!'
                          }
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleInvite} className="flex gap-2.5 items-stretch">
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder={language === 'ar' ? 'البريد الإلكتروني للصديق...' : 'Friend email address...'}
                        className="flex-1 px-4 h-11 text-xs rounded-xl border border-slate-200 outline-none bg-white focus:ring-2 focus:ring-secondary"
                      />
                      <button
                        type="submit"
                        className="px-5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:scale-[1.01] transition-transform border-none cursor-pointer"
                      >
                        {t('invite')}
                      </button>
                    </form>

                    {inviteSuccess && (
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {t('inviteSuccess')}
                      </div>
                    )}

                    {selectedList.invitees.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center mt-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'المدعوون:' : 'Invitees:'}</span>
                        {selectedList.invitees.map((email, i) => (
                          <span key={i} className="text-[9px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                            {email}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="flex flex-col gap-4">
                    <h3 className="font-extrabold text-sm text-slate-800">{language === 'ar' ? 'العناصر المحفوظة' : 'Saved Items'}</h3>
                    
                    {selectedList.items.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-bold">
                        {language === 'ar' ? 'لم تقم بحفظ أي عناصر في هذه القائمة بعد.' : 'No saved items in this list yet.'}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedList.items.map((item) => {
                          const details = getListItemDetails(item);
                          if (!details) return null;

                          const votesCount = selectedList.votes[item.itemId]?.length || 0;
                          const hasVoted = selectedList.votes[item.itemId]?.includes(currentUserId) || false;

                          return (
                            <div 
                              key={item.itemId}
                              className="border border-slate-150 rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center gap-3.5 w-full">
                                <img 
                                  src={details.image} 
                                  alt={details.name} 
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <span className="text-[9px] font-black text-secondary tracking-widest uppercase block mb-0.5">{details.category}</span>
                                  <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1">{details.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    {details.rating}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                {/* Voting system */}
                                <button
                                  onClick={() => handleVote(item.itemId)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    hasVoted 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                      : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                                  }`}
                                >
                                  <Vote className="w-3.5 h-3.5" />
                                  <span>{t('vote')} ({votesCount})</span>
                                </button>

                                <button
                                  onClick={() => handleRemoveItem(selectedList.id, item.type, item.itemId)}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none cursor-pointer"
                                >
                                  <Trash className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-96 border border-dashed border-slate-250 rounded-[32px] flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/50">
                  <Heart className="w-12 h-12 text-slate-350 animate-pulse mb-3" />
                  <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-widest">
                    {language === 'ar' ? 'اختر مجلداً مفضلاً لعرض التفاصيل' : 'Select a folder to view details'}
                  </h3>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* Create List Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100 p-6 flex flex-col gap-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">{t('createList')}</span>
                  <h3 className="text-xl font-black text-primary mt-0.5">{language === 'ar' ? 'إنشاء مجلد مفضل جديد' : 'New Wishlist Folder'}</h3>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateList} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('listName')}</label>
                  <input
                    type="text"
                    required
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: رحلة عطلة الشتاء في أبها' : 'e.g. Winter Trip to Abha'}
                    className="h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-secondary focus:bg-white"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group text-xs text-slate-700 font-semibold select-none py-1">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-350 text-secondary focus:ring-secondary"
                  />
                  <span className="group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {language === 'ar' ? 'اجعل القائمة عامة (يمكن مشاركتها برابط)' : 'Make public (accessible via link)'}
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full h-13 mt-2 bg-primary text-white font-bold rounded-full shadow-md hover:scale-101 transition-transform border-none cursor-pointer"
                >
                  {t('createList')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
