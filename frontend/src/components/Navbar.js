import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/auth-context';

export default function MainNavigation() {
  const value = useContext(AuthContext);
  return (
    <header className='main-navigation'>
      <div className='main-navigation__logo'>
        <h1>أحداث حسوب</h1>
        
      </div>
      <div className='main-navigation__items'>
        <ul>
          {!value.token && (
            <li>
              <NavLink to='/auth'>تسجيل دخول</NavLink>
            </li>
          )}
          <li>
            <NavLink to='/events'>الأحداث</NavLink>
          </li>
          {value.token && (
            <>
              <li>
                <NavLink to='/bookings'>حجوزاتي</NavLink>
              </li>
              <li>
                <button onClick={value.logout}>تسجيل خروج</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
