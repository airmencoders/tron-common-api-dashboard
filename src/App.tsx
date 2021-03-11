import React, { useEffect } from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import { routes, RoutePath } from './routes';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { useAuthorizedUserState } from './state/authorized-user/authorized-user-state';
import UseLoading from './hocs/UseLoading/UseLoading';

function App() {
  const authorizedUserState = useAuthorizedUserState();

  useEffect(() => {
    authorizedUserState.fetchAndStoreAuthorizedUser();
  }, []);

  return (
    <div className="App">
      <AppWithLoading isLoading={authorizedUserState.isPromised} />
    </div>
  );
}

function AppContent() {
  return (
    <Switch>
      <Route
        exact
        path={RoutePath.HOME}
        render={() => (<Redirect to={RoutePath.HEALTH} />)}
      />
      {routes.map((route) => {
        return <ProtectedRoute
          key={route.name}
          exact={route.path === '/' ? true : false}
          path={route.path}
          component={route.component}
          requiredPrivilege={route.requiredPrivilege}
        />
      })}
    </Switch>
  );
}

const AppContentWithLoading = UseLoading(AppContent);

function AppWithLoading({ isLoading }: { isLoading: boolean }) {
  return (
    <AppContentWithLoading isLoading={isLoading} fixed />
  );
}

export default App;