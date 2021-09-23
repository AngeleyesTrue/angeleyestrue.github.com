const commonPaths = require('./common-paths');
const webpack = require('webpack');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  mode: 'production',
  entry: {
    app: [`${commonPaths.appEntry}/index.js`],
    //About: [`${commonPaths.appEntry}/About.js`],
  },
  output: {
    path: `${commonPaths.projectRoot}/dist/`,
    filename: 'static/[name].[chunkhash].js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/dist/styles/'
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/styles.[hash].css',
      chunkFilename : 'styles/styles.[id].css',
    }),
    new WebpackManifestPlugin({
      fileName: 'assets.json',
      basePath: './'
    }),
    new HtmlWebpackPlugin({
      title: 'Custom template',
      // Load a custom template (lodash by default)
      template: './public/index.html',
      filename: 'index.html'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', /* 분석 파일 html 보고서를 dist 폴더에 저장한다 */
      reportFilename: 'bundle-report.html', /* 분석 파일 보고서 이름은 아무거나 정하면 된다. */
      openAnalyzer: true, /* 분석창을 실행시 열지 않는다 */
      generateStatsFile: true, /* 분석 파일을 json 저장한다 . */
      statsFilename: 'bundle-stats.json', /* 분석 파일 json 이름은 아무거나 정하면 된다. */
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/i,
          chunks: 'all',
        }
      },
    },
    // 런타임 chunk
    runtimeChunk: {
      name: "runtime"
    }
  }
};

module.exports = config;
