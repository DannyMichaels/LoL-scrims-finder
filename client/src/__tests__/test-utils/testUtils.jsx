import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { CurrentUserProvider } from '../../context/currentUser';
import { ScrimsProvider } from '../../context/scrimsContext';

const history = createMemoryHistory();

function render(ui, { preloadedState, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <CurrentUserProvider>
        <ScrimsProvider>
          <Router history={history}>
            <Route>{children}</Route>
          </Router>
        </ScrimsProvider>
      </CurrentUserProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render, history };
