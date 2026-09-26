import { createContext, useContext, useState, type ReactNode } from 'react';

// DESIGN.md §9.1 / §4.1: the header's toggle collapses the desktop sidebar to
// a 90px icon rail (hovering the rail expands it again, and the page moves
// with it), and below xl opens the same sidebar as a drawer.
interface SidebarState {
  collapsed: boolean;
  hovered: boolean;
  mobileOpen: boolean;
  /** true while the desktop sidebar is showing only the icon rail */
  isRail: boolean;
  toggleCollapsed: () => void;
  setHovered: (hovered: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

const SidebarStateContext = createContext<SidebarState | null>(null);

export const SidebarStateProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarStateContext.Provider
      value={{
        collapsed,
        hovered,
        mobileOpen,
        isRail: collapsed && !hovered,
        toggleCollapsed: () => {
          setCollapsed((c) => !c);
          setHovered(false);
        },
        setHovered,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  );
};

export const useSidebarState = () => {
  const ctx = useContext(SidebarStateContext);
  if (!ctx) throw new Error('useSidebarState must be used inside SidebarStateProvider');
  return ctx;
};
