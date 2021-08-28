import React from 'react';

export interface InfoNoticeProps {
  className?: string,
  type: 'success' | 'warning' | 'error' | 'info';
  heading?: React.ReactNode;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  slim?: boolean;
  noIcon?: boolean;
  validation?: boolean;
}
