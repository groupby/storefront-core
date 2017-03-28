// tslint:disable-next-line:no-unused-variable
import { utils, Configuration, Service } from '../core';
import StoreFront from '../storefront';
import Aliasing from './alias';

export const DEFAULTS = Symbol('defaults');
export const NAME = Symbol('name');
export const VIEW = Symbol('view');
export const CSS = Symbol('css');
export const ATTRS = Symbol('attrs');
export const ALIASES = Symbol('aliases');

namespace Tag {
  // tslint:disable-next-line variable-name
  export const Alias = Aliasing;

  export function initializer(clazz: any) {
    return function init(opts: any) {
      utils.inherit(this, clazz);
      clazz.call(this, opts);
    };
  }

  export function mixin({ config, services }: StoreFront) {
    return {
      config,
      services,

      init: Tag.initializer(Instance)
    };
  }

  export interface Instance extends utils.riot.Tag.Instance {
    parent?: Instance;
  }

  export class Instance {

    state: any;

    /**
     * convenience function for retrieving the state
     */
    get s() { return this.state; }

    constructor() {
      this[ALIASES] = {};
      this['on']('before-mount', () => this.state = { ...getDefaults(this), ...this['opts'], ...this.state });
    }

    expose(aliases: string | string[], value: any = this.state, opts: any = {}) {
      utils.rayify(aliases)
        .forEach((alias) => this[ALIASES][alias] = { value, opts, ...Aliasing.parse(alias) });
    }
  }

  export function getDefaults(obj: any) {
    return obj[DEFAULTS] || {};
  }
}

export default Tag;
