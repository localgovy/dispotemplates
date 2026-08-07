import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORES, Store } from '../data/stores';

const STORE_KEY = '@rose_noir_selected_store';

interface StoreContextValue {
  store: Store;
  setStore: (store: Store) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStoreState] = useState<Store>(STORES[0]);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then((id) => {
      if (id) {
        const found = STORES.find((s) => s.id === id);
        if (found) setStoreState(found);
      }
    });
  }, []);

  function setStore(s: Store) {
    setStoreState(s);
    AsyncStorage.setItem(STORE_KEY, s.id);
  }

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
