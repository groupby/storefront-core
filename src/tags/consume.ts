import Tag from '../core/tag';
import { tag } from '../core/tag/decorators';

@tag('consume', '')
class Consumer {
  isConsumer: boolean = true;

  init() {
    if (!this.props.alias && (!this.props.aliases || this.props.aliases.length === 0)) {
      throw new Error('must provide alias name in order to register consumer');
    }
  }
}

interface Consumer extends Tag<Consumer.Props> {}

namespace Consumer {
  export interface Props {
    alias?: string;
    aliases?: string[];
  }
}

export default Consumer;
