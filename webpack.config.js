const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: '@jsiqle/core',
      type: 'umd2',
    },
  },
  target: 'node',
  resolve: {
    alias: {
      src: [path.resolve(__dirname, 'src')],
    },
  },
  stats: 'minimal',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: true,
          ecma: 6,
          mangle: false,
          sourceMap: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [/src/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
              ],
            },
          },
        ],
      },
    ],
  },
};
