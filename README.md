# StoreFront Core

[![npm (scoped with tag)](https://img.shields.io/npm/v/@storefront/core.svg?style=flat-square)](https://www.npmjs.com/package/@storefront/core)
[![CircleCI branch](https://img.shields.io/circleci/project/github/groupby/storefront-core/master.svg?style=flat-square)](https://circleci.com/gh/groupby/storefront-core/tree/master)
[![Codecov branch](https://img.shields.io/codecov/c/github/groupby/storefront-core/master.svg?style=flat-square)](https://codecov.io/gh/groupby/storefront-core)
[![Code Climate](https://codeclimate.com/github/groupby/storefront-core/badges/gpa.svg)](https://codeclimate.com/github/groupby/storefront-core)
[![Dependency Status](https://dependencyci.com/github/groupby/storefront-core/badge?style=flat-square)](https://dependencyci.com/github/groupby/storefront-core)
[![Known Vulnerabilities](https://snyk.io/test/github/groupby/storefront-core/badge.svg)](https://snyk.io/test/github/groupby/storefront-core)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![Greenkeeper badge](https://badges.greenkeeper.io/groupby/storefront-core.svg)](https://greenkeeper.io/)

[![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://choosealicense.com/licenses/mit/)
[![API Reference](https://img.shields.io/badge/API_reference-latest-blue.svg?style=flat-square)](https://groupby.github.io/storefront-core/)

## Getting Started

StoreFront's core module can be used to start an instance of StoreFront, mount tags to the DOM and register custom tags.
It also contains a number of useful abstractions for the development of custom tags.

### Prerequisites

This module is meant to be used in a `node` environment which is bundled for use in the browser.

### Installing

Use `npm` or `yarn` to install in a `node` project that uses `webpack`, `browserify` or similar.

```sh
npm install --save @storefront/core
# or
yarn add @storefront/core
```

## Usage

This module can be used both to start an entire StoreFront application,
or to create a new component that registers with your application.

### Start StoreFront

```js
import StoreFront from '@storefront/core';

// start a StoreFront application
const app = new StoreFront({ /* config */ });

// mount a component
StoreFront.mount('gb-query');
// or
app.mount('gb-query');
```

#### Configuration

*   `customerId`: The only required configuration that must be passed
    to start a StoreFront instance

The rest of the configuration can be found in the [generated API reference](https://groupby.github.io/storefront-core/modules/configuration.html).

### Use with Webpack

The current minimal webpack configuration to load components from `@storefront` npm packages
and link them with @storefront/core.

```js
// app.js
var StoreFront = require('@storefront/core').default;
require('@storefront/structure');
require('@storefront/query');

new StoreFront({ customerId: 'myCustomer' }).mount('*');
```

```js
// webpack.config.js
module.exports = {
  entry: './app',

  module: {
    rules: [{
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: /\.css$/,
      use: [
        'to-string-loader',
        'css-loader'
      ]
    }]
  }
};
```

### Register custom component

Although the supplied development tools do not require ES2015+ to function,
the examples will show them with that syntax for cleanliness

```js
import { tag } from '@storefront/core';

const template = '<div>{ someContent }</div>';
// or if storing in separate file
const template = require('./my-component.html');

@tag('my-component', template)
class MyComponent {

  init() {
    this.someContent = 'hello world!';
  }
}
```

## Running the tests

Tests can be run to generate coverage information.
Once run, open `coverage/index.html` in your browser to view coverage breakdown.

```sh
npm start coverage
# or
yarn start coverage
```

Tests can be run continuously for development

```sh
npm run tdd
# or
yarn tdd
```

Tests can also be run alone

```sh
npm test
# or
yarn test
```
