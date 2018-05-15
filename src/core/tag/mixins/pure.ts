import Tag from '..';
import * as utils from '../../utils';
import Phase from '../phase';
import buildProps from '../props';
import TagUtils from '../utils';

export const RE_RENDER_MESSAGE = '%ctag is preparing to re-render:';

export default function pureMixin(this: Tag) {
  this.shouldUpdate = shouldUpdate(this);
}

export function shouldUpdate(tag: Tag) {
  let prevState = null;
  let prevProps = null;
  let prevAliases = null;
  const updatePrev = () => {
    prevState = tag.state;
    prevProps = tag.props;
    prevAliases = extractLocalAliases(tag);
  };

  tag.one(Phase.MOUNT, updatePrev);
  tag.on(Phase.UPDATED, updatePrev);

  return (stateChange: object, nextOpts: object) => {
    const nextProps = buildProps(tag, nextOpts);
    const nextState = stateChange != null ? { ...tag.state, ...stateChange['state'] } : tag.state;
    const nextAliases = resolveAliases(tag);
    const propsUpdated = !shallowEquals(prevProps, nextProps);
    const stateUpdated = !shallowEquals(prevState, nextState);
    const aliasesUpdated = !shallowEquals(prevAliases, nextAliases);

    if (aliasesUpdated || stateUpdated || propsUpdated) {
      if (TagUtils.isDebug(tag.config)) {
        let message = RE_RENDER_MESSAGE;
        console.dirxml(tag.root);
        switch (true) {
          case aliasesUpdated:
            message += ' %can alias dependency was updated';
            break;
          case stateUpdated && stateChange == null:
            message += ' %can update was forced';
            break;
          case stateUpdated && stateChange != null:
            message += ' %ca state change occurred';
            break;
          case propsUpdated:
            message += ' %cit received new props';
            break;
        }

        tag.log.info(message, 'color: #65ad39', 'color: #65ad39; font-weight: bold');

        if (aliasesUpdated) {
          logDiff(tag.log.info, 'aliases', prevAliases, nextAliases);
        }

        if (propsUpdated) {
          logDiff(tag.log.info, 'props', prevProps, nextProps);
        }

        if (stateUpdated) {
          logDiff(tag.log.info, 'state', prevState, nextState);
        }
      }

      return true;
    }

    return false;
  };
}

export function stringify(value: any) {
  return JSON.stringify(value, null, 2);
}

export function logDiff(logger: (...message: string[]) => void, name: string, original: object, updated: object) {
  const originalKeys = Object.keys(original);
  const updatedKeys = Object.keys(updated);

  const addedKeys = updatedKeys.filter((key) => !(key in original));
  const removedKeys = originalKeys.filter((key) => !(key in updated));
  const changedKeys = originalKeys.filter((key) => key in updated && original[key] !== updated[key]);
  const unchangedKeys = originalKeys.filter((key) => key in updated && original[key] === updated[key]);
  const legend = [];
  const legendArgs = [];
  const messages = [];
  const args = [];
  let message = '';

  if (unchangedKeys.length > 0) {
    legend.push('%c%s ');
    legendArgs.push('font-weight: bold', 'unchanged');
    messages.push([stringify(composeObject(unchangedKeys, original)).slice(2, -1)]);
  }
  if (addedKeys.length > 0) {
    legend.push('%c%s ');
    legendArgs.push('font-weight: bold; color: green', 'added');
    messages.push(['%c%s', 'color: green', stringify(composeObject(addedKeys, updated)).slice(2, -1)]);
  }
  if (removedKeys.length > 0) {
    legend.push('%c%s ');
    legendArgs.push('font-weight: bold; color: red', 'removed');
    messages.push(['%c%s', 'color: red', stringify(composeObject(removedKeys, updated)).slice(2, -1)]);
  }
  if (changedKeys.length > 0) {
    legend.push('%c%s / %c%s');
    legendArgs.push(
      'font-weight: bold; color: orange',
      'changed (old)',
      'font-weight: bold; color: blue',
      'changed (new)'
    );
    messages.push(['%c%s', 'color: orange', stringify(composeObject(changedKeys, original)).slice(2, -1)]);
    messages.push(['%c%s', 'color: blue', stringify(composeObject(changedKeys, updated)).slice(2, -1)]);
  }
  console.group(`${name} diff`);
  logger(legend.join(''), ...legendArgs);
  logger('{');
  messages.forEach((messageArgs) => logger(...messageArgs));
  logger('}');
  console.groupEnd();
}

export function shallowEquals(rawLhs: object, rawRhs: object) {
  const lhs = rawLhs || {};
  const rhs = rawRhs || {};
  const lhsKeys = Object.keys(lhs);
  const rhsKeys = Object.keys(rhs);

  return (
    lhs === rhs || (lhsKeys.length === rhsKeys.length && lhsKeys.every((key) => key in rhs && lhs[key] === rhs[key]))
  );
}

export function objectDiff(original: object, updated: object) {
  return Object.keys(original)
    .filter((key) => !(key in updated))
    .reduce((removed, key) => Object.assign(removed, { [key]: original[key] }), {});
}

export function composeObject(keys: string[], obj: object) {
  return keys.reduce((composed, key) => Object.assign(composed, { [key]: obj[key] }), {});
}

export function extractLocalAliases(tag: Tag) {
  return Tag.findConsumes(tag).reduce((aliases, key) => {
    const aliasName = `$${key}`;
    return aliasName in tag ? Object.assign(aliases, { [aliasName]: tag[aliasName] }) : aliases;
  }, {});
}

export function resolveAliases(tag: Tag) {
  const aliases = Tag.findAliases(tag);
  return Object.keys(aliases).reduce(
    (resolved, key) => Object.assign(resolved, { [`$${key}`]: aliases[key].value }),
    {}
  );
}
