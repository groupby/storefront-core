import FluxCapacitor from '@storefront/flux-capacitor';
import Configuration from './core/configuration';
import System from './core/system';
import { log, register, riot } from './core/utils';
import Globals from './globals';
import { SystemServices } from './services';
import services from './services';

// declare var VERSION;
export default class StoreFront {

  static _instance: StoreFront;
  // static version: string = VERSION;

  riot: typeof riot = this.config.options.riot || Globals.getRiot();
  register: (...args: any[]) => void = register(this.riot);

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

  static mount() {
    return (<any>StoreFront._instance.riot.mount)(...Array.from(arguments));
  }

  static register(registerTag: (register: (clazz: any, name: string) => void) => void) {
    Globals.getTags().push(registerTag);
  }
}
