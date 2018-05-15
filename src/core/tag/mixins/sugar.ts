import Tag from '..';
import { camelCase } from '../../utils';
import Phase from '../phase';

export const SUGAR_EVENTS = [
  Phase.BEFORE_MOUNT,
  Phase.MOUNT,
  Phase.UPDATE,
  Phase.UPDATED,
  Phase.BEFORE_UNMOUNT,
  Phase.UNMOUNT,
];

export default function sugarMixin(this: Tag) {
  SUGAR_EVENTS.forEach((phase) => {
    const name = camelCase(`on-${phase}`);

    this[phase === Phase.UPDATE || phase === Phase.UPDATED ? 'on' : 'one'](
      phase,
      (...args) => typeof this[name] === 'function' && this[name](...args)
    );
  });
}
