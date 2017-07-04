const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackCommon = require('./baseConfig');

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const DefinePlugin = require('webpack/lib/DefinePlugin');



module.exports = webpackMerge(webpackCommon, {

  module: {
    rules: [
      {
        test: /\.hbs/,
        loader: 'handlebars-loader',
        exclude: /(node_modules|bower_components)/,
      },
    ],
  },
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Custom template using Handlebars',
      template: './src/hbs/index.hbs',
    }),
  ],
});