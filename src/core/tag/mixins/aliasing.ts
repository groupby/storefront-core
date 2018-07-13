import Tag from '..';
import * as utils from '../../utils';
import Phase from '../phase';
import TagUtils from '../utils';

export default function aliasingMixin(this: Tag) {
  Object.assign(this, {
    expose: (alias: string, value: any = this.state) => {
      const isPropsAlias = this.props === value;
      const isStateAlias = this.state === value;
      this._provides[alias] = (props: object, state: object) => () => {
        if (isPropsAlias) {
          return props;
        } else if (isStateAlias) {
          return state;
        } else {
          return value;
        }
      };
      if (this.isInitialized) {
        updateAliases(this);
      }
    },
    unexpose: () => null,
    updateAlias: (alias: string, value: any) => {
      this.expose(alias, value);
      updateAliases(this);
    },
  });

  this.one(Phase.INITIALIZE, () => {
    const { provides = {} } = Tag.getMeta(this);

    if (Object.keys(provides).length !== 0) {
      Object.assign(this._provides, provides);
    }
  });
  this.one(Phase.INITIALIZE, () => updateAliases(this));
  this.one(Phase.BEFORE_MOUNT, () => updateAliases(this));
  this.on(Phase.UPDATE, () => updateAliases(this));
  this.one(Phase.UNMOUNT, () => removeAliases(this));
}

export function updateAliases(tag: Tag) {
  const aliases = (tag._aliases = Tag.findAllAliases(tag));

  Object.assign(
    tag,
    Object.keys(aliases).reduce(
      (named, key) =>
        Object.assign(named, { [`$${key}`]: aliases[key].resolve() }),
      {}
    )
  );

  return aliases;
}

export function removeAliases(tag: Tag) {
  Object.keys(tag._aliases).forEach((key) => (tag[`$${tag}`] = null));
  tag._aliases = null;
}
