import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import Tag from '../core/tag';
import Lifecycle from '../core/tag/lifecycle';
import * as utils from '../core/utils';
import StoreFront from '../storefront';
import { TRACKER_EVENT } from './tracker';
import Phase = Lifecycle.Phase;

export const LIFECYCLE_COLOURS = {
  [Phase.INITIALIZE]: '#b39e43',
  [Phase.BEFORE_MOUNT]: '#c92da7',
  [Phase.MOUNT]: '#6217c1',
  [Phase.UPDATE]: '#2f74d0',
  [Phase.UPDATED]: '#42b121',
  [Phase.BEFORE_UNMOUNT]: '#da6e28',
  [Phase.UNMOUNT]: '#f04141'
};
export const ALIASING_COLOURS = {
  inherited: '#cd4f10',
  added: '#306895',
  updated: '#1378a3',
  removed: '#a11d10',
};

@core
class LoggingService extends BaseService<LoggingService.Options> {

  constructor(app: StoreFront, opts: LoggingService.Options) {
    super(app, opts);
    utils.log.setLevel(opts.level);
  }

  init() {
    const debugAll = this.opts.debug && typeof this.opts.debug !== 'object';
    const debug = <LoggingService.Debug>(this.opts.debug || {});

    this.app.log = utils.log;

    if (debugAll || debug.observer) {
      this.app.flux.on(Events.OBSERVER_NODE_CHANGED, this.logObserverNodeChange);
    }
    if (debugAll || debug.lifecycle) {
      this.app.flux.on(Events.TAG_LIFECYCLE, this.logTagLifecycle);
    }
    if (debugAll || debug.aliasing) {
      this.app.flux.on(Events.TAG_ALIASING, this.logAliasing);
    }
    if (debugAll || debug.tracker) {
      this.app.flux.on(TRACKER_EVENT, this.logTrackerEvent);
    }
  }

  logObserverNodeChange = ({ path, event, value }: { path: string, event: string, value: any }) => this.app.log.debug(
    `[event]: %c${event} %c${path}`,
    'color: darkgreen; font-weight: bold',
    'color: darkgreen',
    value
  )

  logTagLifecycle = ({ phase, tag }: { phase: string, tag: Tag }) => this.app.log.debug(
    `%c${phase}%c - %c${Tag.getMeta(tag).name || ''}`,
    `color: ${LIFECYCLE_COLOURS[phase]}; font-weight: bold`,
    '',
    'color: black; font-weight: bold; text-decoration: underline',
    tag
  )

  logTrackerEvent = ({ type, event }: { type: string, event: object }) => this.app.log.debug(
    `[tracker]: %c${type}`,
    'color: #75babe; font-weight: bold',
    event
  )

  // tslint:disable-next-line max-line-length
  logAliasing = ({ action, name, type, aliases }: { action: string, name: string, type: string, aliases: any }) => this.app.log.debug(
    `%c${action} ${type ? `'${type}' ` : ''}alias`,
    `color: ${ALIASING_COLOURS[action]}; font-weight: bold`,
    name,
    aliases
  )
}

namespace LoggingService {
  export interface Options {
    level?: string;
    debug?: boolean | Debug;
  }
  export interface Debug {
    lifecycle?: boolean;
    aliasing?: boolean;
    observer?: boolean;
    flux?: boolean;
    tracker?: boolean;
  }
}

export default LoggingService;
