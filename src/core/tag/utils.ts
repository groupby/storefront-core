import { Actions, Configuration, StoreSections } from '@storefront/flux-capacitor';
import moize from 'moize';
import * as Riot from 'riot';
import Tag, { TAG_DESC, TAG_META } from '.';
import StoreFront from '../../storefront';
import { camelCase, dot } from '../utils';
import Phase from './phase';

namespace TagUtils {
  /**
   * tag initializer creator
   */
  export function convertToMixin(clazz: { new (): any }) {
    return function initClassMixin(this: Riot.TagInterface & { __proto__: any }) {
      TagUtils.inherit(this, clazz);

      const proto = this.__proto__;
      this.__proto__ = clazz.prototype; // fool the class constructor check
      clazz.call(this);
      this.__proto__ = proto;
    };
  }

  export function bindController(tag: Tag, clazz: { new (): any }) {
    TagUtils.convertToMixin(clazz).call(tag);

    if (typeof tag.init === 'function') {
      tag.one(Phase.INITIALIZE, () => tag.init());
    }
  }

  export function tagDescriptors(clazz: any) {
    const {
      [TAG_DESC]: {
        metadata: { name },
        view,
        css,
      },
    } = clazz;
    return [name, view, css];
  }

  export function inherit(target: any, superclass: any) {
    if (superclass && superclass !== Object.getPrototypeOf(Object)) {
      TagUtils.inherit(target, Object.getPrototypeOf(superclass));

      Object.getOwnPropertyNames(superclass.prototype)
        .filter((name) => name !== 'constructor')
        .forEach((name) =>
          Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(superclass.prototype, name))
        );
    }
  }

  export function setMetadata(target: any, key: keyof Tag.Metadata, value: any) {
    const { metadata, ...description } = Tag.getDescription(target);
    Tag.setDescription(target, {
      ...description,
      metadata: { ...metadata, [key]: value },
    });
  }

  export function getMetadata(target: any, key: keyof Tag.Metadata) {
    return Tag.getDescription(target).metadata[key];
  }

  export function findWrappingConsumes(tag: Tag & { isConsumer?: boolean }): string[] {
    return tag.isConsumer
      ? [
          ...(tag.parent ? findWrappingConsumes(tag.parent as Tag) : []),
          ...(tag.props.alias
            ? [tag.props.alias]
            : typeof tag.props.aliases === 'string'
              ? tag.props.aliases.split(',')
              : []),
        ]
      : [];
  }

  export const isDebug = moize(
    (config: Configuration) =>
      dot.get(config, 'services.logging.debug.lifecycle') || dot.get(config, 'services.logging.debug') === true
  );
}

export default TagUtils;
