import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
    authorizationParams={{
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      redirect_uri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
    }}
  >
    <App />
  </Auth0Provider>,
);
