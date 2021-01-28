import React from 'react';
import './App.scss';
import { UserProvider } from './context/PersonProvider';
import Navbar from 'react-bootstrap/Navbar';
import Logo from './logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Switch } from 'react-router-dom';
import routes from './routes';

function App() {

    return (
        <UserProvider>

            <div className="App">
                <Switch>
                    {routes.map((route) => <Route key={route.name} exact={route.path === "/" ? true : false} path={route.path} component={route.component} />)}
                </Switch>
            </div>
        </UserProvider>
    );
}

export default App;
