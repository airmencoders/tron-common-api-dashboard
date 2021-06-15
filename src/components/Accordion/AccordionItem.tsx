import React from 'react';

export interface AccordionItem {
  title: React.ReactNode | string;
  content: React.ReactNode;
  id: string;
  className?: string;
}
