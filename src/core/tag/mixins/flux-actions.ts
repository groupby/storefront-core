import { Actions, ActionCreators } from '@storefront/flux-capacitor';
import moize from 'moize';
import Tag from '..';
import Phase from '../phase';
import utils from '../utils';
import * as FluxActionsMixin from './flux-actions';

export const STYLISH_CLASS = 'gb-stylish';
export const UI_CLASS = 'gb-ui';

export default function fluxActionsMixin(this: Tag) {
  this.one(Phase.INITIALIZE, () => addActions(this));
}

export function addActions(tag: Tag) {
  Object.defineProperty(tag, 'actions', {
    configurable: true,
    get: moize(() => primeTagActions(tag)),
  });
}

export function primeTagActions(tag: Tag) {
  const { name, origin } = Tag.getMeta(tag);
  return FluxActionsMixin.wrapActionCreators(
    ActionCreators as any,
    {
      tag: { name, origin, id: tag._riot_id },
    },
    (action) => tag.flux.store.dispatch(action)
  ) as any;
}

export function wrapActionCreators(
  actionCreators: { [key: string]: Actions.ActionCreator },
  metadata: object,
  dispatch: (action: any) => any
) {
  return Object.keys(actionCreators).reduce(
    (creators, key) =>
      Object.assign(creators, {
        [key]: FluxActionsMixin.wrapActionCreator(actionCreators[key], metadata, dispatch),
      }),
    {}
  );
}

export function wrapActionCreator(
  actionCreator: Actions.ActionCreator,
  metadata: object,
  dispatch: (action: any) => any
) {
  return (...args) => dispatch(FluxActionsMixin.augmentAction(actionCreator(...args), metadata));
}

export function augmentAction(action: Actions.Action | Actions.Action[] | Actions.Thunk<any>, metadata: object) {
  switch (true) {
    case typeof action === 'function':
      return FluxActionsMixin.wrapThunk(action as Actions.Thunk<any>, metadata);
    case Array.isArray(action):
      return (action as Actions.Action[]).map((subAction) => FluxActionsMixin.augmentMeta(subAction, metadata));
    case action && typeof action === 'object':
      return FluxActionsMixin.augmentMeta(action as Actions.Action, metadata);
    default:
      return action;
  }
}

export function wrapThunk(thunk: Actions.Thunk<any>, metadata: object) {
  return (getState) => FluxActionsMixin.augmentAction(thunk(getState), metadata);
}

export function augmentMeta(action: Actions.Action, metadata: object) {
  return { ...action, meta: { ...action.meta, ...metadata } };
}
