"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NavbarContextType {
  customContent: ReactNode;
  setCustomContent: (content: ReactNode) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [customContent, setCustomContent] = useState<ReactNode>(null);

  return (
    <NavbarContext.Provider value={{ customContent, setCustomContent }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbarContent() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error("useNavbarContent must be used within NavbarProvider");
  }
  return context;
}
