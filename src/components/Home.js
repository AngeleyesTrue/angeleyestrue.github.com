import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <p>Hello World of React and Webpack! hot Reloaded;;</p>
            <p>
                <Link to="/About">Navigate to Abuout Page</Link>
            </p>
        </div>
    );
};

export default Home;