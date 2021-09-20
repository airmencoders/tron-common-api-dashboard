import { IconProps } from '../../icons/IconProps';

export interface SidebarItemProps {
  path: string;
  name: string;
  icon?: (props: IconProps) => JSX.Element;
  iconTitle?: string;
  showActiveBorder?: boolean;
}