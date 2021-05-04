import { CheckboxStatusType } from '../../components/forms/Checkbox/checkbox-status-type';

export interface AppSourceClientPrivilege {
  id: string;
  name: string;
  authorized: CheckboxStatusType;
}