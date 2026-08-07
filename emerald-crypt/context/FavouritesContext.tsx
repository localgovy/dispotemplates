import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FavouritesContextValue {
  favourites: Set<string>;
  toggle: (productId: string) => void;
  isFavourite: (productId: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  // Load persisted favourites whenever the user changes (sign-in / sign-out)
  useEffect(() => {
    if (!user) {
      setFavourites(new Set());
      return;
    }
    supabase
      .from('favourites')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          setFavourites(new Set(data.map((r) => r.product_id)));
        }
      });
  }, [user]);

  const toggle = useCallback(
    (productId: string) => {
      setFavourites((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
          // Fire-and-forget: remove from Supabase
          if (user) {
            supabase
              .from('favourites')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', productId);
          }
        } else {
          next.add(productId);
          // Fire-and-forget: persist to Supabase
          if (user) {
            supabase
              .from('favourites')
              .insert({ user_id: user.id, product_id: productId });
          }
        }
        return next;
      });
    },
    [user],
  );

  const isFavourite = useCallback(
    (productId: string) => favourites.has(productId),
    [favourites],
  );

  return (
    <FavouritesContext.Provider value={{ favourites, toggle, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
