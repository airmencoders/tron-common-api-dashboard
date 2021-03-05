import { ComponentType } from 'react';
import { PrivilegeType } from '../../state/app-clients/interface/privilege-type';

export interface ProtectedRouteProps {
  component: ComponentType<any>;
  requiredPrivilege: PrivilegeType
}