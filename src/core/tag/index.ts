import FluxCapacitor, { Actions, ActionCreators, Events, Store } from '@storefront/flux-capacitor';
import { SystemServices } from '../../services';
import StoreFront from '../../storefront';
import Configuration from '../configuration';
import { log, riot } from '../utils';
import Alias from './alias';
import Attribute from './attribute';
import Lifecycle from './lifecycle';
import TagUtils from './utils';

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

  select(selector: (state: Store.State, ...args: any[]) => any, ...args: any[]) {
    return selector(this.flux.store.getState(), ...args);
  }

  dispatch(action: Actions.Action<string, any>) {
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
interface Tag<P extends Tag.Props, S extends object> extends riot.TagInterface, Tag.Lifecycle, Tag.Mixin {
  _riot_id: number;
  root: HTMLElement;
  isMounted: boolean;
  actions: typeof ActionCreators;
  init(): void;
}
namespace Tag {

  export function create(_riot: any) {
    return (clazz: Function) => _riot.tag(...TagUtils.tagDescriptors(clazz), function init() {
      this[TAG_META] = { ...Tag.getDescription(clazz).metadata };
      TagUtils.bindController(this, clazz);
    });
  }

  /**
   * create a tag mixin
   */
  export function mixin({ flux, config, services, log }: StoreFront): Tag.Mixin {
    return {
      flux,
      config,
      services,
      log,

      init: TagUtils.initializer(Tag)
    };
  }

  /**
   * extract tag metadata
   */
  export function getMeta(tag: Tag): Metadata {
    return tag[TAG_META] || {};
  }

  export function getDescription(target: any): Description {
    return Tag.setDescription(target, target[TAG_DESC] || { metadata: {} });
  }

  export function setDescription(target: any, description: Description) {
    return target[TAG_DESC] = description;
  }

  export interface Description {
    view: string;
    css?: string;
    metadata: Metadata;
  }

  export interface Metadata {
    name: string;
    defaults: object;
    alias?: string;
    origin?: string;
    configurable?: boolean;
    transform?: Transform;
    attributes?: Attribute[];
  }

  export interface Props {
    ui?: boolean;
    stylish?: boolean;
    storeSection?: string;
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
    log: typeof log;
    init: (this: riot.TagInterface) => void;
  }

  export type Transform = object | string[] | ((obj: object) => object);
}

export default Tag;
