
export interface ModalProps {
  headerComponent: React.ReactNode;
  /** React body */
  children: React.ReactNode;
  footerComponent: React.ReactNode;
  show: boolean;
  onHide: () => void;
  height?: string | number;
  width?: string | number;
  className?: string;
}
