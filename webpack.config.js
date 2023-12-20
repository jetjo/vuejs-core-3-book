const path = require("path");
// const { rules } = require("./webpack.rules");
const { plugins } = require("./webpack.plugins");
const { dir } = require("console");

const ENTRY = "./" + (process.env.ENTRY || "二、响应系统/index.js");

console.warn("ENTRY", ENTRY);

module.exports = {
  context: __dirname,
  mode: "development",
  devtool: "inline-source-map", //'eval';//'source-map';,
  entry: { index: ENTRY },
  output: {
    filename: "[contenthash]@[name].js",
    chunkFilename: "[contenthash]@[name].js",
    // path: path.resolve(__dirname, "./dist/[fullhash]"),
    path: path.resolve(__dirname, "./dist/assets"),
    publicPath: "./assets/",
    // 输出目录path中的资源发布到服务器后,
    // 相对于被访问的页面(页面需要加载打包输出的资源)而言的虚拟路径
    // publicPath: "./[fullhash]/",
    clean: true,
  },
  // experiments: {
  //   topLevelAwait: true,
  // },
  resolve: {
    alias: {
      "@book2": path.resolve(__dirname, "./二、响应系统"),
    },
  },
  // module: {
  //   rules,
  // },
  plugins,
  devServer: {
    port: 3080, // 端口号
    // https: false, // HTTP/2
    static: {
      directory: path.join(__dirname, "./dist"),
      serveIndex: true,
    },
  },
};
