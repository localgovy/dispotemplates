import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// SecureStore adapter so Supabase persists sessions in the device's encrypted keychain
// instead of AsyncStorage.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// ─── Database helpers (typed shorthand) ────────────────────────────────────

export type Tables = {
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    loyalty_pts: number;
    notif_promo: boolean;
    notif_order: boolean;
    created_at: string;
  };
  orders: {
    id: string;
    user_id: string;
    confirmation_code: string;
    status: 'processing' | 'ready' | 'picked_up' | 'cancelled';
    subtotal: number;
    discount_amt: number;
    tax: number;
    total: number;
    promo_code: string | null;
    created_at: string;
  };
  order_items: {
    id: string;
    order_id: string;
    product_id: string;
    name: string;
    brand: string | null;
    price: number;
    qty: number;
  };
  favourites: {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
  };
  loyalty_transactions: {
    id: string;
    user_id: string;
    order_id: string | null;
    type: 'earn' | 'redeem' | 'adjust' | 'expire';
    pts: number;       // positive = earn, negative = redeem/expire
    balance: number;   // running balance after this transaction
    note: string | null;
    created_at: string;
  };
};
