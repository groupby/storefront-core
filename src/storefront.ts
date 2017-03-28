// import { FluxCapacitor } from 'groupby-api';
import {
  attr as _attr,
  css as _css,
  defaults as _defaults,
  utils,
  view as _view,
  Configuration,
  Service,
  System,
  Tag
} from './core';
import { TAGS } from './core/system';
import services from './services';

// declare var VERSION;

@((target) => { target[TAGS] = []; })
class StoreFront {

  static _instance: StoreFront;
  // static version: string = VERSION;

  riot: typeof utils.riot = this.config.riot || utils.riot;
  register: (...args: any[]) => void = utils.register(this.riot);

  log: Log;
  // flux: FluxCapacitor;
  services: Service.Map;

  constructor(public config: Configuration = <any>{}) {
    if (StoreFront._instance) {
      return StoreFront._instance;
    }

    StoreFront._instance = this;

    const system = new System(this);

    system.bootstrap(services, config);
    system.initServices();
    system.initMixin();
    system.registerTags();

    // this.log.info(`StoreFront v${VERSION} loaded! 🏬`);
  }

  static mount() {
    return (<any>StoreFront._instance.riot.mount)(...Array.from(arguments));
  }

  static register(registerTag: (register: (clazz: any, name: string) => void) => void) {
    StoreFront[TAGS].push(registerTag);
  }
}

namespace StoreFront {
  export const attr = _attr;
  export const css = _css;
  export const defaults = _defaults;
  export const view = _view;
  export type Tag = Tag.Instance;
}

export default StoreFront;
