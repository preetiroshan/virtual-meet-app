const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const DotEnv = require("dotenv-webpack");

module.exports = {
  mode: process.env.ENVIRONMENT === "PROD" ? "production" : "development",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename:
      process.env.ENVIRONMENT === "PROD"
        ? "[name].[contenthash].bundle.js"
        : "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({ template: "./src/index.html" }),
    new DotEnv(),
  ],
  devtool: "inline-source-map",
  devServer: {
    hot: true,
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
