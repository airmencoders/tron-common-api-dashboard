
export interface ButtonProps {
  type: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  secondary?: boolean;
  base?: boolean;
  accent?: boolean;
  outline?: boolean;
  inverse?: boolean;
  disabled?: boolean;
  onClick?: (event?: any) => void;
  className?: string;
  unstyled?: boolean;
}
