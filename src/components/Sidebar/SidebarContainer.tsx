import React from 'react';
import './SidebarContainer.scss';
import { SidebarContainerProps } from './SidebarContainerProps';

function SidebarContainer({ children, isActive, containsNestedItems }: SidebarContainerProps) {
  let className = 'sidebar-container';

  if (containsNestedItems && isActive) {
    className = className + ' sidebar-container--active-nested';
  } else if (isActive) {
    className = className + ' sidebar-container--active';
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default SidebarContainer;
