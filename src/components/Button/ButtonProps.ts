import React from "react";

export interface ButtonProps {
  id?: string;
  icon?: boolean;
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
  style?: React.CSSProperties;
  disableMobileFullWidth?: boolean;
  transparentOnDisabled?: boolean;
  transparentBackground?: boolean;
}
