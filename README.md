# [Github 나의 소개 페이지 만들기](https://angeleyestrue.github.io/)
---

1. 사용자의 계정이 들어간 Repository를 만들어야 합니다.
> `angeleyestrue.github.com`으로 만들었습니다.

2. Root에 `Index.html` 페이지가 존재하여야 합니다.
> Repository 구성은 `React` 기반으로 아래와 같이 진행하였습니다.

## 1. 의존성 초기화

``` bash
yarn add react react-dom react-prop-types react-router-dom
yarn add babel-core babel-loader babel-preset-env babel-preset-react babel-preset-stage-1 css-loader style-loader html-webpack-plugin webpack webpack-dev-server webpack-cli -D
```

## 2. Babel 설정

`.babelrc` 생성 후 아래와 같이 작성
```json
{
    "presets": ["env", "react", "stage-1"]
}
```

## 3. Webpack 설정

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

## 4. Hot Module Replacement (HMR) 설정

``` bash
yarn add react-hot-loader -D
```

### `.babelrc` 파일을 아래와 같이 수정
``` json
{
  "presets": [["env", { "modules": false }], "react", "stage-1"],
  "plugins": ["react-hot-loader/babel"]
}
```

### `webpack.config.js` 파일 수정
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

###`index.js` 파일 수정
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

## 5. 코드 분할

>코드 분할(code splitting)을 사용하면 큰 번들 대신에 비동기 또는 병렬로 로드되는 여러 개의 번들을 만들 수 있다. 또한 Vendor 코드를 분리시켜 앱에서 로딩 시간을 줄일 수 있게 된다.

>그러나 새 페이지가 실제로 아주 빨리 로딩되는 경우, 사용자는 몇 밀리 초 동안 깜빡이는 로드 스피너를 보지 못하게 되므로 300 밀리 초 정도 로딩되는 컴포넌트를 지연시키고자 한다. 이를 위해 [react-delay-render](https://github.com/theKashey/react-imported-component) 라이브러리를 사용할 것이다.

``` bash
yarn add react-imported-component react-delay-render
```

- `App.js` 파일 수정
``` jsx
import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import importedComponent from 'react-imported-component';

import Home from './Home';
import Loading from './Loading';

const AsyncAbout = importedComponent(
  () => import(/* webpackChunkName:'About' */ './About'),
  {
    LoadingComponent: Loading
  }
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
```

- `webpack.config.js` 파일 수정

``` javascript
...
module.exports = {
  ...
  output: {
    filename: '[name].[hash].js',
    ...
  },
}
```

### vendor 파일 분리

> vendor로 애플리케이션 코드를 쪼개보자. `webpack.config.js` 파일을 열고 아래와 같이 파일을 변경한다.

``` javascript
...
module.exports = {
  entry: {
    vendor: ['semantic-ui-react'],
    app: './src/index.js'
  },
  ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          test: 'vendor',
          name: 'vendor',
          enforce: true
        }
      }
    }
  },
  ...
};
```

> `entry.vendor: ['semantic-ui-react']`
>- 메인 앱에서 특정 라이브러리를 빼내어 vendor로 만드는 것

> `optimization`
>- 최적화 작업 진행

### 배포 설정

> `webpack.config.js`파일을 `webpack.config.dev.js`로 변경하고 `webpack.config.prod.js`를 추가한다.

``` bash
yarn add extract-text-webpack-plugin@next -D
```

> css 파일은 js와 함께 번들링 되지 않도록 구성하기 위해서 `extract-text-webpack-plugin`을 추가한다.
webpack 4를 지원하는 선 배포판을 구성하였다.