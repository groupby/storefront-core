import * as dot from 'dot-prop';
import { camelCase } from 'lodash';
import { DEFAULTS } from '../decorators';
import StoreFront from '../storefront';

namespace Service {
  export interface Map { [key: string]: Service<any>; }
  export interface ConstructorMap { [key: string]: { new (app: StoreFront): Service<any> }; }
}

abstract class Service<T> {

  config: T;
  name: string;

  constructor(private app: StoreFront) {
    const proto = Object.getPrototypeOf(this);
    this.name = camelCase(proto.constructor.name);
    this.config = {
      ...(proto.constructor[DEFAULTS] || {}),
      ...dot.get(app.config, `services.${this.name}`, {})
    };
    app.registry.register(this.name, this.config);
  }

  abstract init(services: Service.Map): void;
}

export default Service;
