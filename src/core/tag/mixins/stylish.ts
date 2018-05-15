import Tag from '..';
import Phase from '../phase';

export const STYLISH_CLASS = 'gb-stylish';
export const UI_CLASS = 'gb-ui';

export default function stylishMixin(this: Tag) {
  this.one(Phase.BEFORE_MOUNT, () => addStyles(this));
}

export function addStyles(tag: Tag) {
  if (tag.props.stylish) {
    tag.root.classList.add(STYLISH_CLASS);
  }
  if (tag.props.ui) {
    tag.root.classList.add(UI_CLASS);
  }
}
