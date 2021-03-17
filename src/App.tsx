import React, { useEffect } from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Switch } from 'react-router-dom';
import { routes } from './routes';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { useAuthorizedUserState } from './state/authorized-user/authorized-user-state';
import withLoading from './hocs/UseLoading/WithLoading';

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

const AppContentWithLoading = withLoading(AppContent);

function AppWithLoading({ isLoading }: { isLoading: boolean }) {
  return (
    <AppContentWithLoading isLoading={isLoading} fixed />
  );
}

export default App;