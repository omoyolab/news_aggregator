const currentTask = process.env.npm_lifecycle_event;
const path = require('path');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CSSMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const fse = require('fs-extra');

const postCSSPlugins = [
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('autoprefixer'),
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-hexrgba'),
];

// Add images to production folder
class RunAfterCompile {
  apply(complier) {
    complier.hooks.done.tap('Copy Images', function () {
      fse.copySync('./app/assets/images', './docs/assets/images');
    });
  }
}

// General CSS Configuration
let cssConfiguration = {
  test: /\.css$/i,
  use: [
    { loader: 'css-loader', options: { url: false, importLoaders: 1 } },
    {
      loader: 'postcss-loader',
      options: { postcssOptions: { plugins: postCSSPlugins } },
    },
  ],
};

// Add Multiple HTML Pages to production folder
let pages = fse
  .readdirSync('./app/pages')
  .filter(function (file) {
    return file.endsWith('.html');
  })
  .map(function (page) {
    return new HTMLWebpackPlugin({
      filename: page,
      template: `./app/pages/${page}`,
    });
  });

// General configuration for Production and Development
let configuration = {
  entry: './app/scripts/App.js',
  plugins: pages,
  module: {
    rules: [cssConfiguration],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'], // Supports React or TypeScript if you add them later
  },
};

// Development Configuration
if (currentTask == 'dev') {
  cssConfiguration.use.unshift('style-loader');

  configuration.output = {
    filename: 'bundledScripts.js',
    path: path.resolve(__dirname, 'app'),
  };

  configuration.devServer = {
    watchFiles: ['app/**/*.html'],
    static: {
      directory: path.join(__dirname, 'app'),
      watch: false,
    },
    hot: true,
    port: 3000,
  };

  configuration.mode = 'development';
  configuration.devtool = 'source-map'; // Adds source mapping for easier debugging
}

// Production Configuration
if (currentTask == 'build') {
  configuration.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  });

  cssConfiguration.use.unshift(MiniCSSExtractPlugin.loader);

  configuration.output = {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'docs'),
    clean: true,
  };

  configuration.mode = 'production';

  configuration.optimization = {
    splitChunks: { chunks: 'all', minSize: 1000 },
    minimize: true,
    minimizer: [`...`, new CSSMinimizerWebpackPlugin()]
  };

  configuration.plugins.push(
    new MiniCSSExtractPlugin({ filename: 'styles.[chunkhash].css' }),
    new RunAfterCompile()
  );
}


module.exports = configuration;
