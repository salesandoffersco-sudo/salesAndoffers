"use client";

import { useNavbar } from "../contexts/NavbarContext";
import { usePathname } from "next/navigation";

export default function NavSpacer() {
  const { navHidden } = useNavbar();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Don't render spacer if on admin page and navbar is hidden
  if (isAdminPage && navHidden) {
    return null;
  }
  
  return <div className="h-16"></div>;
}