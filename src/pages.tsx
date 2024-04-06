import type { Component } from 'solid-js';

import styles from './pages.module.css';

const App: Component = (props: any) => {
  return (
    <div class={ styles.pageWrapper }>
      {props.children}
    </div>
  );
};

export default App;
