import { ComponentType } from 'react';
import { PrivilegeType } from '../../state/privilege/privilege-type';

export interface ProtectedRouteProps {
  component: ComponentType<any>;
  requiredPrivilege: PrivilegeType
}