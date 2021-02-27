
import { Route, RouteProps } from 'react-router-dom';
import { NotAuthorizedPage } from '../../pages/NotAuthorized/NotAuthorizedPage';
import { PrivilegeType } from '../../state/app-clients/interface/privilege-type';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { ProtectedRouteProps } from './ProtectedRouteProps';

function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps & RouteProps) {
  const useAuthorizedState = useAuthorizedUserState();

  return (
    <Route {...rest} render={(props) => (
      !useAuthorizedState.error && useAuthorizedState.authorizedUser?.privileges?.find(privilege => privilege.name === PrivilegeType.DASHBOARD_ADMIN) ?
        <Component {...props} />
        :
        <NotAuthorizedPage {...props} />
    )} />
  )
} 

export default ProtectedRoute;