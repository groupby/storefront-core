import { Configuration, Service } from '.';
import StoreFront from '../storefront';
import Tag from '../tag';

export const CORE = Symbol('core');
export const TAGS = Symbol('tags');
export const VIEW = Symbol('view');
export const CSS = Symbol('css');
export const ATTRS = Symbol('attrs');
export const core = (target) => { target[CORE] = true; };

export default class System {

  constructor(public app: StoreFront) { }

  /**
   * allow client to modify system before services are initialized
   */
  bootstrap(services: Service.Constructor.Map, config: Configuration) {
    config = this.app.config = Configuration.Transformer.transform(config);

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

    if (this.app.config.globalMixin) {
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
    StoreFront[TAGS].forEach((registerTag) => registerTag(this.app.register));
  }

  static buildServices(app: StoreFront, services: Service.Constructor.Map, config: any): Service.Map {
    return Object.keys(services)
      .filter((key) => services[key][CORE] || config[key] !== false)
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
