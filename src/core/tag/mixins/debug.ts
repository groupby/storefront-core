import { Events } from '@storefront/flux-capacitor';
import Tag from '..';
import Phase from '../phase';

export const LOG_STYLE = 'font-weight: bold';

export default function debugMixin(this: Tag) {
  const tagName = `<${Tag.getName(this)}>`;
  let tagMessage = ['font-weight: bold', tagName];

  this.one(Phase.INITIALIZE, () => {
    this.log.info('%cinitializing %c%s', logStyle('#f1c91e'), ...tagMessage);
  });

  this.one(Phase.BEFORE_MOUNT, () => {
    const { _provides: aliases } = this;
    const consumes = Tag.findConsumes(this);
    const complexTagName = `<${Tag.getName(this)}${
      Object.keys(aliases).length === 0
        ? ''
        : ` (${Object.keys(aliases)
            .map((value) => `$${value}`)
            .join(', ')})`
    }${consumes.length === 0 ? '' : ` [${consumes.map((value) => `$${value}`).join(', ')}]`}>`;
    tagMessage = ['font-weight: bold', complexTagName];

    this.log.info('%cpreparing to mount %c%s', logStyle('#9467ef'), ...tagMessage);
  });
  this.one(Phase.MOUNT, () => {
    this.log.info('%cmounted %c%s', logStyle('#5f12c9'), ...tagMessage);
  });

  this.on(Phase.UPDATE, () => {
    this.log.info('%cpreparing to update %c%s', logStyle('#36c4ba'), ...tagMessage);
  });
  this.on(Phase.UPDATED, () => {
    this.log.info('%cupdated %c%s', logStyle('#24a320'), ...tagMessage);
  });

  this.one(Phase.BEFORE_UNMOUNT, () => {
    this.log.info('%cpreparing to unmount %c%s', logStyle('#dd6813'), ...tagMessage);
  });
  this.one(Phase.UNMOUNT, () => {
    this.log.info('%cremoved %c%s', logStyle('#ce1818'), ...tagMessage);
  });
}

export const logStyle = (color: string) => {
  return `color: ${color}; font-weight: bold`;
};
