import * as Riot from 'riot';
import aliasing from './aliasing';
import debug from './debug';
import fluxActions from './flux-actions';
import lifecycle from './lifecycle';
import logging from './logging';
import metadata from './metadata';
import props from './props';
import provideConsume from './provide-consume';
import prototypeAliasing from './prototype-aliasing';
import Pure from './pure';
import stylish from './stylish';
import sugar from './sugar';

export { aliasing, fluxActions, lifecycle, props, provideConsume, prototypeAliasing, Pure, stylish, sugar, logging, metadata, debug };

export function applyMixin(tag: Riot.TagInstance, mixin: () => void | object) {
  tag.mixin(typeof mixin === 'function' ? { init: mixin } : mixin);
}
