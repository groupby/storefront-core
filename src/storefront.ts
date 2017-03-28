// import { FluxCapacitor } from 'groupby-api';
import { attr, css, utils, view, Configuration, Service, System } from './core';
import { TAGS } from './core/system';
import services from './services';

// declare var VERSION;

@((target) => { target[TAGS] = []; })
export default class StoreFront {

  static _instance: StoreFront;
  static attr: typeof attr = attr;
  static css: typeof css = css;
  static view: typeof view = view;
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
