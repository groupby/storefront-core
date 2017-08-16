import * as camelCase from 'lodash.camelcase';
import * as riot from 'riot';
import Tag, { TAG_DESC, TAG_META } from '.';
import StoreFront from '../../storefront';
import Lifecycle from './lifecycle';

namespace TagUtils {

  /**
   * tag initializer creator
   */
  export function initializer(clazz: any) {
    return function init(this: riot.TagInterface & { __proto__: any }) {

      TagUtils.inherit(this, clazz);

      const proto = this.__proto__;
      this.__proto__ = clazz.prototype; // fool the class constructor check
      clazz.call(this);
      this.__proto__ = proto;
    };
  }

  export function bindController(tag: Tag, clazz: Function) {
    TagUtils.initializer(clazz).call(tag);

    tag.trigger(Lifecycle.Phase.INITIALIZE);

    if (typeof tag.init === 'function') {
      tag.init();
    }
  }

  export function tagDescriptors(clazz: Function) {
    const { [TAG_DESC]: { metadata: { name }, view, css } } = clazz;
    return [name, view, css];
  }

  export function globalConfiguration(tag: Tag) {
    const metadata = Tag.getMeta(tag);
    return metadata.configurable ? tag.config.tags[camelCase(metadata.name.replace(/^gb-/, ''))] : {};
  }

  export function buildProps(tag: Tag) {
    const {
      ui: inheritedStyle = tag.config.options.ui,
      stylish: inheritedStylish = tag.config.options.stylish,
    } = tag.parent ? (<any>tag.parent).props : {};

    return {
      ui: inheritedStyle,
      stylish: inheritedStyle && inheritedStylish,
      ...Tag.getMeta(tag).defaults,
      ...TagUtils.globalConfiguration(tag),
      ...tag.opts.__proto__,
      ...tag.opts
    };
  }

  export function inherit(target: any, superclass: any) {
    if (superclass && superclass !== Object.getPrototypeOf(Object)) {
      TagUtils.inherit(target, Object.getPrototypeOf(superclass));

      Object.getOwnPropertyNames(superclass.prototype)
        .filter((name) => name !== 'constructor')
        // tslint:disable-next-line
        .forEach((name) => Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(superclass.prototype, name)));
    }
  }
}

export default TagUtils;
