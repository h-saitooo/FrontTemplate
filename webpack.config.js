'use strict';
const path    = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/assets/js/main.js',
  output: {
    path: `${__dirname}/dest/assets/js`,
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {'modules': false}]
          ]
        }
      }]
    }]
  },
  devtool: 'source-map'
};