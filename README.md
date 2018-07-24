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

- `.babelrc` 파일을 아래와 같이 수정
``` json
{
  "presets": [["env", { "modules": false }], "react", "stage-1"],
  "plugins": ["react-hot-loader/babel"]
}
```

- `webpack.config.js` 파일 수정
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

코드 분할(code splitting)을 사용하면 큰 번들 대신에 비동기 또는 병렬로 로드되는 여러 개의 번들을 만들 수 있다. 또한 Vendor 코드를 분리시켜 앱에서 로딩 시간을 줄일 수 있게 된다.

그러나 새 페이지가 실제로 아주 빨리 로딩되는 경우, 사용자는 몇 밀리 초 동안 깜빡이는 로드 스피너를 보지 못하게 되므로 300 밀리 초 정도 로딩되는 컴포넌트를 지연시키고자 한다. 이를 위해 [react-delay-render](https://github.com/theKashey/react-imported-component) 라이브러리를 사용할 것이다.

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

vendor로 애플리케이션 코드를 쪼개보자. `webpack.config.js` 파일을 열고 아래와 같이 파일을 변경한다.

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

`webpack.config.js`파일을 `webpack.config.dev.js`로 변경하고 `webpack.config.prod.js`를 추가한다.

``` bash
yarn add extract-text-webpack-plugin@next -D
```

> css 파일은 js와 함께 번들링 되지 않도록 구성하기 위해서 `extract-text-webpack-plugin`을 추가한다.
webpack 4를 지원하는 선 배포판을 구성하였다.

- `webpack.config.prod.js` 파일 설정

production 용에서만 css 파일을 번들링하므로 production config 파일에만 설정한다.

``` javascript
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'production',  
  entry: {
    vendor: ['@material-ui/core'],
    app: './src/index.js'
  },
  output: {
    filename: 'dist/static/[name].[hash].js',
    path: path.resolve(__dirname),
    publicPath: '/',
  },
  devtool: 'source-map',
  module: {
    rules: [
    {
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    },
    {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            camelCase: true,
            sourceMap: true
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            config: {
              ctx: {
                autoprefixer: {
                  browsers: 'last 2 versions'
                }
              }
            }
          }
        }
        ]
      })
    }
    ]
  },
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
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      //favicon: 'public/favicon.ico'
    }),
    new ExtractTextPlugin({
      filename: 'dist/styles/styles.[hash].css',
      allChunks: true
    })
  ]
};
```

``` bash
yarn add postcss-loader -D
```

autofixer 사용을 위해 postcss-loader를 설치 한다.

- `postcss.config.js` 파일 설정

``` javascript
module.exports = {
  plugins: [require('autoprefixer')]
};
```

- `package.json` 파일의 script section에 `start` 부분을 `dev`로 변경하고 `prebuild`, `build`를 추가한다.

``` json
...
"scripts": {
  "dev":"webpack-dev-server --config webpack.config.dev.js",
  "prebuild": "rimraf dist",
  "build": "cross-env NODE_ENV=production webpack -p --config webpack.config.prod.js"
},
...
```

## 6. Webpack 구성

common, dev, production으로 구분하여 분리한다.

``` bash
yarn add webpack-merge chalk -D

mkdir -p build-utils/addons
cd build-utils
touch build-validations.js common-paths.js webpack.common.js webpack.dev.js webpack.prod.js
```

- `common-paths.js` 파일 구성

Webpack 구성 경로 설정

``` javascript
const path = require('path');
const PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = {
  projectRoot: PROJECT_ROOT,
    outputPath: path.join(PROJECT_ROOT),
  appEntry: path.join(PROJECT_ROOT, 'src')
};
```

- `build-validations.js` 파일 구성

``` javascript
const chalk = require('chalk');
const ERR_NO_ENV_FLAG = chalk.red(
  `You must pass an --env.env flag into your build for webpack to work!`
);

module.exports = {
  ERR_NO_ENV_FLAG
};
```

- `webpack.common.js` 파일 구성

``` javascript
const commonPaths = require('./common-paths');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  entry: {
    vendor: ['@material-ui/core']
  },
  output: {
    path: commonPaths.outputPath,
    publicPath: '/',
  },
  module: {
    rules: [
    {
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }
    ]
  },
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
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      //favicon: 'public/favicon.ico'
    })
  ]
};

module.exports = config;
```

- `webpack.config.dev.js` 파일 구성

``` javascript
const commonPaths = require('./common-paths');
const webpack = require('webpack');
const port = process.env.PORT || 3000;

const config = {
  mode: 'development',  
  entry: {
    app: `${commonPaths.appEntry}/index.js`
  },
  output: {
    filename: '[name].[hash].js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
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
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    publicPath: '/',
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    open: true,
    hot: true
  }
};

module.exports = config;
```

- `webpack.config.prod.js` 파일 구성

``` javascript
const commonPaths = require('./common-paths');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  mode: 'production',  
  entry: {
    app: [`${commonPaths.appEntry}/index.js`]
  },
  output: {
    filename: 'dist/static/[name].[hash].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                camelCase: true,
                sourceMap: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  ctx: {
                    autoprefixer: {
                      browsers: 'last 2 versions'
                    }
                  }
                }
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'dist/styles/styles.[hash].css',
      allChunks: true
    })
  ]
};

module.exports = config;
```

- `package.json` 파일 수정

webpack config 파일 경로 지정에서 환경변수를 이용하여 값을 전달하는 방식으로 변경

``` javascript
...
"scripts": {
  "dev": "webpack-dev-server --env.env=dev",
  "prebuild": "rimraf dist",
  "build": "cross-env NODE_ENV=production webpack -p --env.env=prod"
},
...
```

- `webpack.config.js` 파일 구성

변경된 webpack 경로 및 addons 설정을 한다.

``` javascript
const buildValidations = require('./build-utils/build-validations');
const commonConfig = require('./build-utils/webpack.common');

const webpackMerge = require('webpack-merge');

// 애드온(addon)으로 웹팩 플러그인을 추가할 수 있다. 
// 개발할 때마다 실행할 필요가 없다.
// '번들 분석기(Bundle Analyzer)'를 설치할 때가 대표적인 예다.
const addons = (/* string | string[] */ addonsArg) => {
  
  // 애드온(addon) 목록을 노멀라이즈(Normalized) 한다.
  let addons = [...[addonsArg]] 
    .filter(Boolean); // If addons is undefined, filter it out

  return addons.map(addonName =>
    require(`./build-utils/addons/webpack.${addonName}.js`)
  );
};

// 'env'는 'package.json' 내 'scripts'의 환경 변수를 포함한다.
// console.log(env); => { env: 'dev' }
module.exports = env => {

  // 'buildValidations'를 사용해 'env' 플래그를 확인한다.
  if (!env) {
    throw new Error(buildValidations.ERR_NO_ENV_FLAG);
  }

  // 개발 또는 프로덕션 모드 중 사용할 웹팩 구성을 선택한다.
  // console.log(env.env); => dev
  const envConfig = require(`./build-utils/webpack.${env.env}.js`);
  
  // 'webpack-merge'는 공유된 구성 설정, 특정 환경 설정, 애드온을 합친다.
  const mergedConfig = webpackMerge(
    commonConfig,
    envConfig,
    ...addons(env.addons)
  );

  // 웹팩 최종 구성을 반환한다.
  return mergedConfig;
};
```
