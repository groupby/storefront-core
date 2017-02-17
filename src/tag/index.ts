import * as riot from 'riot';
// tslint:disable-next-line:no-unused-variable
import { Configuration, Service } from '../core';
import StoreFront from '../storefront';

namespace Tag {
  export type Instance = riot.Tag.Instance & {
    state: any;
  };
}

// tslint:disable-next-line:variable-name
const Tag = {

  mixin({ config, services }: StoreFront) {
    return {
      config,
      services,

      init(opts: any) {
        Tag.wrap(this);
      }
    };
  },

  wrap(tag: Tag.Instance) {
    const { update: rawUpdate } = tag;

    tag.state = {};
    // layman's immutability
    tag.update = (data?: any) => {
      if (data) {
        rawUpdate({ state: { ...tag.state, ...data } });
      } else {
        rawUpdate();
      }
    };
  }
};

export default Tag;
