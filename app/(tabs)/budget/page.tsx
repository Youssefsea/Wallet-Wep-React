/* Budget page - with per-budget transaction history modal */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getBudgetRest, getLocalBudgetRest, getCategories, createBudget, updateBudget, addCategory, getAIAdvice, getLocalAIAdvice, getBudgetTransactions, getLocalBudgetTransactions } from '@/lib/api';
import Spinner from '@/components/Spinner';
import Modal from '@/components/Modal';

interface Budget {
  id: number;
  budget_id?: number;
  category_id: number;
  category_name: string;
  monthly_limit: string;
  spent_amount: string;
  remaining?: string;
  icon?: string;
  month_year: string;
}
interface Category { id: number; name: string; icon?: string; }
interface BudgetTx {
  id: number;
  amount: string;
  created_at: string;
  description: string;
  category_name: string;
  category_type: string;
}

export default function BudgetPage() {
  const [walletTab, setWalletTab] = useState<'real' | 'local'>('real');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [city, setCity] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudgetCatId, setNewBudgetCatId] = useState<number | null>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [catLoading, setCatLoading] = useState(false);

  /* Transaction history for a specific budget */
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetTxs, setBudgetTxs] = useState<BudgetTx[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    try {
      const budgetFetcher = walletTab === 'real' ? getBudgetRest : getLocalBudgetRest;
      const [budgetRes, catRes] = await Promise.all([budgetFetcher(monthYear), getCategories()]);
      setBudgets(budgetRes.data.budgets ?? []);
      setCategories(catRes.data.categories ?? catRes.data ?? []);
    } catch {} finally { setLoading(false); }
  }, [monthYear, walletTab]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  /* Open budget transactions modal */
  const handleOpenBudgetTx = async (b: Budget) => {
    setSelectedBudget(b);
    setBudgetTxs([]);
    setShowTxModal(true);
    setTxLoading(true);
    try {
      const budgetId = b.budget_id ?? b.id;
      const fetcher = walletTab === 'real' ? getBudgetTransactions : getLocalBudgetTransactions;
      const res = await fetcher(budgetId);
      setBudgetTxs(res.data.transactions ?? []);
    } catch {} finally { setTxLoading(false); }
  };

  /* Open edit modal (from tx modal) */
  const handleOpenEdit = () => {
    if (!selectedBudget) return;
    setShowTxModal(false);
    setEditBudget(selectedBudget);
    setEditAmount(selectedBudget.monthly_limit);
    setShowEditModal(true);
  };

  const handleGetAdvice = async () => {
    if (!city.trim()) { setAdvice('يرجى إدخال اسم المدينة الأول'); return; }
    setAdviceLoading(true);
    try {
      const fetcher = walletTab === 'real' ? getAIAdvice : getLocalAIAdvice;
      const res = await fetcher(monthYear, city.trim());
      setAdvice(res.data.advice ?? res.data.message ?? '');
    } catch { setAdvice('تعذر الحصول على النصيحة حالياً'); }
    finally { setAdviceLoading(false); }
  };

  const handleAddBudget = async () => {
    if (!newBudgetCatId || !newBudgetAmount) return;
    setAddLoading(true);
    try {
      await createBudget(newBudgetCatId, monthYear, parseFloat(newBudgetAmount));
      setShowAddModal(false); setNewBudgetAmount(''); setNewBudgetCatId(null);
      await fetchData();
    } catch {} finally { setAddLoading(false); }
  };

  const handleEditBudget = async () => {
    if (!editBudget || !editAmount) return;
    setEditLoading(true);
    try {
      await updateBudget(editBudget.budget_id ?? editBudget.id, parseFloat(editAmount));
      setShowEditModal(false); setEditBudget(null); setEditAmount('');
      await fetchData();
    } catch {} finally { setEditLoading(false); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      await addCategory(newCatName.trim(), newCatType);
      setShowCatModal(false); setNewCatName(''); setNewCatType('expense');
      await fetchData();
    } catch {} finally { setCatLoading(false); }
  };

  const totalBudget = budgets.reduce((s, b) => s + parseFloat(b.monthly_limit), 0);
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.spent_amount || '0'), 0);
  const remaining = budgets.reduce((s, b) => s + parseFloat(b.monthly_limit) + parseFloat(b.spent_amount || '0'), 0);
  const usedPct = totalBudget > 0 ? Math.round(((totalSpent * -1) / totalBudget) * 100) : 0;

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;

  return (
    <div className="relative mx-auto min-h-screen max-w-6xl bg-bg-light px-4 pb-6 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      <h1 className="mb-4 font-cairo text-2xl font-bold text-text-primary">الميزانية الشهرية</h1>

      <div className="mb-4 flex rounded-xl bg-border-light p-1">
        {(['real', 'local'] as const).map(t => (
          <button key={t} onClick={() => { setWalletTab(t); setAdvice(''); }}
            className={`flex-1 rounded-lg py-2 text-center font-cairo text-sm font-medium transition-colors hover:bg-bg-card/70 ${walletTab === t ? 'bg-bg-card text-primary shadow-sm' : 'text-text-secondary'}`}>
            {t === 'real' ? 'المحفظة الرئيسية' : 'المحفظة المحلية'}
          </button>
        ))}
      </div>

      <p className="mb-5 font-cairo text-sm text-text-secondary">
        {now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric',day: 'numeric' })}
      </p>

      {/* Summary + AI Advice — 2-col on desktop */}
      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl bg-bg-card p-6 shadow-md">
          <div className="mb-5 flex h-[120px] w-[120px] items-center justify-center rounded-full border-[8px] border-primary">
            <div className="text-center">
              <p className="font-manrope text-[28px] font-bold text-text-primary">{usedPct}%</p>
              <p className="font-cairo text-xs text-text-secondary">مستخدم</p>
            </div>
          </div>
          <div className="flex w-full justify-around">
            <div className="text-center">
              <p className="font-manrope text-base font-bold text-text-primary">{totalBudget.toLocaleString('en')}</p>
              <p className="font-cairo text-xs text-text-secondary">الميزانية</p>
            </div>
            <div className="text-center">
              <p className="font-manrope text-base font-bold text-error">{totalSpent.toLocaleString('en')}</p>
              <p className="font-cairo text-xs text-text-secondary">المصروف</p>
            </div>
            <div className="text-center">
              <p className="font-manrope text-base font-bold text-success">{remaining.toLocaleString('en')}</p>
              <p className="font-cairo text-xs text-text-secondary">المتبقي</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <input className="mb-2 h-[52px] w-full rounded-xl border border-border bg-bg-light px-3 text-right font-cairo text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="اسم المدينة (مثلاً: القاهرة)" value={city} onChange={e => setCity(e.target.value)} />
          <button onClick={handleGetAdvice} disabled={adviceLoading}
            className="mb-4 flex h-12 w-full items-center justify-center rounded-xl bg-primary-surface shadow-sm transition-colors hover:bg-primary/10">
            {adviceLoading ? <Spinner /> : <span className="font-cairo text-sm font-bold text-primary">🤖 احصل على نصيحة مالية</span>}
          </button>
          {!!advice && (
            <div className="rounded-xl bg-bg-card p-4 shadow-sm">
              <p className="text-right font-cairo text-sm leading-6 text-text-primary">{advice}</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map(b => {
        const spent = parseFloat(b.spent_amount || '0');
        const total = parseFloat(b.monthly_limit);
        const pct = total > 0 ? ((spent * -1) / total) * 100 : 0;
        const barColor = pct > 80 ? 'bg-budget-red' : pct > 60 ? 'bg-budget-yellow' : 'bg-budget-green';
        return (
          <button key={b.id} onClick={() => handleOpenBudgetTx(b)}
            className="w-full rounded-xl bg-bg-card p-4 text-right shadow-sm transition-shadow hover:shadow-md hover:ring-1 hover:ring-primary/20">
            <div className="mb-2 flex justify-between">
              <span className="font-cairo text-sm font-medium text-text-primary">{b.icon ?? '📁'} {b.category_name}</span>
              <span className="font-manrope text-xs font-bold text-text-secondary">{Math.round(pct)}%</span>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-border-light">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="font-cairo text-xs text-text-secondary">{spent.toLocaleString('en')} ج.م مصروف</span>
              <span className="font-cairo text-xs text-text-light">من {total.toLocaleString('en')} ج.م</span>
            </div>
          </button>
        );
      })}
      </div>
      {budgets.length === 0 && <p className="py-12 text-center font-cairo text-sm text-text-secondary">لا توجد ميزانيات لهذا الشهر</p>}

      {/* FABs */}
      <div className="fixed bottom-17 left-6 z-30 flex flex-col gap-3 md:bottom-10 md:left-auto md:right-10">
        <button onClick={() => setShowCatModal(true)} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-110 hover:shadow-xl">
          <span className="text-[28px]">📁</span>
        </button>
        <button onClick={() => setShowAddModal(true)} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-110 hover:shadow-xl">
          <span className="text-[28px] text-white">+</span>
        </button>
      </div>

      {/* ===== Budget Transactions Modal ===== */}
      <Modal open={showTxModal} onClose={() => setShowTxModal(false)}>
        {selectedBudget && (() => {
          const spent = parseFloat(selectedBudget.spent_amount || '0');
          const total = parseFloat(selectedBudget.monthly_limit);
          const pct = total > 0 ? ((spent * -1) / total) * 100 : 0;
          const barColor = pct > 80 ? 'bg-budget-red' : pct > 60 ? 'bg-budget-yellow' : 'bg-budget-green';
          return (
            <>
              {/* Budget info header */}
              <div className="mb-4 text-center">
                <span className="mb-1 block text-3xl">{selectedBudget.icon ?? '📁'}</span>
                <h2 className="font-cairo text-xl font-bold text-text-primary">{selectedBudget.category_name}</h2>
              </div>
              <div className="mb-2 flex justify-between font-cairo text-xs text-text-secondary">
                <span>المصروف: {(spent * -1).toLocaleString('en')} ج.م</span>
                <span>الحد: {total.toLocaleString('en')} ج.م</span>
              </div>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-border-light">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </>
          );
        })()}

        {/* Transactions list */}
        <h3 className="mb-3 font-cairo text-sm font-bold text-text-primary">المعاملات</h3>
        {txLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : budgetTxs.length === 0 ? (
          <p className="py-6 text-center font-cairo text-sm text-text-secondary">لا توجد معاملات لهذه الفئة</p>
        ) : (
          <div className="max-h-[280px] space-y-2 overflow-y-auto">
            {budgetTxs.map(tx => {
              const amt = parseFloat(tx.amount);
              const isExpense = amt < 0;
              return (
                <div key={tx.id} className="flex items-center justify-between rounded-lg bg-bg-light px-3 py-2.5">
                  <div className="flex-1">
                    <p className="font-cairo text-sm text-text-primary">{tx.description || tx.category_name || '—'}</p>
                    <p className="font-cairo text-[11px] text-text-light">
                      {new Date(tx.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`font-manrope text-sm font-bold ${isExpense ? 'text-error' : 'text-success'}`}>
                    {isExpense ? '' : '+'}{Math.abs(amt).toLocaleString('en')} ج.م
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex gap-3">
          <button onClick={() => setShowTxModal(false)}
            className="flex h-[48px] flex-1 items-center justify-center rounded-xl border border-border font-cairo text-sm font-bold text-text-secondary transition-colors hover:bg-border-light">
            إغلاق
          </button>
          <button onClick={handleOpenEdit}
            className="flex h-[48px] flex-1 items-center justify-center rounded-xl bg-primary font-cairo text-sm font-bold text-white transition-colors hover:bg-green-700">
            ✏️ تعديل الميزانية
          </button>
        </div>
      </Modal>

      {/* Add Budget Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className="mb-5 text-center font-cairo text-xl font-bold text-text-primary">إضافة ميزانية</h2>
        <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">الفئة</p>
        <div className="mb-5 flex flex-wrap gap-2 overflow-x-auto">
          {categories.map(c => (
            <button key={c.id} onClick={() => setNewBudgetCatId(c.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-cairo text-xs font-medium ${newBudgetCatId === c.id ? 'border-primary bg-primary-surface text-primary' : 'border-border bg-bg-light text-text-secondary'}`}>
              {c.icon ?? '📁'} {c.name}
            </button>
          ))}
        </div>
        <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">المبلغ</p>
        <input type="number" inputMode="decimal" className="mb-5 h-[52px] w-full rounded-xl border border-border bg-bg-light text-center font-manrope text-xl font-bold text-text-primary"
          placeholder="0" value={newBudgetAmount} onChange={e => setNewBudgetAmount(e.target.value)} />
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(false)} className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-border font-cairo text-base font-bold text-text-secondary">إلغاء</button>
          <button onClick={handleAddBudget} disabled={addLoading}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white disabled:opacity-70">
            {addLoading ? <Spinner color="white" /> : 'إضافة'}
          </button>
        </div>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <h2 className="mb-3 text-center font-cairo text-xl font-bold text-text-primary">تعديل الميزانية</h2>
        {editBudget && <p className="mb-5 text-center font-cairo text-lg font-medium text-text-secondary">{editBudget.icon ?? '📁'} {editBudget.category_name}</p>}
        <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">المبلغ الجديد</p>
        <input type="number" inputMode="decimal" className="mb-5 h-[52px] w-full rounded-xl border border-border bg-bg-light text-center font-manrope text-xl font-bold text-text-primary"
          placeholder="0" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
        <div className="flex gap-3">
          <button onClick={() => setShowEditModal(false)} className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-border font-cairo text-base font-bold text-text-secondary">إلغاء</button>
          <button onClick={handleEditBudget} disabled={editLoading}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white disabled:opacity-70">
            {editLoading ? <Spinner color="white" /> : 'حفظ'}
          </button>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal open={showCatModal} onClose={() => setShowCatModal(false)}>
        <h2 className="mb-5 text-center font-cairo text-xl font-bold text-text-primary">إضافة فئة جديدة</h2>
        <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">اسم الفئة</p>
        <input className="mb-5 h-[52px] w-full rounded-xl border border-border bg-bg-light px-3 text-right font-cairo text-sm text-text-primary placeholder:text-text-light"
          placeholder="مثال: مواصلات" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
        <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">النوع</p>
        <div className="mb-5 flex justify-center gap-2">
          <button onClick={() => setNewCatType('expense')}
            className={`rounded-full border px-4 py-1.5 font-cairo text-xs font-medium ${newCatType === 'expense' ? 'border-primary bg-primary-surface text-primary' : 'border-border bg-bg-light text-text-secondary'}`}>
            مصروف
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCatModal(false)} className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-border font-cairo text-base font-bold text-text-secondary">إلغاء</button>
          <button onClick={handleAddCategory} disabled={catLoading}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white disabled:opacity-70">
            {catLoading ? <Spinner color="white" /> : 'إضافة'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
