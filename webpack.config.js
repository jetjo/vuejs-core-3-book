const path = require("path");
// const { rules } = require("./webpack.rules");
const { plugins } = require("./webpack.plugins");
const { dir } = require("console");

const ENTRY = "./" + (process.env.ENTRY || "二、响应系统/index.js");
const title = ENTRY.split("/").pop().split(".").shift();

/**
 * NOTE: 这里千万别以./开头,
 * 否则webpack-dev-server找不到页面,还没有报错
 * 我草泥马!!!!, 这还用配置你webpack,点明了要你报错才报吗???
 * 这么严重的问题,不该自动报错吗???
 * 我草泥马的十三点,配置一大坨,垃圾webpack
 */
const publicPath = "/assets/";
console.warn("ENTRY", ENTRY);
console.warn("OPEN: ", `${publicPath}${title}.html`);

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
    publicPath,
    // 输出目录path中的资源发布到服务器后,
    // 相对于被访问的页面(页面需要加载打包输出的资源)而言的虚拟路径
    // publicPath: "/[fullhash]/",
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
    port: 3080,
    open: false
  },
};
