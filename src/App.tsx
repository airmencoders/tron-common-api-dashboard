import React, { useEffect } from 'react';
import './App.scss';
import { UserProvider } from './context/PersonProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import { routes, RoutePath, ProtectedStatus } from './routes';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { useDashboardUserState } from './state/dashboard-user/dashboard-user-state';

function App() {
  const useDashboardState = useDashboardUserState();

  useEffect(() => {
    useDashboardState.fetchAndStoreDashboardUser();
  }, []);

  return (
    <UserProvider>

      <div className="App">
        <Switch>
          <Route
            exact
            path={RoutePath.HOME}
            render={() => (<Redirect to={RoutePath.HEALTH} />)}
          />
          {routes.map((route) => {
            if (route.protectedStatus === ProtectedStatus.ADMIN)
              return <ProtectedRoute
                key={route.name}
                exact={route.path === '/' ? true : false}
                path={route.path}
                component={route.component}
              />
            else
              return <Route
                key={route.name}
                exact={route.path === '/' ? true : false}
                path={route.path}
                component={route.component}
              />
          })}
        </Switch>
      </div>
    </UserProvider>
  );
}

export default App;
