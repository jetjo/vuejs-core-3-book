const path = require('path')
// const { rules } = require("./webpack.rules");
const { plugins } = require('./webpack.plugins.cjs')

const {
  ENTRY,
  OUT_BASE_PATH,
  publicPath,
  DEV_PORT
} = require('./webpack.env.cjs')

const toPath = url => path.resolve(__dirname, url)

const alias = {
  '#': toPath('./src'),
  '#book2': toPath('./二、响应系统')
}

module.exports = {
  context: __dirname,
  mode: 'development',
  devtool: 'inline-source-map', //'eval';//'source-map';,
  entry: { index: ENTRY },
  output: {
    filename: '[contenthash]@[name].js',
    chunkFilename: '[contenthash]@[name].js',
    // path: path.resolve(__dirname, "./dist/[fullhash]"),
    path: path.resolve(__dirname, `${OUT_BASE_PATH}/${publicPath}`),
    publicPath,
    // 输出目录path中的资源发布到服务器后,
    // 相对于被访问的页面(页面需要加载打包输出的资源)而言的虚拟路径
    // 从根本用意讲,publicPath应该是绝对路径或相对于域的路径,
    // 而不应该是以./开头的相对于当前页面的路径
    // 因为当前页面的路径是不确定的,
    // 这就使得publicPath失去了定位打包资源url的能力
    // publicPath: "/[fullhash]/",
    clean: true
  },
  // experiments: {
  //   topLevelAwait: true,
  // },
  resolve: {
    // alias
  },
  // module: {
  //   rules,
  // },
  plugins,
  devServer: {
    port: DEV_PORT,
    open: false
  }
}
