// const path = require("path");

// const webpack = require("webpack");

const htmlPlugin = require("html-webpack-plugin");

// const CopyPlugin = require("copy-webpack-plugin");

const JsConfigWebpackPlugin = require('js-config-webpack-plugin');

const ENTRY = process.env.ENTRY || "二、响应系统/index.js";
const title = ENTRY.split("/").pop().split(".").shift();
console.warn("title", title);

const plugins = [
  // new JsConfigWebpackPlugin(),
  // new CopyPlugin({
  //     patterns: [
  //         { from: './src/config.js', to: './' },
  //     ]
  // }),
  new htmlPlugin({
    title,
    template: `index.ejs`,
    filename: `${title}.html`,
    base: { href: "/learn.html" },
  }),
  new htmlPlugin({
    title,
    // inject: 'body'
    // scriptLoading: 'blocking',//如果是默认值‘defer’将导致document.write语句失效！！！
    template: `index.ejs`,
    filename: "../learn.html",
    // filename: "../[name].html",
  }),
  /* ,
  new webpack.DefinePlugin({
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    BASE_URL: JSON.stringify("./"),
  }), */
];

module.exports.plugins = plugins;
