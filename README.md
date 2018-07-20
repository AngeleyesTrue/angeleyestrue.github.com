# [Github 나의 소개 페이지 만들기](https://angeleyestrue.github.io/)
---

1. 사용자의 계정이 들어간 Repository를 만들어야 합니다.
> `angeleyestrue.github.com`으로 만들었습니다.

2. Root에 `Index.html` 페이지가 존재하여야 합니다.

## Repository 구성

- `Index.html` 는 `React` 기반으로 만들기 위해 아래와 같이 진행하였습니다.

### 1. 의존성 초기화

``` bash
yarn add react react-dom react-prop-types react-router-dom
yarn add babel-core babel-loader babel-preset-env babel-preset-react babel-preset-stage-1 css-loader style-loader html-webpack-plugin webpack webpack-dev-server webpack-cli -D
```

### 2. Babel 설정

`.babelrc` 생성 후 아래와 같이 작성
```json
{
    "presets": ["env", "react", "stage-1"]
}
```

### 3. Webpack 설정

``` javascript
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const port = process.env.PORT || 3000;

module.exports = {
  mode: 'development',  
  entry: './src/index.js',
  output: {
    filename: './public/bundle.[hash].js',
    path: '/'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true,
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      //favicon: 'public/favicon.ico'
    })
  ],
  devServer: {
    publicPath: '/',
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    open: true
  }
};
```

### 4. Hot Module Replacement (HMR) 설정

``` bash
yarn add react-hot-loader -D
```

`.babelrc` 파일을 아래와 같이 수정
``` json
{
  "presets": [["env", { "modules": false }], "react", "stage-1"],
  "plugins": ["react-hot-loader/babel"]
}
```

`webpack.config.js` 파일 수정
``` javascript
...
module.exports = {
  entry: './src/index.js',
  output: {
    ...
    publicPath: '/'
  },
  ...
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    ...
  ],
  devServer: {
    ...
    hot: true
  }
};
```

`index.js` 파일 수정
``` jsx
import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

const render = Component =>
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );

render(App);

// Webpack Hot Module Replacement API 부분
if (module.hot) module.hot.accept('./components/App', () => render(App));
```