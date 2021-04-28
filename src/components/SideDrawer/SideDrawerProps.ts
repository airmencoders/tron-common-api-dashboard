export interface SideDrawerProps {
  title: string;
  isOpen: boolean;
  onCloseHandler: () => void;
  children: React.ReactNode | React.ReactNode[];
  isLoading: boolean;

  /** Desktop width. If not provided a default value will be used. */
  desktopWidthPercent?: number;
}
