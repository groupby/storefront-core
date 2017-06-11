import FluxCapacitor, { Actions, ActionCreator, Events, Store } from '@storefront/flux-capacitor';
import { utils, Configuration } from '../core';
import { SystemServices } from '../services';
import StoreFront from '../storefront';
import Alias from './alias';
import Attribute from './attribute';
import Lifecycle from './lifecycle';
import Phase = Lifecycle.Phase;

export const TAG_META = Symbol.for('tag_metadata');
export const TAG_DESC = Symbol.for('tag_description');
export const ALIAS_DESCRIPTION = Symbol.for('alias_description');

class Tag<P extends Tag.Props = any, S extends object = any> {

  opts: P;
  props: P = <any>{};
  state: S = <any>{};
  aliasing: Alias = new Alias(this);

  constructor() {
    this.aliasing.attach();
    Lifecycle.attach(this);
  }

  set(state: Partial<S>) {
    this.update({ state: { ...<any>this.state, ...<any>state } });
  }

  dispatch(action: Tag.FluxAction) {
    this.flux.store.dispatch(<any>action);
  }

  expose(alias: string, value: any = this.state) {
    this.aliasing.expose(alias, value);
  }

  unexpose(alias: string) {
    this.aliasing.unexpose(alias);
  }

  updateAlias(alias: string, value: any) {
    this.aliasing.updateAlias(alias, value);
  }
}

// tslint:disable-next-line max-line-length
interface Tag<P extends Tag.Props, S extends object> extends utils.riot.TagInterface, Tag.Lifecycle, Tag.Mixin {
  _riot_id: number;
  root: HTMLElement;
  isMounted: boolean;
  init(): void;
}
namespace Tag {
  /**
   * tag initializer creator
   */
  export function initializer(clazz: any) {
    return function init(this: utils.riot.TagInterface & { __proto__: any }) {

      utils.inherit(this, clazz);

      const proto = this.__proto__;
      this.__proto__ = clazz.prototype; // fool the class constructor check
      clazz.call(this);
      this.__proto__ = proto;
    };
  }

  /**
   * create a tag mixin
   */
  export function mixin({ flux, config, services, log }: StoreFront): Mixin {
    return {
      flux,
      config,
      services,
      log,

      init: Tag.initializer(Tag)
    };
  }

  export function register(tag: Tag, clazz: Function) {
    Tag.initializer(clazz).call(tag);

    tag.trigger(Lifecycle.Phase.INITIALIZE);

    if (typeof tag.init === 'function') {
      tag.init();
    }
  }

  /**
   * extract default state from tag
   */
  export function getDefaults(tag: Tag) {
    return Tag.getMeta(tag).defaults || {};
  }

  export function getMeta(tag: Tag): Metadata {
    return tag[TAG_META] || {};
  }

  export function getDescription(target: any): Description {
    return target[TAG_DESC] = target[TAG_DESC] || {};
  }

  export function buildProps(tag: Tag) {
    return {
      stylish: tag.config.options.stylish,
      ...Tag.getDefaults(tag),
      ...tag.opts.__proto__,
      ...tag.opts
    };
  }

  export interface Description {
    name: string;
    view: string;
    css?: string;
    alias?: string;
    attributes?: Attribute[];
    defaults?: object;
  }

  export interface Metadata {
    name: string;
    defaults: object;
    alias?: string;
    attributes?: Attribute[];
  }

  export interface Props {
    stylish?: boolean;
  }

  export interface Event {
    preventUpdate: boolean;
  }

  export interface Lifecycle {
    /**
     * aliases are available here
     */
    onBeforeMount(): void;
    onMount(): void;
    onUpdate(state: any): void;
    onUpdated(): void;
    onBeforeUnmount(): void;
    onUnmount(): void;
  }

  export interface Mixin {
    config: Configuration;
    flux: FluxCapacitor;
    services: SystemServices;
    log: typeof utils.log;
    init: (this: utils.riot.TagInterface) => void;
  }

  export type FluxAction = Actions.Base
    | ((dispatch: (action: Actions.Base) => any, getStore: () => Store.State) => (any | void))
    | Promise<Actions.Base>;
}

export default Tag;
