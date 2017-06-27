import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

@core
class SearchService extends BaseService<SearchService.Options> {

  constructor(app: StoreFront, opts: any) {
    super(app, opts);
    this.app.flux.on(Events.SEARCH_CHANGED, this.fetchProducts);
  }

  init() {
    // no-op
  }

  fetchProducts = () => {
    this.app.flux.emit('sayt:hide');
    this.app.flux.products();
  }
}

namespace SearchService {
  export interface Options { }
}

export default SearchService;
