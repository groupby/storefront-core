import { Actions } from '@storefront/flux-capacitor';
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

  export function setMetadata(target: any, key: string, value: any) {
    const description = Tag.getDescription(target);
    Tag.setDescription(target, {
      ...description,
      metadata: { ...description.metadata, [key]: value }
    });
  }

  // tslint:disable-next-line max-line-length
  export function wrapActionCreators(actionCreators: { [key: string]: Actions.ActionCreator }, metadata: object, dispatch: (action: any) => any) {
    return Object.keys(actionCreators)
      .reduce((creators, key) => Object.assign(creators, {
        [key]: TagUtils.wrapActionCreator(actionCreators[key], metadata, dispatch)
      }), {});
  }

  // tslint:disable-next-line max-line-length
  export function wrapActionCreator(actionCreator: Actions.ActionCreator, metadata: object, dispatch: (action: any) => any) {
    return (...args) => dispatch(TagUtils.augmentAction(actionCreator(...args), metadata));
  }

  // tslint:disable-next-line max-line-length
  export function augmentAction(action: Actions.Action | Actions.Action[] | Actions.Thunk<any>, metadata: object) {
    if (typeof action === 'function') {
      return TagUtils.wrapThunk(action, metadata);
    } else if (Array.isArray(action)) {
      return action.map((subAction) => TagUtils.augmentMeta(subAction, metadata));
    } else if (action && typeof action === 'object') {
      return TagUtils.augmentMeta(action, metadata);
    } else {
      return action;
    }
  }

  // tslint:disable-next-line max-line-length
  export function wrapThunk(thunk: Actions.Thunk<any>, metadata: object) {
    return (getState) => TagUtils.augmentAction(thunk(getState), metadata);
  }

  export function augmentMeta(action: Actions.Action, metadata: object) {
    return { ...action, meta: { ...action.meta, ...metadata } };
  }
}

export default TagUtils;
