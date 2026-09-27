import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {reloadOnResume} from './lib/session';
import './index.css';

// An installed web app is resumed rather than reloaded, so ask for a fresh session on every open.
reloadOnResume();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
