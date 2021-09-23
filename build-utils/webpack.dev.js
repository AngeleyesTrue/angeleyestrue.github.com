const commonPaths = require('./common-paths');
const webpack = require('webpack');
const port = process.env.PORT || 3000;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  mode: 'development',
  entry: {
    app: `${commonPaths.appEntry}/index.js`,
  },
  output: {
    filename: '[name].[chunkhash].js',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'test', /* 분석 파일 html 보고서를 dist 폴더에 저장한다 */
      reportFilename: 'bundle-report.html', /* 분석 파일 보고서 이름은 아무거나 정하면 된다. */
      openAnalyzer: false, /* 분석창을 실행시 열지 않는다 */
      generateStatsFile: true, /* 분석 파일을 json 저장한다 . */
      statsFilename: 'bundle-stats.json', /* 분석 파일 json 이름은 아무거나 정하면 된다. */
    }),
  ],
  devServer: {
    //publicPath: '/',
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    open: true,
    hot: true,
    //inline: true,
  },
};

module.exports = config;
