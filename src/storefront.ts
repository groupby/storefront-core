import { FluxCapacitor } from 'groupby-api';
import { Configuration, Service, System } from './core';
import { TAGS } from './core/system';
import services from './services';

declare var VERSION;

@((target) => { target[TAGS] = []; })
export default class StoreFront {

  static _instance: StoreFront;
  static version: string = VERSION;

  log: Log;
  config: Configuration;
  flux: FluxCapacitor;
  services: Service.Map;

  constructor(config: Configuration = <any>{}) {
    if (StoreFront._instance) {
      return StoreFront._instance;
    }

    StoreFront._instance = this;

    const system = new System(this);

    system.bootstrap(services, config);
    system.initServices();
    system.initMixin();
    system.registerTags();

    this.log.info(`StoreFront v${VERSION} loaded! 🏬`);
  }

  register(registerTag: (app: StoreFront) => void) {
    registerTag(this);
  }

  static register(registerTag: (app: StoreFront) => void) {
    StoreFront[TAGS].push(registerTag);
  }
}
