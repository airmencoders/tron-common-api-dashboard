import { IconStyleType } from './IconStyleType';

/**
 * Generates the appropriate color classname for an icon.
 * @param disabled icon disable state
 * @param iconStyleType the style type of the icon
 * @param defaultClassname the default color classname
 * @returns the classname
 */
export function getIconColorClassname(iconStyleType?: IconStyleType, disabled?: boolean, defaultClassname = ''): string {
  if (disabled) {
    return 'icon-disabled-color';
  }

  if (iconStyleType == null || iconStyleType === 'default') {
    return defaultClassname;
  }

  if (iconStyleType === 'primary') {
    return 'icon-color-primary';
  }

  return defaultClassname;
}