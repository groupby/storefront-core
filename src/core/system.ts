import FluxCapacitor from '@storefront/flux-capacitor';
import Globals from '../globals';
import { SystemServices } from '../services';
import StoreFront from '../storefront';
import Configuration from './configuration';
import Service from './service';
import Tag from './tag';
import * as utils from './utils';

export default class System {

  constructor(public app: StoreFront) { }

  /**
   * start services, fire up the flux-capacitor, initialize riot
   */
  bootstrap(services: Service.Constructor.Map, config: Configuration) {
    config = this.initConfig(config);
    this.initRiot();
    this.initFlux();
    this.createServices(services);

    if (typeof config.bootstrap === 'function') {
      config.bootstrap(this.app);
    }

    this.initServices();
    this.initMixin();
    this.registerTags();

    Object.defineProperty(this.app.flux, 'config', {
      get() { return this.selectors.config(this.store.getState()); }
    });
  }

  initConfig(config: Configuration) {
    return this.app.config = Configuration.Transformer.transform(config);
  }

  initRiot() {
    const riot = this.app.riot = this.app.config.options.riot || Globals.getRiot();
    Globals.set('riot', riot);
    const register = Tag.create(riot);
    this.app.register = (clazz, name) => {
      register(clazz);
      this.app.log.debug(`[tag/<${name}>] registered`);
    };
  }

  initFlux() {
    this.app.flux = new FluxCapacitor(this.app.config);
  }

  createServices(services: Service.Constructor.Map) {
    const servicesConfig = this.app.config.services || {};
    const allServices = { ...services, ...System.extractUserServices(servicesConfig) };
    this.app.services = System.buildServices(this.app, allServices, servicesConfig);
  }

  /**
   * initialize all core and user-defined services
   */
  initServices() {
    Object.keys(this.app.services)
      .forEach((key) => {
        this.app.services[key].init(this.app.services);
        this.app.log.debug(`[service/${key}] initialized`);
      });
  }

  /**
   * initialize the core riot mixin
   */
  initMixin() {
    const mixin = Tag.mixin(this.app);

    if (this.app.config.options.globalMixin) {
      this.app.riot.mixin(mixin);
    } else {
      this.app.riot.mixin('storefront', mixin);
      this.app.riot.mixin('sf', mixin);
    }
  }

  /**
   * register any tags that were registered before StoreFront started
   */
  registerTags() {
    Globals.getTags()
      .forEach((registerTag) => registerTag(this.app.register));
  }

  static buildServices(app: StoreFront, services: Service.Constructor.Map, config: any) {
    return <SystemServices>Object.keys(services)
      .filter((key) => Service.isCore(services[key]) || config[key] !== false)
      .reduce((svcs, key) => {
        const serviceConfig = typeof config[key] === 'object' ? config[key] : {};
        return Object.assign(svcs, { [key]: new services[key](app, serviceConfig) });
      }, {});
  }

  static extractUserServices(services: { [key: string]: any }): Service.Constructor.Map {
    return Object.keys(services)
      .filter((key) => typeof services[key] === 'function')
      .reduce((svcs, key) => Object.assign(svcs, { [key]: services[key] }), {});
  }
}
