const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new HTMLWebpackPlugin({ template: "./src/index.html" })],
  devtool: "inline-source-map",
  devServer: {
    hot: true,
    port: 3000,
    open: true,
  },
};
