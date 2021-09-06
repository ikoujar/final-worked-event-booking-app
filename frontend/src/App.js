import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './pages/Auth';
import EventsPage from './pages/Event';
import BookingsPage from './pages/Booking';
import AuthContext from './context/auth-context';

function App() {

  let [token, setToken] = useState(null);
  // token = localStorage.getItem('token') || '';
  let [userId, setUserId] = useState(null);
  // userId = localStorage.getItem('userId') || '';
  const login = (loginUserId, userToken) => {
    setToken(userToken);
    setUserId(loginUserId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    // localStorage.clear()
  };

  return (
    <BrowserRouter>
      <React.Fragment>
        <AuthContext.Provider value={{ token, userId, login, logout }}>
          <Navbar />
          <main className="main-content">
            <Switch>
              {token && <Redirect from='/' to='/events' exact />}
              {token && <Redirect from='/auth' to='/events' exact />}
              {!token && <Route path='/auth' component={AuthPage} />}
              <Route path='/events' component={EventsPage} />
              {token && <Route path='/bookings' component={BookingsPage} />}
              {!token && <Redirect to='/auth' exact />}
            </Switch>
          </main>
        </AuthContext.Provider>
      </React.Fragment>
    </BrowserRouter>
  );
}

export default App;


