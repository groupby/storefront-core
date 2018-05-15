import { Events } from '@storefront/flux-capacitor';
import Tag from '..';
import Phase from '../phase';

export const LOG_PHASES = [
  Phase.INITIALIZE,
  Phase.BEFORE_MOUNT,
  Phase.MOUNT,
  Phase.UPDATE,
  Phase.UPDATED,
  Phase.BEFORE_UNMOUNT,
  Phase.UNMOUNT,
];

export default function loggingMixin(this: Tag) {
  LOG_PHASES.forEach((phase) => this.on(phase, (data) => this.flux.emit(Events.TAG_LIFECYCLE, { phase, tag: this })));
}
