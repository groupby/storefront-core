import Tag from '..';
import { camelCase } from '../../utils';
import Phase from '../phase';

export default function metadataMixin(this: Tag) {
  this.one(Phase.INITIALIZE, () => addMetadata(this));
}

export function addMetadata(tag: Tag) {
  const metadata = Tag.getMeta(tag);
  Object.assign(metadata, {
    origin: tag.parent && Tag.getMeta(tag.parent as any).origin,
    ...metadata,
    defaults: tag.props,
  });
}
