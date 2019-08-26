import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import importedComponent from 'react-imported-component';

import Home from './Home';
import Loading from './Loading';

const AsyncAbout = importedComponent(
  () => import(/* webpackChunkName:'About' */ './About'),
  {
    LoadingComponent: Loading,
  },
);

const App = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/About" component={AsyncAbout} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
