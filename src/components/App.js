import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';
import About from './About';

const App = () => {
    return (
        <Router>
            <div>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/About" component={About} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;