import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import ReactComment from './components/shared/ReactComment';
import { creditsComment } from './creditsComment';

//  store
import { Provider } from 'react-redux';
import configureStore from './store'; // index.js
import BrandingProvider from './providers/BrandingProvider';

const store = configureStore();

ReactDOM.render(
  <>
    <Router>
      <Provider store={store}>
        {/* the only way I know to render a comment in react */}
        <ReactComment text={creditsComment} trim={false} />
        <BrandingProvider>
          <App />
        </BrandingProvider>
      </Provider>
    </Router>
  </>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
