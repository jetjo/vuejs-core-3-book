// const path = require("path");

// const webpack = require("webpack");

// const CopyPlugin = require("copy-webpack-plugin");

const JsConfigWebpackPlugin = require("js-config-webpack-plugin");

const htmlPlugin = require("html-webpack-plugin");
const { title, publicPath, IS_WEBPACK_DEV_SERVER } = require("./webpack.env");

const htmlShareConf = {
  template: `index.ejs`,
  filename: `index.html`,
  // filename: "../[name].html",
  // base: { href: "/learn.html" },
  // inject: 'body'
  // scriptLoading: 'blocking',//如果是默认值‘defer’将导致document.write语句失效！！！
};

const plugins = [
  new htmlPlugin({
    ...htmlShareConf,
    title,
    filename: `${title}.html`,
  }),
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
];

if (IS_WEBPACK_DEV_SERVER) {
  plugins.push(
    new htmlPlugin({
      ...htmlShareConf,
      meta: {
        refresh: {
          "http-equiv": "refresh",
          content: `3;url=${publicPath}${title}.html`,
        },
      },
    })
  );
} else {
  plugins.push(
    new htmlPlugin({
      ...htmlShareConf,
      title,
      filename: "../learn.html",
    })
  );
}

module.exports.plugins = plugins;
