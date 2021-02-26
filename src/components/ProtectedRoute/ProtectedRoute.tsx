
import { Route, RouteProps } from 'react-router-dom';
import { NotAuthorizedPage } from '../../pages/NotAuthorized/NotAuthorizedPage';
import { useDashboardUserState } from '../../state/dashboard-user/dashboard-user-state';
import { ProtectedRouteProps } from './ProtectedRouteProps';

function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps & RouteProps) {
  const useDashboardState = useDashboardUserState();

  return (
    <Route {...rest} render={(props) => (
      !useDashboardState.error && useDashboardState.dashboardUser?.privileges?.find(privilege => privilege.name === 'DASHBOARD_ADMIN') ?
        <Component {...props} />
        :
        <NotAuthorizedPage {...props} />
    )} />
  )
} 

export default ProtectedRoute;