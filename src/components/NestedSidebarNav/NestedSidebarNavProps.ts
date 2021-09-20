import { IconProps } from '../../icons/IconProps';

export interface NestedSidebarNavProps {
  id: string;
  title: string;
  isOpened: boolean;
  children: React.ReactNode;
  onToggleClicked: (navItemClicked: string) => void;
  className?: string;
  icon?: (props: IconProps) => JSX.Element;
  iconTitle?: string;
}
