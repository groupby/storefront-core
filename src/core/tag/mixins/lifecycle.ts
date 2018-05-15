import Tag from '..';
import Phase from '../phase';

export default function lifecycleMixin(this: Tag) {
  this.one(Phase.BEFORE_MOUNT, () => runInitializePhase(this));
}

export function runInitializePhase(tag: Tag) {
  tag.trigger(Phase.INITIALIZE);
  tag.isInitialized = true;
}
