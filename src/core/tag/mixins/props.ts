import Tag from '..';
import Phase from '../phase';
import Props from '../props';

export default function propsMixin(this: Tag) {
  this.one(Phase.INITIALIZE, () => updateProps(this));
  this.on(Phase.UPDATE, () => updateProps(this));
}

export function updateProps(tag: Tag) {
  tag.props = Props.buildProps(tag, tag.opts);
}
