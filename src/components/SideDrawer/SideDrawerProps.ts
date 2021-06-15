import {SideDrawerSize} from './side-drawer-size';

export interface SideDrawerProps {
  title: string;
  isOpen: boolean;
  onCloseHandler: () => void;
  children: React.ReactNode | React.ReactNode[];
  isLoading: boolean;
  size?: SideDrawerSize
}
