import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CurrentUserProvider } from './context/currentUser';
import { AlertsProvider } from './context/alertsContext';
import { ScrimsProvider } from './context/scrimsContext';
import ReactComment from './components/shared/ReactComment';
import { creditsComment } from './creditsComment';
import { Provider } from 'react-redux';
import configureStore from './store'; // index.js

import Favicon from 'react-favicon';
import Logo from './assets/images/bootcamp_llc_media_kit/coin_logo_new2021shd.png';

const store = configureStore();

ReactDOM.render(
  <>
    <Favicon url={Logo} />

    <Router>
      <Provider store={store}>
        <AlertsProvider>
          <ScrimsProvider>
            {/* <CurrentUserProvider> */}
            {/* the only way I know to render a comment in react */}
            <ReactComment text={creditsComment} trim={false} />
            <App />
            {/* </CurrentUserProvider> */}
          </ScrimsProvider>
        </AlertsProvider>
      </Provider>
    </Router>
  </>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
