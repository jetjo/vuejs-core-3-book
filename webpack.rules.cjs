const include = /二、响应系统/;

const esLoader = {
  test: /\.(j|t)s$/,
  use: [
    "babel-loader",
    {
      loader: "ts-loader",
      options: {},
    },
  ],
  include,
};

module.exports.rules = [];
