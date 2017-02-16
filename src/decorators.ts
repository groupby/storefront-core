import { Configurable } from './types';

export const DEFAULTS = Symbol('defaults');
export const CONFIGURATION = Symbol('defaults');

export function defaults<T>(defaults: T) {
  return (target: { new (...args: any[]): Configurable<T> }) => { target[DEFAULTS] = defaults; };
}

export function config(...names: string[]) {
  return (target: { new (...args: any[]): any }) => { target[CONFIGURATION] = names; };
}
