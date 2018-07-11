import { StoreSections } from '@storefront/flux-capacitor';
import Tag from '.';
import { camelCase } from '../utils';

namespace Props {
  export interface RawOpts {
    dataIs?: string;
    _props?: object;
    _consumes?: string;
    __proto__?: object;
  }

  export function buildProps(tag: Tag, rawOpts: Props.RawOpts) {
    const { dataIs, _props: props, _consumes, ...opts } = rawOpts;
    const {
      ui: inheritedStyle = tag.config.options.ui,
      stylish: inheritedStylish = tag.config.options.stylish,
      storeSection: inheritedStoreSection = StoreSections.DEFAULT,
    } = tag.parent ? (tag.parent as Tag).props : {};

    return {
      ...Props.filterNullUndefined({
        ui: inheritedStyle,
        stylish: inheritedStyle && inheritedStylish,
        storeSection: tag.opts.storeSection || inheritedStoreSection,
      }),
      ...Props.filterNullUndefined(Tag.getMeta(tag).defaults),
      ...Props.filterNullUndefined(Props.globalConfiguration(tag)),
      ...Props.filterNullUndefined(props),
      ...Props.filterNullUndefined(rawOpts.__proto__),
      ...Props.filterNullUndefined(opts),
    };
  }

  export function globalConfiguration(tag: Tag) {
    const metadata = Tag.getMeta(tag);
    return metadata.configurable ? tag.config.tags[camelCase(metadata.name.replace(/^gb-/, ''))] : {};
  }

  export function filterNullUndefined(obj: object = {}) {
    return Object.keys(obj).reduce(
      (formatted, key) => (obj[key] == null ? formatted : Object.assign(formatted, { [key]: obj[key] })),
      {}
    );
  }
}

export default Props;
