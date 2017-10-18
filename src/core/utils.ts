import FluxCapacitor, { Actions, Store } from '@storefront/flux-capacitor';
import * as clone from 'clone';
import * as GbTracker from 'gb-tracker-client/slim';
import * as deepAssign from 'lodash.merge';
import * as log from 'loglevel';
import * as riot from 'riot';

export { clone, deepAssign, log, riot, GbTracker };

export const WINDOW = () => window;

export const dot = {
  get(obj: any, path: string, defaultValue?: any) {
    const dotIndex = path.indexOf('.');
    if (dotIndex === -1) {
      return path in obj ? obj[path] : defaultValue;
    }

    const key = path.substr(0, dotIndex);
    return key in obj ?
      dot.get(obj[key], path.substr(dotIndex + 1), defaultValue) :
      defaultValue;
  }
};

export function mapToSearchActions(values: string[], actions: typeof FluxCapacitor.prototype.actions) {
  return values.map((value) => ({ value, onClick: () => actions.search(value) }));
}

export const rayify = <T>(values: T | T[]): T[] => Array.isArray(values) ? values : [values];
