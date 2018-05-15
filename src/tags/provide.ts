import Tag from '../core/tag';
import { tag } from '../core/tag/decorators';

@tag('provide', '')
class Provider extends Tag<Provider.Props> {
  init() {
    const { as } = this.props;

    if (!as) {
      throw new Error('must provide an alias name to register a provider');
    }

    this.provide(as, simpleResolve);
  }
}

namespace Provider {
  export interface Props {
    as: string;
    data: any;
  }
}

export default Provider;

export function simpleResolve({ data }: Provider.Props) {
  return data;
}
