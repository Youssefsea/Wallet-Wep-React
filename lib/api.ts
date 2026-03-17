
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://feb3430a655849d5.preview.oblien.com';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const sendOTP = (email: string) =>
  api.post('/auth/send-otp', { email });

export const signup = (name: string, email: string, password: string, otp: string) =>
  api.post('/auth/signup', { name, email, password, otp });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getProfile = () =>
  api.get('/user/profile');

export const updateProfile = (name: string) =>
  api.put('/user/profile', { name });

export const changePassword = (oldPassword: string, newPassword: string) =>
  api.put('/user/password', { oldPassword, newPassword });

export const createLocalWallet = () =>
  api.post('/user/local-wallet');

export const getLocalWallets = () =>
  api.get('/user/local-wallet');

export const getWallets = () =>
  api.get('/wallets');

export const depositMain = (amount: number, idempotencyKey: string) =>
  api.post('/wallets/deposit', { amount, idempotencyKey });

export const withdrawMain = (amount: number, idempotencyKey: string, category_id?: number | null) =>
  api.post('/wallets/withdraw', { amount, idempotencyKey, category_id: category_id ?? null });

export const depositLocal = (amount: number, idempotencyKey: string) =>
  api.post('/local-wallets/deposit', { amount, idempotencyKey });

export const manualTransaction = (
  type: 'manual_expense' | 'manual_income',
  amount: number,
  category_id: number,
  idempotencyKey: string,
  description?: string,
) => api.post('/transactions/manual', { type, amount, category_id, description, idempotencyKey });

export const aiTransaction = (text: string, idempotencyKey: string) =>
  api.post('/transactions/ai', { text, idempotencyKey });

export const transfer = (
  toEmail: string,
  amount: number,
  idempotencyKey: string,
  description?: string,
  category_id?: number | null,
) => api.post('/transfers', { toEmail, amount, description, idempotencyKey, category_id: category_id ?? null });

export const getTransactions = (page = 1, limit = 20, type?: string) =>
  api.get('/transactions', { params: { page, limit, type } });

export const getTransactionById = (id: string) =>
  api.get(`/transactions/${id}`);

export const getLocalTransactions = (page = 1, limit = 20, type?: string) =>
  api.get('/local-transactions', { params: { page, limit, type } });

export const getLocalTransactionById = (id: string) =>
  api.get(`/local-transactions/${id}`);

export const getCategories = () =>
  api.get('/categories');

export const addCategory = (name: string, type: 'income' | 'expense') =>
  api.post('/categories', { name, type });

export const getBudgets = (month_year: string) =>
  api.get('/budgets', { params: { month_year } });

export const createBudget = (category_id: number, month_year: string, monthly_limit: number) =>
  api.post('/budgets', { category_id, month_year, monthly_limit });

export const updateBudget = (id: number, monthly_limit: number) =>
  api.put(`/budgets/${id}`, { monthly_limit });

export const getBudgetRest = (month_year: string) =>
  api.get(`/budgets/rest/${month_year}`, { params: { month_year } });

export const getLocalBudgetRest = (month_year: string) =>
  api.get(`/budgetsLocal/rest/${month_year}`, { params: { month_year } });

export const getAIAdvice = (month_year: string, city: string) =>
  api.post('/budgets/advice', { month_year, city });

export const getLocalAIAdvice = (month_year: string, city: string) =>
  api.post('/budgets/local-advice', { month_year, city });

export const getBudgetTransactions = (budgetId: number) =>
  api.get(`/budgets/transactions/${budgetId}`);

export const getLocalBudgetTransactions = (budgetId: number) =>
  api.get(`/budgetsLocal/transactions/${budgetId}`);

export default api;
