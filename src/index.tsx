/* @refresh reload */
import { Router, Route } from "@solidjs/router";
import { render } from 'solid-js/web';

import HomeContainer from "./containers/home/HomeContainer";

import './index.css';
import App from './pages';

render(() => (
  <Router root={App}>
    <Route path="/" component={HomeContainer} />
  </Router>
  ), document.getElementById('root') as HTMLElement);
