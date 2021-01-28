import React from 'react';
import './App.scss';
import { UserProvider } from './context/PersonProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import routes from './routes';

function App() {

    return (
        <UserProvider>

            <div className="App">
                <Switch>
                  <Route
                      exact
                      path="/"
                      render={() => (<Redirect to="/health" />)}
                  />
                  {routes.map((route) => <Route key={route.name} exact={route.path === "/" ? true : false}
                                                  path={route.path} component={route.component} />)}
                </Switch>
            </div>
        </UserProvider>
    );
}

export default App;
