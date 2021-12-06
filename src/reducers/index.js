import React from 'react'

const app = (state, action) => {
  switch (action.type) {
    case 'loginSuccess': 
      return Object.assign({}, state, {
        login: true,
        name: action.name,
      });
    default:
      return state;
  }
}

export default app;
