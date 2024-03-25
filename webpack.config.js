const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const DotEnv = require("dotenv-webpack");

module.exports = {
  mode: process.env.ENVIRONMENT === "PROD" ? "production" : "development",
  entry: {
    main: "./src/index.ts",
    lobby: "./src/lobby.ts",
  },
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
        test: /\.html$/i,
        use: "html-loader",
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new DotEnv(),
    new HTMLWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["main"],
    }),
    new HTMLWebpackPlugin({
      filename: "lobby.html",
      template: "./src/lobby.html",
      chunks: ["lobby"],
    }),
  ],
  devtool: "inline-source-map",
  devServer: {
    hot: true,
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
