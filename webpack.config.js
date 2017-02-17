const { generateConfig, stripMetadata } = require('@easy-webpack/core');
const envDev = require('@easy-webpack/config-env-development');
const envProd = require('@easy-webpack/config-env-production');
const typescript = require('@easy-webpack/config-typescript');
const uglify = require('@easy-webpack/config-uglify');
const path = require('path');
const webpack = require('webpack');
const pjson = require('./package.json');

const PROD = 'production';
const TEST = 'test';
const DEV = 'development';
const ENV = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() || (process.env.NODE_ENV = DEV);
const VERSION = pjson.version;

const outDir = path.resolve('bundle')

const config = generateConfig({
    entry: './src/index',
    output: {
      path: outDir
    },
    plugins: [
      new webpack.DefinePlugin({ VERSION: `'${VERSION}'` })
    ],
    module: {
      rules: [{
        test: /src\/index\.ts$/,
        use: [{
          loader: 'expose-loader',
          options: 'storefront'
        }, {
          loader: 'expose-loader',
          options: 'sf'
        }]
      }]
    }
  },
  (ENV === TEST || ENV === DEV) ?
  envDev(ENV !== TEST ? {} : { devtool: 'inline-source-map' }) :
  envProd({}),
  typescript(ENV !== TEST ? {} : {
    options: {
      doTypeCheck: false,
      sourceMap: false,
      inlineSourceMap: true,
      inlineSources: true
    }
  }),
  ...(ENV === PROD ? [
    uglify({ debug: false, mangle: { except: ['cb', '__webpack_require__'] } }),
    {
      output: {
        filename: `storefront-core-${pjson.version}.js`,
        sourceMapFilename: `storefront-core-${pjson.version}.map`,
      }
    }
  ] : [{}])
);

module.exports = stripMetadata(config);
