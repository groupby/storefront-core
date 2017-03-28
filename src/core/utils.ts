import * as deepAssign from 'deep-assign';
import * as log from 'loglevel';
import * as riot from 'riot';
import Tag, { ATTRS, CSS, NAME, VIEW } from '../tag';

export { deepAssign, log, riot };

export function register(r: any) {
  return function registerRiot(clazz: Function) {
    r.tag(clazz[NAME], clazz[VIEW], clazz[CSS], clazz[ATTRS], Tag.initializer(clazz));
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

export const rayify = <T>(values: T | T[]): T[] => Array.isArray(values) ? values : [values];
