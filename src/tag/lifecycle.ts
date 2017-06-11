import { Events } from '@storefront/flux-capacitor';
import Tag from '.';
import Attribute from './attribute';

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

  export function onInitialize(this: Tag) {
    Lifecycle.addSugar(this);

    const meta = Tag.getMeta(this);
    meta.defaults = this.props;
    meta.attributes = Object.keys(this.props)
      .map((name) => Attribute.implyType({ default: this.props[name], name }));

    Lifecycle.onRecalculateProps.call(this);

    this.on(Phase.BEFORE_MOUNT, () => this.trigger(Phase.STATE_FINALIZED));
  }

  export function onBeforeMount(this: Tag) {
    this.root.classList[this.props.stylish ? 'add' : 'remove']('gb-stylish');
  }

  export function onRecalculateProps(this: Tag) {
    this.props = Tag.buildProps(this);
  }
}

export default Lifecycle;
