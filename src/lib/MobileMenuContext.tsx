"use client";

import React, { createContext, useContext, useState } from "react";

interface MobileMenuContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
});

export function MobileMenuProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export const useMobileMenu = () => useContext(MobileMenuContext);
