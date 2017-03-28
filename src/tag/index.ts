import * as riot from 'riot';
// tslint:disable-next-line:no-unused-variable
import { Configuration, Service } from '../core';
import StoreFront from '../storefront';

namespace Tag {
  export type Instance = riot.Tag.Instance & {
    state: any;
  };

  export function mixin({ config, services }: StoreFront) {
    return {
      config,
      services,

      init(opts: any) {
        Tag.wrap(this);
      }
    };
  }

  export function wrap(tag: Tag.Instance) {
    
  }
}

export default Tag;
