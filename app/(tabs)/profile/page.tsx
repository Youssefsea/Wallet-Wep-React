'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, changePassword } from '@/lib/api';
import Spinner from '@/components/Spinner';

export default function ProfilePage() {
  const { user, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => { setName(user?.name ?? ''); }, [user]);

  const handleSave = async () => {
    setProfileError(''); setSaveLoading(true);
    try { await updateProfile(name.trim()); await refreshProfile(); setEditing(false); }
    catch (err: any) { setProfileError(err.response?.data?.message ?? 'خطأ في تحديث البيانات'); }
    finally { setSaveLoading(false); }
  };

  const handlePassword = async () => {
    setPassError(''); setPassSuccess('');
    if (!oldPass || !newPass || !confirmPass) { setPassError('جميع الحقول مطلوبة'); return; }
    if (newPass !== confirmPass) { setPassError('كلمة المرور غير متطابقة'); return; }
    if (newPass.length < 8) { setPassError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setPassLoading(true);
    try {
      await changePassword(oldPass, newPass);
      setShowPassword(false); setOldPass(''); setNewPass(''); setConfirmPass('');
      setPassSuccess('تم تغيير كلمة المرور بنجاح');
    } catch (err: any) { setPassError(err.response?.data?.message ?? 'كلمة المرور القديمة غير صحيحة'); }
    finally { setPassLoading(false); }
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) { logout(); router.replace('/login'); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10 pb-6">
      <button onClick={() => router.back()} className="mb-2 text-[35px] text-text-primary hover:opacity-70 transition-opacity">→</button>
      <h1 className="mb-3 font-cairo text-2xl font-bold text-text-primary">الحساب</h1>

      <div className="mb-8 flex flex-col items-center py-4 lg:py-6">
        <div className="mb-3 flex h-24 w-24 lg:h-28 lg:w-28 items-center justify-center rounded-full bg-primary">
          <span className="font-manrope text-[32px] lg:text-[36px] font-bold text-white">{(user?.name ?? '?').charAt(0).toUpperCase()}</span>
        </div>
        <p className="font-cairo text-lg font-bold text-text-primary">{user?.name ?? ''}</p>
        <p className="font-cairo text-sm text-text-secondary">{user?.email ?? ''}</p>
      </div>

      <div className="max-w-xl mx-auto mb-5 rounded-2xl bg-bg-card p-6 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-cairo text-base font-bold text-text-primary">المعلومات الشخصية</h3>
          <button onClick={() => setEditing(!editing)} className="font-cairo text-sm font-medium text-primary hover:underline transition-all">
            {editing ? 'إلغاء' : 'تعديل'}
          </button>
        </div>
        {profileError && <div className="mb-3 rounded-lg bg-error-light p-2 text-center font-cairo text-xs text-error">{profileError}</div>}
        <label className="mb-1 block text-right font-cairo text-xs font-medium text-text-secondary">الاسم</label>
        <input className={`mb-3 h-[52px] w-full rounded-xl border border-border px-3 text-right font-cairo text-sm text-text-primary ${!editing ? 'bg-border-light text-text-secondary' : 'bg-bg-light'}`}
          value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
        <label className="mb-1 block text-right font-cairo text-xs font-medium text-text-secondary">البريد الإلكتروني</label>
        <input className="mb-3 h-[52px] w-full rounded-xl border border-border bg-border-light px-3 text-right font-cairo text-sm text-text-secondary" value={user?.email ?? ''} disabled />
        {editing && (
          <button onClick={handleSave} disabled={saveLoading}
            className="mt-2 flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white disabled:opacity-70 hover:opacity-90 transition-opacity">
            {saveLoading ? <Spinner color="white" /> : 'حفظ التغييرات'}
          </button>
        )}
      </div>

      <div className="max-w-xl mx-auto mb-5 rounded-2xl bg-bg-card p-6 shadow-md">
        <button onClick={() => setShowPassword(!showPassword)} className="flex w-full items-center justify-between hover:opacity-80 transition-opacity">
          <h3 className="font-cairo text-base font-bold text-text-primary">تغيير كلمة المرور</h3>
          <span className="text-sm text-text-secondary">{showPassword ? '▲' : '▼'}</span>
        </button>
        {showPassword && (
          <div className="mt-3">
            {passError && <div className="mb-3 rounded-lg bg-error-light p-2 text-center font-cairo text-xs text-error">{passError}</div>}
            {passSuccess && <div className="mb-3 rounded-lg bg-success-light p-2 text-center font-cairo text-xs text-success">{passSuccess}</div>}
            {['كلمة المرور الحالية', 'كلمة المرور الجديدة', 'تأكيد كلمة المرور'].map((label, i) => (
              <div key={label}>
                <label className="mb-1 block text-right font-cairo text-xs font-medium text-text-secondary">{label}</label>
                <input type="password" className="mb-3 h-[52px] w-full rounded-xl border border-border bg-bg-light px-3 text-right font-cairo text-sm text-text-primary"
                  value={i === 0 ? oldPass : i === 1 ? newPass : confirmPass}
                  onChange={e => { if (i === 0) setOldPass(e.target.value); else if (i === 1) setNewPass(e.target.value); else setConfirmPass(e.target.value); }} />
              </div>
            ))}
            <button onClick={handlePassword} disabled={passLoading}
              className="mt-2 flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white disabled:opacity-70 hover:opacity-90 transition-opacity">
              {passLoading ? <Spinner color="white" /> : 'تغيير كلمة المرور'}
            </button>
          </div>
        )}
      </div>

      <button onClick={handleLogout}
        className="flex h-[52px] w-full max-w-sm mx-auto items-center justify-center rounded-xl border-2 border-error font-cairo text-base font-bold text-error hover:bg-error hover:text-white transition-colors">
        تسجيل الخروج
      </button>
    </div>
  );
}
