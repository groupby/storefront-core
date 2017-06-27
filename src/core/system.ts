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
   * allow client to modify system before services are initialized
   */
  bootstrap(services: Service.Constructor.Map, config: Configuration) {
    config = this.app.config = Configuration.Transformer.transform(config);
    this.app.flux = new FluxCapacitor(config);

    const servicesConfig = config.services || {};
    const allServices = { ...services, ...System.extractUserServices(servicesConfig) };
    this.app.services = System.buildServices(this.app, allServices, servicesConfig);

    if (typeof config.bootstrap === 'function') {
      config.bootstrap(this.app);
    }
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
