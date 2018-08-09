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
  let prevProps: any = {};
  let prevState: any = {};

  const callHandler = (handlerName, ...args) => {
    if (typeof this[handlerName] === 'function') {
      this[handlerName](...args);
    }
  };

  SUGAR_EVENTS.forEach((phase) => {
    const name = camelCase(`on-${phase}`);

    switch (phase) {
      case Phase.BEFORE_MOUNT:
        this.one(
          phase,
          (...args) => {
            callHandler(name, ...args);
            prevProps = { ...this.props };
            prevState = { ...this.state };
          }
        );
        break;
      case Phase.UPDATE:
        this.on(
          phase,
          (...args) => callHandler(name, prevProps, prevState, ...args)
        );
        break;
      case Phase.UPDATED:
        this.on(
          phase,
          (...args) => {
            callHandler(name, prevProps, prevState, ...args);
            prevProps = { ...this.props };
            prevState = { ...this.state };
          }
        );
        break;
      default:
        this.one(
          phase,
          (...args) => callHandler(name, ...args)
        );
    }
  });
}
