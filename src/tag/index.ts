// tslint:disable-next-line:no-unused-variable
import { utils, Configuration, Service } from '../core';
import StoreFront from '../storefront';

export const NAME = Symbol('name');
export const VIEW = Symbol('view');
export const CSS = Symbol('css');
export const ATTRS = Symbol('attrs');
export const ALIASES = Symbol('aliases');

namespace Tag {
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

  export function parseMeta(alias: string) {
    alias.split(':')
    return {};
  }

  export namespace Alias {
    export const SHALLOW = Symbol('shallow');
  }

  export interface Instance extends utils.riot.Tag.Instance {}

  export class Instance {
    parent?: Instance;
    state: any = {};

    constructor() {
      this[ALIASES] = {};
    }

    expose(aliases: string | string[], value: any = this.state, opts: any = {}) {
      utils.rayify(aliases)
        .forEach((alias) => this[ALIASES][alias] = { value, opts });
    }
  }
}

export default Tag;
