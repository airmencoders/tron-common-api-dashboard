import React, { useContext, useEffect, useState } from 'react';
import './App.scss';
import { PersonControl } from './components/Person/PersonControl';
import { UserProvider } from './context/PersonProvider';
import Navbar from 'react-bootstrap/Navbar';
import Logo from './logo.png'


function App() {

    return (
        <UserProvider>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#home">
                <img
                    alt=""
                    src={Logo}
                    height="30"
                    className="d-inline-block align-top mr-4"
                />
                CommonAPI Dashboard
                </Navbar.Brand>
            </Navbar>
            <div className="App">
                <PersonControl />
            </div>
        </UserProvider>
    );
}

export default App;
