import React from 'react';

// TODO: For Delete?
export default React.createContext({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});
