import Tag from '..';
import Phase from '../phase';
import buildProps from '../props';

export default function propsMixin(this: Tag) {
  this.one(Phase.INITIALIZE, () => updateProps(this));
  this.on(Phase.UPDATE, () => updateProps(this));
}

export function updateProps(tag: Tag) {
  tag.props = buildProps(tag, tag.opts);
}
