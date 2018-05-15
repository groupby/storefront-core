import Tag from '..';
import * as utils from '../../utils';
import Phase from '../phase';
import TagUtils from '../utils';

export default function aliasingMixin(this: Tag) {
  this.one(Phase.INITIALIZE, () => {
    const { provides = {} } = Tag.getMeta(this);

    if (Object.keys(provides).length !== 0) {
      Object.assign(this._provides, provides);
    }
  });
  this.one(Phase.BEFORE_MOUNT, () => {
    const aliases = updateAliases(this);

    if (aliases) {
      Object.keys(aliases).forEach((alias) => {
        const aliasTag = aliases[alias].tag;
        const softUpdateDependant = () => this.set({});

        aliasTag.on(Phase.UPDATED, softUpdateDependant);
        aliasTag.one(Phase.UNMOUNT, () => aliasTag.off(Phase.UPDATE, softUpdateDependant));
      });
    }
  });
  this.on(Phase.UPDATE, () => updateAliases(this));
  this.one(Phase.UNMOUNT, () => removeAliases(this));
}

export function updateAliases(tag: Tag) {
  const consumes = Tag.findConsumes(tag);

  if (consumes.length !== 0) {
    const aliases = Tag.findAliases(tag);
    if (TagUtils.isDebug(tag.config)) {
      tag.log.info(
        '%cfound alias dependencies in %c%s: %o',
        'color: grey; font-weight: bold',
        'font-weight: bold',
        `<${Tag.getName(tag)}>`,
        consumes
      );
    }

    Object.assign(
      tag,
      Object.keys(aliases).reduce((named, key) => Object.assign(named, { [`$${key}`]: aliases[key].value }), {})
    );

    return aliases;
  }
}

export function removeAliases(tag: Tag) {
  Tag.findConsumes(tag).forEach((key) => (tag[`$${tag}`] = null));
}
