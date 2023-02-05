import { Routes, Route } from "@solidjs/router"
import type { Component } from 'solid-js';

import HomeContainer from "./containers/home/HomeContainer";

import styles from './pages.module.css';

const App: Component = () => {
  return (
    <div class={ styles.pageWrapper }>
      <Routes>
        <Route path="/" component={HomeContainer} />
      </Routes>
    </div>
  );
};

export default App;
