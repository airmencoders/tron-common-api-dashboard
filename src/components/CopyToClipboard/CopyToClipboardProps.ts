import React from "react";

export interface CopyToClipboardProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
