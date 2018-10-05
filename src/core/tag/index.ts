import FluxCapacitor, { Actions, ActionCreators, Events, Store } from '@storefront/flux-capacitor';
import moize from 'moize';
import * as Riot from 'riot';
import { SystemServices } from '../../services';
import StoreFront from '../../storefront';
import Configuration from '../configuration';
import * as utils from '../utils';
import * as Mixins from './mixins';
import Phase from './phase';
import TagUtils from './utils';

export const TAG_META = Symbol.for('tag_metadata');
export const TAG_DESC = Symbol.for('tag_description');
export const ALIAS_DESCRIPTION = Symbol.for('alias_description');

class Tag<P extends object = any, S extends object = any, A extends object = any> {
  _provides: Record<string, ((props: P & Tag.Props, state: S, aliases: A) => void)> = {};
  _consumes: string[] = [];
  _eventHandlers: [string, () => void][] = [];
  isInitialized: boolean = false;
  props: P & Tag.Props = <any>{};
  state: S = <any>{};
  provide: (alias: string, resolve?: (p: any, s: any, a: any) => any) => void;
  getAllAliases: () => Record<string, any>;

  set(state: Partial<S> | true) {
    if (state === true) {
      this.update(state);
    } else {
      this.update({ state: { ...(this.state as any), ...(state as any) } });
    }
  }

  select(selector: (state: Store.State, ...args: any[]) => any, ...args: any[]) {
    return selector(this.flux.store.getState(), ...args);
  }

  dispatch(action: Actions.Action<string, any>) {
    this.flux.store.dispatch(action as any);
  }

  subscribe<T>(event: string, handler: (data?: T) => void) {
    this.flux.on(event, handler);
    if (this._eventHandlers.length === 0) {
      this.one(Phase.UNMOUNT, this._removeEventHandlers);
    }

    this._eventHandlers.push([event, handler as any]);
  }

  subscribeOnce(event: string, handler: (event: string, data?: any) => void) {
    this.flux.once(event, handler);
  }

  //provide(alias: string, resolve: (props: P, state: S, aliases: A) => any = (_, state) => state) {
  //  if (typeof resolve !== 'function') {
  //    throw new Error('must provide a callback function to calculate alias value');
  //  }

  //  this._provides[alias] = resolve;
  //}

  //consume(alias: string) {
  //  if (!this._consumes.includes(alias)) {
  //    this._consumes.push(alias);
  //  }
  //}

  _removeEventHandlers = () => this._eventHandlers.forEach(([event, handler]) => this.flux.off(event, handler));
}

interface Tag<P extends object, S extends object, A extends object>
  extends Riot.TagInterface,
    Tag.Lifecycle<P, S>,
    Tag.Mixin {
  _riot_id: number;
  root: HTMLElement;
  opts: P;
  actions: typeof ActionCreators;
  isMounted: boolean;
  aliases: object;
  init(): void;
  // legacy aliasing
  _aliases?: object; // tslint:disable-line member-ordering
  expose(alias: string, value?: any): void;
  unexpose(alias: string): void;
  updateAlias(alias: string, value: any): void;
  // end legacy aliasing
}

