import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from './api';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function persistAuth(token, user) {
  if (token) localStorage.setItem('velora_token', token);
  else localStorage.removeItem('velora_token');
  if (user) localStorage.setItem('velora_user', JSON.stringify(user));
  else localStorage.removeItem('velora_user');
}

export const login = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    return await api('/auth/login', { method: 'POST', body });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    return await api('/auth/register', { method: 'POST', body });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: readJSON('velora_user', null),
    token: localStorage.getItem('velora_token'),
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      persistAuth(null, null);
    },
    setUser(state, action) {
      state.user = action.payload;
      persistAuth(state.token, action.payload);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      persistAuth(action.payload.token, action.payload.user);
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Request failed';
    };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected);
  },
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: readJSON('velora_cart', { items: [], coupon: '' }),
  reducers: {
    addItem(state, action) {
      const item = action.payload;
      const key = `${item.product}|${item.size || ''}|${item.color || ''}`;
      const found = state.items.find((row) => row.key === key);
      const nextQty = (found?.qty || 0) + (item.qty || 1);
      const qty = Math.min(nextQty, item.stock || 99);
      if (found) found.qty = qty;
      else state.items.push({ ...item, key, qty: item.qty || 1 });
    },
    setQty(state, action) {
      const row = state.items.find((item) => item.key === action.payload.key);
      if (!row) return;
      if (action.payload.qty <= 0) state.items = state.items.filter((item) => item.key !== row.key);
      else row.qty = action.payload.qty;
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.key !== action.payload);
    },
    setCoupon(state, action) {
      state.coupon = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.coupon = '';
    },
  },
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    pushToast(state, action) {
      state.toasts.push({ id: `${Date.now()}-${Math.random()}`, message: action.payload });
      if (state.toasts.length > 3) state.toasts.shift();
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { logout, setUser, clearAuthError } = authSlice.actions;
export const { addItem, setQty, removeItem, setCoupon, clearCart } = cartSlice.actions;
export const { pushToast, dismissToast } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    ui: uiSlice.reducer,
  },
});

store.subscribe(() => {
  const { items, coupon } = store.getState().cart;
  localStorage.setItem('velora_cart', JSON.stringify({ items, coupon }));
});
