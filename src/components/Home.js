import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <p>사이트 정비 중입니다.</p>
            <p>
                <Link to="/About">Navigate to Abuout Page</Link>
            </p>
            <p>
                <a href="http://naver.com" target="_blank">네이버</a><br />
                <a href="javascript:window.open('http://naver.com')">자바스크립트 오픈</a>
            </p>
        </div>
    );
};

export default Home;