import * as deepAssign from 'deep-assign';
import * as log from 'loglevel';
import * as riot from 'riot';
import { ATTRS, CSS, VIEW } from './system';

export { deepAssign, log, riot };

export function register(r: any) {
  return function registerRiot(clazz: Function, name: string) {
    r.tag(name, clazz[VIEW], clazz[CSS], clazz[ATTRS], function init(opts: any) {
      inherit(this, clazz);

      clazz.call(this, opts);
    });
  };
}

export function inherit(target: any, superclass: any) {
  if (superclass && superclass !== Object.getPrototypeOf(Object)) {
    inherit(target, Object.getPrototypeOf(superclass));

    Object.getOwnPropertyNames(superclass.prototype)
      .filter((name) => name !== 'constructor')
      .map(((name) => ({ name, descriptor: Object.getOwnPropertyDescriptor(superclass.prototype, name) })))
      .forEach(({ name, descriptor }) => Object.defineProperty(target, name, descriptor));
  }
}
