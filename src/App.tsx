import React, {useEffect, useMemo} from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css'; //For semantic-ui
import {Route, Switch} from 'react-router-dom';
import {RouteItem, RoutePath, routes} from './routes';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import {useAuthorizedUserState} from './state/authorized-user/authorized-user-state';
import withLoading from './hocs/UseLoading/WithLoading';
import {PrivilegeType} from './state/privilege/privilege-type';
import {MetricPageProtectedWrapper} from './pages/AppSource/Metrics/MetricPageProtectedWrapper';
import {NotFoundPage} from './pages/NotFound/NotFoundPage';
import {NotAuthorizedPage} from './pages/NotAuthorized/NotAuthorizedPage';
import {ToastContainer} from './components/Toast/ToastContainer/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ApiTestPage from './pages/ApiTest/ApiTestPage';

function App() {
  const authorizedUserState = useAuthorizedUserState();

  useEffect(() => {
    authorizedUserState.fetchAndStoreAuthorizedUser();
  }, []);

  return (
    <div className="App">
      <AppWithLoading isLoading={authorizedUserState.isPromised} />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

function AppContent() {
  const routesFlat = useMemo(() => {
    const flatCollection: RouteItem[] = [];
    for (const route of routes) {
      if (route.childRoutes != null && route.childRoutes.length !== 0) {
        for (const childRoute of route.childRoutes) {
          flatCollection.push(childRoute);
        }
      }
      else {
        flatCollection.push(route);
      }
    }
    return flatCollection;
  }, []);
  return (
    <ErrorBoundary>
      <Switch>
        {routesFlat.map((route) => {
          if (route.component != null) {
            return <ProtectedRoute
              key={route.name}
              exact
              path={route.path}
              component={route.component}
              requiredPrivilege={route.requiredPrivileges}
            />
          }
        })}

        <ProtectedRoute
          exact
          path={RoutePath.APP_SOURCE_METRIC}
          component={MetricPageProtectedWrapper}
          requiredPrivilege={[PrivilegeType.DASHBOARD_ADMIN, PrivilegeType.APP_SOURCE_ADMIN]}
        />
        <ProtectedRoute
          exact
          path={RoutePath.API_TEST}
          component={ApiTestPage}
          requiredPrivilege={[PrivilegeType.DASHBOARD_ADMIN, PrivilegeType.APP_CLIENT_DEVELOPER]}
        />

        <Route exact component={NotAuthorizedPage} path={RoutePath.NOT_AUTHORIZED} />
        <Route component={NotFoundPage} />
      </Switch>
    </ErrorBoundary>

  );
}

const AppContentWithLoading = withLoading(AppContent);

function AppWithLoading({ isLoading }: { isLoading: boolean }) {
  return (
    <AppContentWithLoading isLoading={isLoading} fixed />
  );
}

export default App;
