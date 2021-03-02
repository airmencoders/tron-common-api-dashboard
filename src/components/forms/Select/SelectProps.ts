import React from 'react';

export interface SelectProps {
  id: string;
  name: string;
  className?: string;
  children: React.ReactNode;
  inputRef?: string | ((instance: HTMLSelectElement | null) => void) | React.RefObject<HTMLSelectElement> | null | undefined;

}

