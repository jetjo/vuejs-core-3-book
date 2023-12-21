const ENTRY = "./" + (process.env.ENTRY || "二、响应系统/index.js");
const title = ENTRY.split("/").pop().split(".").shift();
const IS_WEBPACK_DEV_SERVER = process.env.IS_WEBPACK_DEV_SERVER;
const PUB_PATH = process.env.PUB_PATH;
const OUT_BASE_PATH = process.env.DISK_OUT_BASE_PATH;

if (PUB_PATH) {
  if (PUB_PATH[0] !== "/") {
    throw new Error("env PUB_PATH must start with /");
  }
  if (PUB_PATH[PUB_PATH.length - 1] !== "/") {
    throw new Error("env PUB_PATH must end with /");
  }
}
/**
 * NOTE: 这里千万别以./开头,
 * 否则webpack-dev-server找不到页面,还没有报错
 * 我草泥马!!!!, 这还用配置你webpack,点明了要你报错才报吗???
 * 这么严重的问题,不该自动报错吗???
 * 我草泥马的十三点,配置一大坨,垃圾webpack
 */
const publicPath = IS_WEBPACK_DEV_SERVER ? "/" : PUB_PATH || "/assets/";
console.warn("ENTRY", ENTRY);
console.warn("OPEN: ", `${publicPath}${title}.html`);

module.exports = {
  ENTRY,
  title,
  publicPath,
  IS_WEBPACK_DEV_SERVER,
  OUT_BASE_PATH,
};
