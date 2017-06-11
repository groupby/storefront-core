import FluxCapacitor, { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/decorators';
import LazyService from '../core/service/lazy';
import StoreFront from '../storefront';

@core
class AutocompleteService extends LazyService {

  lazyInit() {
    this.app.flux.on(Events.AUTOCOMPLETE_QUERY_UPDATED, this.updateSearchTerms);
    this.app.flux.on(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED, this.updateProducts);
  }

  updateSearchTerms = (query: string) =>
    this.app.flux.saytSuggestions(query)

  updateProducts = ({ suggestions: [suggestion] }: Store.Autocomplete) =>
    this.app.flux.saytProducts(suggestion)
}

export default AutocompleteService;
