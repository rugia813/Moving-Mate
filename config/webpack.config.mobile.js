const configProd = require('./webpack.config.prod');
const helpers = require('./helpers');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const env = require('../environment/prod.env');
const extractSass = new ExtractTextPlugin({
  filename: 'css/[name].[contenthash].css',
  disable: process.env.NODE_ENV === 'development'
});

configProd.output = {
  filename: '[name].js',
  publicPath: '',
  path: helpers.root('mobile-app/www/dist'),
}

configProd.plugins = [
  new DefinePlugin({
    'process.env': env
  }),
  new UglifyJsPlugin({
    include: /\.js$/,
    uglifyOptions: {
      ie8: false,
      ecma: 6,
      mangle: { keep_fnames: true },
      output: {
        comments: false,
        beautify: false,
      },
      compress: { keep_fnames: true, drop_console: true},
      warnings: false
    }
  }),
  // new webpack.optimize.UglifyJsPlugin({
  //   include: /\.js$/,
  //   mangle: { keep_fnames: false, screw_ie8: true },
  //   compress: { keep_fnames: false, screw_ie8: true, warnings: false },
  //   sourceMap: false,
  //   removeComments: true,
  //   beautify: false
  // }),
  extractSass,
  new HtmlWebpackPlugin({
    inject: true,
    template: helpers.root('/src/index.html'),
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    },
    chunksSortMode: 'dependency',
  }),
  // new SWPrecacheWebpackPlugin({
  //   cacheId: 'MovingMate',
  //   filename: 'service-worker.js',
  //   staticFileGlobs: ['dist/**/*.{js,html,css}'],
  //   minify: true,
  //   stripPrefix: 'dist/'
  // }),
  new webpack.HashedModuleIdsPlugin(),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks(module) {
      // any required modules inside node_modules are extracted to vendor
      return (
        module.resource &&
        /\.js$/.test(module.resource) &&
        module.resource.indexOf(
          path.join(__dirname, '../node_modules')
        ) === 0
      )
    }
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'app',
    async: 'vendor-async',
    children: true,
    minChunks: 3
  }),
]

module.exports = configProd;