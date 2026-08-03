import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../api/authTypes';

export default function Register() {
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(dir === 'rtl' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError(dir === 'rtl' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      return;
    }

    try {
      await register({ name, email, password, role });
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (err: any) {
      setError(err.message || (dir === 'rtl' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account'));
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8 flex flex-col gap-6 relative">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">{t('createAccount')}</h1>
        <p className="text-slate-500 font-medium">{t('joinUs')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-xs font-semibold p-3.5 rounded-2xl border border-red-100 text-center">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Role Toggle Switcher */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
          </label>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 mb-2">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                role === 'user'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? 'سائح' : 'Tourist'}
            </button>
            <button
              type="button"
              onClick={() => setRole('guide')}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                role === 'guide'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? 'مرشد سياحي' : 'Tourist Guide'}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className={`absolute top-0 bottom-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400`}>
            <User className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={t('fullName')}
            disabled={isLoading}
            className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-secondary focus:bg-white outline-none transition-all disabled:opacity-50`}
          />
        </div>

        <div className="relative">
          <div className={`absolute top-0 bottom-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400`}>
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder={t('email')}
            disabled={isLoading}
            className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-secondary focus:bg-white outline-none transition-all disabled:opacity-50`}
          />
        </div>

        <div className="relative">
          <div className={`absolute top-0 bottom-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400`}>
            <Lock className="w-5 h-5" />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder={t('password')}
            disabled={isLoading}
            className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-secondary focus:bg-white outline-none transition-all disabled:opacity-50`}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-14 mt-4 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {t('register')}
              <Arrow className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <span className="text-slate-500 text-sm font-medium">{t('haveAccount')} </span>
        <Link to="/login" className="text-secondary font-bold text-sm hover:underline">
          {t('loginNow')}
        </Link>
      </div>
    </div>
  );
}

