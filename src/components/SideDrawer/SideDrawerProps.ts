import {SideDrawerSize} from './side-drawer-size';
import React from "react";

export interface SideDrawerProps {
  title: string;
  isOpen: boolean;
  onCloseHandler: () => void;
  children: React.ReactNode | React.ReactNode[];
  isLoading: boolean;
  size?: SideDrawerSize;
  titleStyle?: React.CSSProperties;
  preTitleNode?: React.ReactNode;
}
