"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  navHidden: boolean;
  setNavHidden: (hidden: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [navHidden, setNavHidden] = useState(false);

  return (
    <NavbarContext.Provider value={{ navHidden, setNavHidden }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
}