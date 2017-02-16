import { camelCase } from 'lodash';
import SERVICES from './services';
import Service from './services/service';
import StoreFront from './storefront';

export const CORE_SERVICES = ['collections', 'filter'];

export default class System {

  constructor(private app: StoreFront) { }

  initServices() {
    const constructors: Service.ConstructorMap = SERVICES.reduce((map, service) =>
      Object.assign(map, { [camelCase(service.name)]: service }), {});

    const services: Service.Map = Object.keys(constructors)
      .reduce((map, key) =>
        Object.assign(map, { [key]: new constructors[key](this.app) }), {});

    Object.values(services)
      .forEach((service) => service.init(services));

    return Object.assign(this.app, { services });
  }

  initMixin() {
    
  }
}
