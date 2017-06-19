import { SystemServices } from '../../services';
import StoreFront from '../../storefront';

export const CORE = Symbol.for('storfront_core_service');

export const core = (target) => { target[CORE] = true; };

export abstract class BaseService<T = any> implements Service {

  constructor(protected app: StoreFront, protected opts: T) { }

  abstract init(services: SystemServices): void;
}

export interface Service {

  init(services: SystemServices): void;
}
export namespace Service {

  export function isCore(service: any) {
    return service[CORE] === true;
  }

  export namespace Constructor {
    export type Map = { [key: string]: Constructor };
  }

  export interface Constructor {
    new (app: StoreFront, config: any): Service;
  }

  export type Map = { [key: string]: Service };

  export type Options<T> = Service.Constructor | T | false;
}

export default Service;
