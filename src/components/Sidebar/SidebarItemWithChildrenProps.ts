import {RouteItem} from '../../routes';

export interface SidebarItemWithChildrenProps {
  item: RouteItem;
  isNavCollapsed: boolean;
  openedMenu: string;
  onToggleClicked: (navItemClicked: string) => void;
}
