"use client";

import { useNavbar } from "../contexts/NavbarContext";

export default function NavSpacer() {
  const { navHidden } = useNavbar();
  
  return (
    <div className={`transition-all duration-300 ${navHidden ? 'h-0' : 'h-16'}`}></div>
  );
}