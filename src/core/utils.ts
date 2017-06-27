import FluxCapacitor, { Store } from '@storefront/flux-capacitor';
import * as deepAssign from 'deep-assign';
// import * as dot from 'dot-prop';
import * as log from 'loglevel';
import * as riot from 'riot';
import Tag, { TAG_DESC, TAG_META } from '../tag';

export { deepAssign, log, riot };

export const WINDOW = {
  addEventListener: (event, cb) => window.addEventListener(event, cb),
  Image: () => new Image(),
  document: () => window.document,
  location: () => window.location,
  history: () => window.history
};

export const dot = {
  get(obj: any, path: string, defaultValue?: any) {
    const dotIndex = path.indexOf('.');
    if (dotIndex === -1) {
      return path in obj ? obj[path] : defaultValue;
    }

    const key = path.substr(0, dotIndex);
    return key in obj ?
      dot.get(obj[key], path.substr(dotIndex + 1), defaultValue) :
      defaultValue;
  }
};

export function register(_riot: any) {
  return (clazz: Function) => _riot.tag(...exports.readClassDecorators(clazz), function init() {
    this[TAG_META] = exports.readClassMeta(clazz);
    Tag.register(this, clazz);
  });
}

export function readClassMeta(clazz: Function): Tag.Metadata {
  const { [TAG_DESC]: { name, defaults, alias, attributes } } = clazz;
  return { name, defaults, alias, attributes };
}

export function readClassDecorators(clazz: Function) {
  const { [TAG_DESC]: { name, view, css } } = clazz;
  return [name, view, css];
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

export function mapToSearchActions(links: Store.Linkable[], flux: FluxCapacitor) {
  return links.map((link) => ({ ...link, onClick: () => flux.search(link.value) }));
}

export const rayify = <T>(values: T | T[]): T[] => Array.isArray(values) ? values : [values];
