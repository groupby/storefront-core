import { Events } from '@storefront/flux-capacitor';
import { core } from '../core/decorators';
import { BaseService } from '../core/service';
import StoreFront from '../storefront';

@core
class SearchService extends BaseService<SearchService.Options> {

  init() {
    this.app.flux.on(Events.SEARCH_CHANGED, this.fetchProducts);
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
