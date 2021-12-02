import { IconStyleType } from './IconStyleType';

export interface IconProps {
  size: number; // in rem
  iconTitle?: string;
  className?: string;
  disabled?: boolean;
  style?: IconStyleType;
  fillColor?: string;
}
