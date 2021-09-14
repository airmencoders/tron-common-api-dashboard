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

/**
 * Generates appropriate color classname for an svg icon
 * @param iconStyleType icon style type
 * @param disabled disable state of icon
 * @param defaultClassname the default classname to use
 * @returns the classname
 */
export function getSvgIconColorClassname(iconStyleType?: IconStyleType, disabled?: boolean, defaultClassname = 'svg-icon-color'): string {
  if (disabled) {
    return 'svg-icon-disabled';
  }

  if (iconStyleType == null || iconStyleType === 'default') {
    return defaultClassname;
  }

  if (iconStyleType === 'primary') {
    return 'svg-icon-primary';
  }

  return defaultClassname;
}