import Tag from '..';
import * as utils from '../../utils';
import Phase from '../phase';
import TagUtils from '../utils';

export namespace ProvideConsume {
  export function provideConsumeMixin(this: Tag) {
    this.one(Phase.INITIALIZE, () => {
      const { provides = {} } = Tag.getMeta(this);

      if (Object.keys(provides).length !== 0) {
        Object.assign(this._provides, provides);
      }
    });
    this.one(Phase.BEFORE_MOUNT, () => {
      const aliases = ProvideConsume.updateAliases(this);

      if (aliases) {
        Object.keys(aliases).forEach((alias) => {
          let hasUpdated = false;
          const aliasTag = aliases[alias].tag;
          const markUpdated = () => hasUpdated = true;
          const resetUpdated = () => hasUpdated = false;
          const softUpdateDependant = () => {
            if (!hasUpdated) {
              this.set(true);
            }
            hasUpdated = false;
          };

          this.on(Phase.UPDATE, markUpdated);
          this.one(Phase.UNMOUNT, () => this.off(Phase.UPDATE, markUpdated));
          aliasTag.on(Phase.UPDATE, resetUpdated);
          aliasTag.on(Phase.UPDATED, softUpdateDependant);
          aliasTag.one(Phase.UNMOUNT, () => aliasTag.off(Phase.UPDATED, softUpdateDependant));
        });
      }
    });
    this.on(Phase.UPDATE, () => ProvideConsume.updateAliases(this));
    this.one(Phase.UNMOUNT, () => ProvideConsume.removeAliases(this));
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
        Object.keys(aliases).reduce(
          (named, key) =>
            Object.assign(named, { [`$${key}`]: aliases[key].resolve() }),
          {}
        )
      );

      return aliases;
    }
  }

  export function removeAliases(tag: Tag) {
    Tag.findConsumes(tag).forEach((key) => (tag[`$${key}`] = null));
  }
}

const mixin = ProvideConsume.provideConsumeMixin;
export default mixin;
