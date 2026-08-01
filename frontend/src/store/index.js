import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      activeSemester: 'AY 2025-26',
      setActiveSemester: (semester) => set({ activeSemester: semester }),

      notificationsUnreadCount: 0,
      setUnreadCount: (count) => set({ notificationsUnreadCount: count }),
      incrementUnread: () => set((state) => ({ notificationsUnreadCount: state.notificationsUnreadCount + 1 })),
      decrementUnread: () => set((state) => ({ notificationsUnreadCount: Math.max(0, state.notificationsUnreadCount - 1) })),
    }),
    {
      name: 'edusphere-ui-storage',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen, activeSemester: state.activeSemester }),
    }
  )
);
