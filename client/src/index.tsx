import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './containers/App';
import MainRouter from 'MainRouter';
import reportWebVitals from './reportWebVitals';
import store from './stores';
import './index.css';
import './lib/styles/_reboot.css';
import './lib/styles/main.scss';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <MainRouter />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
