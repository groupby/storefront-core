# StoreFront Core

[![npm (scoped with tag)](https://img.shields.io/npm/v/@storefront/core.svg?style=flat-square)](https://www.npmjs.com/package/@storefront/core)
[![CircleCI branch](https://img.shields.io/circleci/project/github/groupby/storefront-core/master.svg?style=flat-square)](https://circleci.com/gh/groupby/storefront-core/tree/master)
[![Codecov branch](https://img.shields.io/codecov/c/github/groupby/storefront-core/master.svg?style=flat-square)](https://codecov.io/gh/groupby/storefront-core)
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

## Upgrade

### Upgrade to version 1.40.0

In order to address issues with performance stemming from using aliases to render
deeply nested and complex components, a number of changes have been made to that
system and components which use it.

The major conceptual change to the way the system works brings it more inline
with the `<Provider>` / `<Consumer>` pattern used in `React`'s [Context API](https://reactjs.org/docs/context.html)
and the language has been changed to match (both for future clarity and to ensure incompatibility
with the previous inefficient alias system).

Summary:
- `@alias(aliasName: string)` -> `@provide(aliasName: string, resolver?: (props, state, aliases) => any)`
- `tag.expose(aliasName: string)` -> `tag.provide(aliasName: string, resolver?: (props, state, aliases) => any)`
- **(new!)** `@consume(aliasName: string)`
- **(new!)** `tag.consume(aliasName: string)`
- **(new!)** `_consumes` custom component attribute
- **(new!)** `_props` custom component attribute
- **(new!)** `<consume>` custom component
- **(new!)** `<provide>` custom component
- **(new!)** `item-props` \<gb-list\> prop
- **(removed!)** `"state-finalized"` tag lifecycle event
- **(removed!)** `"recalculate-props"` tag lifecycle event
- **(removed!)** `"props-updated"` tag lifecycle event

#### `@provide` decorator

The `@alias` decorator has been removed in preference for the new `@provide` decorator.

By default, both decorators will register an alias under the name provided
and the value will be the `state` of the component.

##### ${version} <= v1.39.X

```ts
import { alias } from '@storefront/core';

// in TypeScript
@alias('myComponent')
class MyComponent {
  state = { myValue: 'Hello, world!' };
}
```

```js
// or in ES6
@alias('myComponent')
class MyComponent {
  constructor() {
    this.state = { myValue: 'Hello, world!' };
  }
}
```

```html
<!-- in a child component -->
<span>{ $myComponent.myValue }</span>
<!-- or -->
<custom-component>
  { $myComponent.myValue }
</custom-component>
```

```html
<!-- rendered -->
<span>Hello, world!</span>
```

##### ${version} >= v1.40.0

```ts
import { provide } from '@storefront/core';

// in TypeScript
@provide('myComponent')
class MyComponent {
  state = { myValue: 'Hello, world!' };
}
```

```js
// or in ES6
@provide('myComponent')
class MyComponent {
  constructor() {
    this.state = { myValue: 'Hello, world!' };
  }
}
```

Notice that the `@alias` decorator has been replaced with a `@provide` decorator
which, when provided only a single parameter, works the exact same way as
the `@alias` decorator.

```html
<!-- in a child component -->
<span data-is="gb-container" _consumes="myComponent">
  { $myComponent.myValue }
</span>
<!-- or -->
<custom-component _consumes="myComponent">
  { $myComponent.myValue }
</custom-component>
```

Two changes are made to the "consuming" component:
1. if it's not already wrapped in a custom component, any element
can be turned into a simple component with `data-is="gb-container"`
1. a `_consumes` attribute is added which declares the alias dependencies of
the associated component scope


```html
<!-- rendered -->
<span>Hello, world!</span>
```

##### alias resolver

In order to allow aliases to change based on the state of the providing component,
the passed either using the `@provide` decorator or the `tag.provide()` method must
be a function with the following signature:

```ts
function (props: object, state: object, aliases: object) {
  return 'my value';
}
```

This function is called with the `props`, `state` and `aliases` of the providing
component every time a new value is required by a consuming component.

#### `@consume()` decorator

When creating components using a class, the `@consume()` decorator can be used
to statically declare a dependency on an alias. This is similar to using the `_consumes`
attribute on that component within a template or calling `this.consume()` within
that component's `init()` method.

##### ${version} <= v1.39.0

```ts
class CustomComponent {}
```

```html
<!-- in the component's template -->
<span>{ $myAlias }</span>
```

##### ${version} >= v1.40.0

```ts
@consumes('myAlias')
class CustomComponent {}
```

```html
<!-- in the component's template -->
<span>{ $myAlias }</span>
```

**Note:** The important change here is that only components that explicitly
"consume" an alias will be able to access the alias value within their template.
Because riot's scope is tied only to the direct ancestor component this may mean that a complex
component with multiple accesses to an alias may need to be re-thought so that only a single "consumer"
is used and then distributed by passing to child components as props or accessing from nested templates
using `tag.parent` (also sparingly).

##### ${version} <= v1.39.0

```html
<!-- inner-component.tag.html -->
<inner-component><yield/></inner-component>

<!-- inner-component.tag.html -->
<inner-component><yield/></inner-component>

<!-- app.tag.html -->
<app>
  <some-component>
    <inner-component someProp="{ $x }">
      This is my innermost content: "{ $y }"
    </inner-component>
  </some-component>

  <script>
    this.expose('x', 'outer value');
    this.expose('y', 'inner value');
  </script>
</app>
```

##### ${version} >= v1.40.0

```html
<!-- inner-component.tag.html -->
<inner-component><yield/></inner-component>

<!-- inner-component.tag.html -->
<inner-component>
  <label>{ props.someProp }</label>
  <yield/>
</inner-component>

<!-- app.tag.html -->

<!-- broken implementation -->
<app>
  <some-component _consumes="x,y">
    <inner-component some-prop="{ $x }">
      <!-- NOTE: $y is unavailable in this context -->
      This is my innermost content: "{ $y }"
    </inner-component>
    <!-- although it IS available in this context -->
  </some-component>

  <script>
    this.provide('x', () => 'outer value');
    this.provide('y', () => 'inner value');
  </script>
</app>

<!-- working implementation -->
<app>
  <some-component _consumes="x">
    <inner-component some-prop="{ $x }" _consumes="y">
      This is my innermost content: "{ $y }"
    </inner-component>
  </some-component>

  <script>
    this.provide('x', () => 'outer value');
    this.provide('y', () => 'inner value');
  </script>
</app>

<!-- alternative implementation -->
<app>
  <some-component _consumes="x,y">
    <inner-component some-prop="{ $x }">
      This is my innermost content: "{ parent.$y }"
    </inner-component>
  </some-component>

  <script>
    this.provide('x', () => 'outer value');
    this.provide('y', () => 'inner value');
  </script>
</app>
```

#### `tag.provide()` and `tag.consume()`

These methods can be called from within the component's `init()` method only
to provide and consume aliases.

```ts
class MyComponent {
  init() {
    this.consume('parentAlias');
    this.provide('myAlias', ({ label }, { currentValue }) => ({ label, currentValue }));
    // note that aliases passed to the resolver do not include the dollar sign ($) prefix
    this.provide('other', (props, state, { parentAlias }) => ({ label, currentValue, ...parentAlias }));
  }

  onBeforeMount() {
    // this will throw an exception if called outside of the `init()` method
    this.provide('myAlias', ({ label }, { currentValue }) => ({ label, currentValue }));
  }
}
```

```ts
class NestedComponent {
  init() {
    this.consume('myAlias');
  }

  onBeforeMount() {
    // this will throw an exception if called outside of the `init()` method
    this.consume('myAlias');
  }
}
```

#### `_consumes` custom component attribute

This attribute marks a component as a consumer of one or multiple aliases.

```html
<!-- consume a single alias -->
<gb-button _consumes="someAlias">{ $someAlias }</gb-button>

<!-- consume multiple aliases -->
<gb-button _consumes="someAlias,otherAlias">{ $someAlias } and { $otherAlias }</gb-button>
```

#### `_props` custom component attribute

In lieu of being able to spread props onto a component (such as in JSX) the `_props`
attribute has been added. The object passed will be spread as the props of the component
and are overridden by any explicitly passed props.

```html
<!-- spread props -->
<simple-tag _props="{{ a: 'b', c: 'd', e: 'f' }}"></simple-tag>

<!-- spread props and override -->
<simple-tag c="d2" _props="{{ a: 'b', c: 'd', e: 'f' }}"></simple-tag>
<!-- results in props: { a: 'b', c: 'd2', e: 'f' } -->
```

#### `<consume>` and `<provide>`

These components have been added to allow for declarative aliasing but are still rough
around the edges as they still introduce a scope and a custom tag into the DOM.

For now, the most useful pattern is to use the `data-is` property on a `<virtual>` tag
in order to avoid the additional DOM node.

```html
<outer-component>
  <virtual data-is="provide" data="{ someData }" as="someAlias">
    <inner-component>
      <virtual data-is="consume" alias="someAlias">
        <child-component>{ $someAlias }</child-component>
      </virtual>
    </inner-component>
  </virtual>
</outer-component>

<!-- alternative syntax -->
<outer-component>
  <virtual data-is="provide" data="{ someData }" as="someAlias">
    <inner-component>
      <child-component _consumes="someAlias">{ $someAlias }</child-component>
    </inner-component>
  </virtual>
</outer-component>

<!-- consume multiple -->
<virtual data-is="consume" aliases="firstAlias,secondAlias">
  { ... }
</virtual>

<!-- provide multiple -->
<virtual data-is="provide" data="{ someData }" as="firstAlias">
  <virtual data-is="provide" data="{ otherData }" as="secondAlias">
    { ... }
  </virtual>
</virtual>
```


#### `<gb-list>` `item-props` attribute

In order to provide props directly to the `<gb-list-item>` components within
`<gb-list>` the `item-props` attribute has been added. This props is passed into
the `_props` prop of the `<gb-list-item>` tags.

```html
<gb-list items="{ [1, 2, 3] }" item-props="{{ a: 'b' }}">
  { props.a } { item }
</gb-list>

<!-- rendered -->
<ul>
  <li>b 1</li>
  <li>b 2</li>
  <li>b 3</li>
</ul>
```
