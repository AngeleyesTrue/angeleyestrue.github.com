# Github 나의 소개 페이지 만들기
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
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'index'),
  output: {
    filename: './public/bundle.[hash].js',
    path: path.resolve(__dirname)
  },
  module: {
    rules: [{
      test: /.jsx?$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'bower_components')
      ],
      loader: 'babel-loader'
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
            module: true,
            camelCase: true,
            sourceMap: true
          }
        }
      ]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css']
  },
  devtool: 'source-map',
  devServer: {
    publicPath: path.join('/')
  }
};
```