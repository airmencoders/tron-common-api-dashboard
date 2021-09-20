import { ReactNode } from 'react';

export interface SidebarContainerProps {
  children: ReactNode;
  isActive: boolean;
  containsNestedItems?: boolean;
}