namespace Tag {
  export function create(_riot: any) {
    return (clazz: { new (): any }) =>
      _riot.tag(...TagUtils.tagDescriptors(clazz), function init() {
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

      init(this: Riot.TagInstance) {
//        console.log('DEBUG init');
        Mixins.applyMixin(this, Mixins.lifecycle);
        Mixins.applyMixin(this, Mixins.metadata);
        // aliasing mixin
        Mixins.applyMixin(this, Mixins.props);
        //Mixins.applyMixin(this, config.options.legacyAliasing ? Mixins.aliasing : Mixins.provideConsume);
//        console.log('DEBUG before Prototype aliasing');
        Mixins.applyMixin(this, Mixins.prototypeAliasing);
//        console.log('DEBUG after Prototype aliasing');
        Mixins.applyMixin(this, Mixins.Pure.pureMixin(config.options.legacyAliasing));

        // order of these ones shouldn't matter
        Mixins.applyMixin(this, Mixins.fluxActions);
        Mixins.applyMixin(this, Mixins.stylish);

        if (TagUtils.isDebug(config)) {
          Mixins.applyMixin(this, Mixins.logging);
          Mixins.applyMixin(this, Mixins.debug);
        }

        Mixins.applyMixin(this, Mixins.sugar);
        TagUtils.convertToMixin(Tag).call(this);
      },
    };
  }

  /**
   * extract tag metadata
   */
  export function getMeta(tag: Tag): Metadata {
    return tag[TAG_META] || {};
  }

  export function getName(tag: Tag): string {
    return (tag.root.dataset.is || tag.root.tagName).toLowerCase();
  }

  export function findConsumes(tag: Tag & { isConsumer?: boolean }): string[] {
    const allOpts = { ...tag.opts._props, ...tag.opts };

    return [
      ...(tag.parent ? TagUtils.findWrappingConsumes(tag.parent as Tag) : []),
      ...(Tag.getMeta(tag).consumes || []),
      ...(typeof allOpts._consumes === 'string' ? allOpts._consumes.split(',') : []),
      ...tag._consumes,
    ].filter((alias, index, self) => self.indexOf(alias) === index);
  }

  export function findAliases(
    tag: Tag,
    keys: string[] = Tag.findConsumes(tag)
  ): Record<string, { tag: Tag; resolve: () => any }> {
    const { _provides: provides, parent, props, state } = tag;
    const providesKeys = Object.keys(provides);

    let parentAliases = {};
    if (keys.length !== 0) {
      const unresolvedKeys = providesKeys.length === 0 ? keys : keys.filter((key) => !providesKeys.includes(key));
      parentAliases = parent && findAliases(parent as Tag, unresolvedKeys);
    }

    return {
      ...parentAliases,
      ...providesKeys
        .filter((key) => keys.includes(key))
        .reduce(
          (aliases, key) =>
            Object.assign(aliases, { [key]: { tag, resolve: () => provides[key](props, state, parentAliases) } }),
          {}
        ),
    };
  }

  export function findAllAliases(tag: Tag): Record<string, { tag: Tag; resolve: () => any }> {
    const { _provides: provides, parent } = tag;
    const providesKeys = Object.keys(provides);

    let parentAliases = {};
    if (parent) {
      parentAliases = parent._aliases;
    }

    const finalAliases = {
      ...parentAliases,
      ...providesKeys.reduce(
        (aliases, key) =>
          Object.assign(aliases, {
            [key]: {
              resolve: () => provides[key](tag.props, tag.state, parentAliases),
            },
          }),
        {}
      ),
    };

    return finalAliases;
  }

  export function getDescription(target: any): Description {
    return Tag.setDescription(target, target[TAG_DESC] || { metadata: {} });
  }

  export function setDescription(target: any, description: Description) {
    return (target[TAG_DESC] = description);
  }

  export interface Description {
    view: string;
    css?: string;
    metadata: Metadata;
  }

  export interface Metadata {
    name: string;
    defaults: object;
    provides?: Record<string, (props: any, state: any) => (aliases: any) => any>;
    consumes?: string[];
    origin?: string;
    configurable?: boolean;
  }

  export interface Props {
    ui?: boolean;
    stylish?: boolean;
    storeSection?: string;
  }

  export interface Event {
    preventUpdate: boolean;
  }

  export interface Lifecycle<P extends object, S extends object> {
    /**
     * aliases are available here
     */
    onBeforeMount(): void;
    onMount(): void;
    shouldUpdate(stateChange: { state: S }, nextOpts: P): boolean;
    onUpdate(stateChange?: { state: S }): void;
    onUpdated(): void;
    onBeforeUnmount(): void;
    onUnmount(): void;
  }

  export interface Mixin {
    config: Configuration;
    flux: FluxCapacitor;
    services: SystemServices;
    log: typeof utils.log;
    init: (this: Riot.TagInterface) => void;
  }

  export type Transform = object | string[] | ((obj: object) => object);
}

export default Tag;
