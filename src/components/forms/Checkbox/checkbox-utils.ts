import { CheckboxStatusType } from './checkbox-status-type';

export function generateCheckboxTitle(value: boolean | CheckboxStatusType): string {
  if (typeof value === 'boolean')
    return String(value).toLowerCase();

  if (value === CheckboxStatusType.CHECKED)
    return 'true';

  if (value === CheckboxStatusType.UNCHECKED)
    return 'false';

  return 'indeterminate';
}