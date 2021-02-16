export interface SideDrawerProps {
  title: string,
  isOpen: boolean,
  onCloseHandler: () => void,
  children: React.ReactNode | React.ReactNode[]
}
