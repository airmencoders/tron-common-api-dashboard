
import { Route, RouteProps } from 'react-router-dom';
import { NotAuthorizedPage } from '../../pages/NotAuthorized/NotAuthorizedPage';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { ProtectedRouteProps } from './ProtectedRouteProps';

function ProtectedRoute({ component: Component, requiredPrivilege, ...rest }: ProtectedRouteProps & RouteProps) {
  const useAuthorizedState = useAuthorizedUserState();

  return (
    <Route {...rest} render={(props) => (
      useAuthorizedState.authorizedUserHasPrivilege(requiredPrivilege) ?
        <Component {...props} />
        :
        <NotAuthorizedPage {...props} />
    )} />
  )
} 

export default ProtectedRoute;