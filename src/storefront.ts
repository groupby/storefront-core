import FluxCapacitor from '@storefront/flux-capacitor';
import Configuration from './core/configuration';
import System from './core/system';
import Tag from './core/tag';
import { log, riot } from './core/utils';
import Globals from './globals';
import { SystemServices } from './services';
import services from './services';

// declare var VERSION;
export default class StoreFront {

  static _instance: StoreFront;
  // static version: string = VERSION;

  riot: typeof riot;
  register: (...args: any[]) => void = Tag.create(this.riot);

  log: typeof log;
  flux: FluxCapacitor;
  services: SystemServices;

  constructor(public config: Configuration = <any>{ options: {} }) {
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
    this.flux.store.dispatch(this.flux.actions.startApp());
  }

  mount(...args: any[]) {
    return (<any>this.riot.mount)(...args);
  }

  static mount(...args: any[]) {
    return StoreFront._instance.mount(...args);
  }

  static register(registerTag: (register: (clazz: any, name: string) => void) => void) {
    Globals.getTags().push(registerTag);
  }
}
