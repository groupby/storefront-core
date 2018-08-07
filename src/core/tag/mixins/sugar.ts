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
  SUGAR_EVENTS.filter(
    (phase) => phase !== Phase.UPDATE && phase !== Phase.UPDATED
  ).forEach((phase) => {
    const name = camelCase(`on-${phase}`);

    this.one(
      phase,
      (...args) => typeof this[name] === 'function' && this[name](...args)
    );
  });

  [Phase.UPDATE, Phase.UPDATED].forEach((phase) => {
    const name = camelCase(`on-${phase}`);
    this.on(
      phase,
      (() => {
        let prevProps = this.props;
        let prevState = this.state;
        return (...args) => {
          if (typeof this[name] === 'function') {
            this[name](prevProps, prevState, ...args);
          }
          prevProps = this.props;
          prevState = this.state;
        };
      })()
    );
  });
}
