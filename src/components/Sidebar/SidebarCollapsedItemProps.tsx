import {IconProps} from '../../icons/IconProps';

export interface SidebarCollapsedItemProps {
  name: string;
  currentOpenedMenu: string;
  icon: (props: IconProps) => JSX.Element;
}
