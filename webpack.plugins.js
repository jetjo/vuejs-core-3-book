// const path = require("path");

// const webpack = require("webpack");

// const CopyPlugin = require("copy-webpack-plugin");

const JsConfigWebpackPlugin = require('js-config-webpack-plugin')

const htmlPlugin = require('html-webpack-plugin')
const { title, publicPath, IS_WEBPACK_DEV_SERVER } = require('./webpack.env')

const hpBaseOption = {
  template: `index.ejs`,
  filename: `index.html`
  // filename: "../[name].html",
  // base: { href: "/learn.html" },
  // inject: 'body'
  // scriptLoading: 'blocking',//如果是默认值‘defer’将导致document.write语句失效！！！
}

const plugins = [
  new htmlPlugin({
    ...hpBaseOption,
    title,
    filename: `${title}.html`
  })
  // new JsConfigWebpackPlugin(),
  // new CopyPlugin({
  //     patterns: [
  //         { from: './src/config.js', to: './' },
  //     ]
  // }),
  // new webpack.DefinePlugin({
  //   __VUE_OPTIONS_API__: JSON.stringify(true),
  //   __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
  //   BASE_URL: JSON.stringify("./"),
  // }),
]

if (IS_WEBPACK_DEV_SERVER && title !== 'index') {
  plugins.push(
    new htmlPlugin({
      ...hpBaseOption,
      meta: {
        refresh: {
          'http-equiv': 'refresh',
          content: `3;url=${publicPath}${title}.html`
        }
      }
    })
  )
}
if (!IS_WEBPACK_DEV_SERVER && title !== 'learn') {
  plugins.push(
    new htmlPlugin({
      ...hpBaseOption,
      title,
      filename: '../learn.html'
    })
  )
}

module.exports.plugins = plugins
