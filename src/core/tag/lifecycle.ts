import { Events } from '@storefront/flux-capacitor';
import Tag from '.';
import { dot } from '../utils';
import Attribute from './attribute';
import TagUtils from './utils';

export const STYLISH_CLASS = 'gb-stylish';
export const UI_CLASS = 'gb-ui';

namespace Lifecycle {
  export namespace Phase {
    export const INITIALIZE = 'initialize';
    export const BEFORE_MOUNT = 'before-mount';
    export const STATE_FINALIZED = 'state-finalized';
    export const MOUNT = 'mount';
    export const RECALCULATE_PROPS = 'recalculate-props';
    export const UPDATE = 'update';
    export const UPDATED = 'updated';
    export const PROPS_UPDATED = 'props-updated';
    export const BEFORE_UNMOUNT = 'before-unmount';
    export const UNMOUNT = 'unmount';
  }

  export const HANDLER_NAMES = {
    [Phase.BEFORE_MOUNT]: 'onBeforeMount',
    [Phase.MOUNT]: 'onMount',
    [Phase.UPDATE]: 'onUpdate',
    [Phase.UPDATED]: 'onUpdated',
    [Phase.BEFORE_UNMOUNT]: 'onBeforeUnmount',
    [Phase.UNMOUNT]: 'onUnmount'
  };
  export const LOG_PHASES = [
    Phase.INITIALIZE,
    Phase.BEFORE_MOUNT,
    Phase.MOUNT,
    Phase.UPDATE,
    Phase.UPDATED,
    Phase.BEFORE_UNMOUNT,
    Phase.UNMOUNT
  ];

  export function attach(tag: Tag) {
    tag.on(Phase.INITIALIZE, Lifecycle.onInitialize);
    tag.on(Phase.BEFORE_MOUNT, Lifecycle.onBeforeMount);
    tag.on(Phase.RECALCULATE_PROPS, Lifecycle.onRecalculateProps);

    Lifecycle.watch(tag);
  }

  export function watch(tag: Tag) {
    LOG_PHASES.forEach((phase) =>
      tag.on(phase, (data) => tag.flux.emit(Events.TAG_LIFECYCLE, { phase, tag })));
  }

  export function addSugar(tag: Tag) {
    Object.keys(HANDLER_NAMES)
      .forEach((phase) => {
        const name = HANDLER_NAMES[phase];
        const handler = tag[name];

        if (typeof handler === 'function') {
          tag.on(phase, handler);
        }
      });
  }

  export function addMetadata(tag: Tag) {
    const metadata = Tag.getMeta(tag);
    Object.assign(
      metadata,
      {
        origin: tag.parent && Tag.getMeta(<any>tag.parent).origin,
        ...metadata,
        defaults: tag.props,
        attributes: Object.keys(tag.props)
          .map((name) => Attribute.implyType({ default: tag.props[name], name }))
      }
    );
  }

  export function primeTagActions(tag: Tag) {
    const { name, origin } = Tag.getMeta(tag);
    const primed = tag.flux.__rawActions(() => ({ tag: { name, origin, id: tag._riot_id } }));
    tag.actions = <any>Object.keys(primed)
      .reduce((actions, key) => {
        actions[key] = (...args) => tag.flux.store.dispatch(primed[key](...args));
        return actions;
      }, {});
  }

  export function onInitialize(this: Tag) {
    Lifecycle.addSugar(this);
    Lifecycle.addMetadata(this);
    Lifecycle.primeTagActions(this);

    Lifecycle.onRecalculateProps.call(this);

    this.on(Phase.BEFORE_MOUNT, () => this.trigger(Phase.STATE_FINALIZED));
  }

  export function onBeforeMount(this: Tag) {
    if (this.props.stylish) {
      this.root.classList.add(STYLISH_CLASS);
    }
    if (this.props.ui) {
      this.root.classList.add(UI_CLASS);
    }
  }

  export function onRecalculateProps(this: Tag) {
    const props = this.props = TagUtils.buildProps(this);

    const { transform } = Tag.getMeta(this);
    if (transform) {
      this.state = { ...this.state, ...Lifecycle.transformProps(props, transform) };
    }
  }

  export function transformProps(props: any, transform: Tag.Transform) {
    if (Array.isArray(transform)) {
      return transform.reduce((transformed, prop) => Object.assign(transformed, { [prop]: props[prop] }), {});
    } else if (typeof transform === 'object') {
      return Object.keys(transform)
        .reduce((transformed, key) => Object.assign(transformed, { [transform[key]]: dot.get(props, key) }), {});
    } else if (typeof transform === 'function') {
      return transform(props);
    } else {
      return {};
    }
  }
}

export default Lifecycle;
