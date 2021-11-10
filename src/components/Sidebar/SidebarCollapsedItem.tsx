import React from 'react';
import SidebarContainer from './SidebarContainer';
import {SidebarCollapsedItemProps} from './SidebarCollapsedItemProps';

function SidebarCollapsedItem(props: SidebarCollapsedItemProps) {
  const Icon = props.icon;
  return (
      <div className="sidebar-collapsed-item">
        <SidebarContainer containsNestedItems isActive={props.currentOpenedMenu === props.name}>
          <div className="sidebar-container__icon-wrapper">
            {
              Icon &&
              <Icon size={1.25} iconTitle={props.name} className="container__icon" />
            }

          </div>
        </SidebarContainer>
      </div>
  );
}

export default SidebarCollapsedItem;
