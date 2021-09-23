import React, { Suspense, lazy } from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import importedComponent from 'react-imported-component';
import './App.css';

const Home = lazy(() => import('./Home'));
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
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/About" component={AsyncAbout} />
        </Switch>
      </Suspense>
    </Router>
  );
};

export default App;
