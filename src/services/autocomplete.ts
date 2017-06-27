import FluxCapacitor, { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/service';
import LazyService from '../core/service/lazy';
import Tag from '../core/tag';
import StoreFront from '../storefront';

@core
class AutocompleteService extends LazyService {

  registeredProductTags: Tag[] = [];
  registeredAutocompleteTags: AutocompleteTag[] = [];

  lazyInit() {
    this.app.flux.on(Events.AUTOCOMPLETE_QUERY_UPDATED, this.updateSearchTerms);
  }

  lazyInitProducts() {
    this.app.flux.on(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED, this.updateProducts);
  }

  registerAutocomplete(tag: AutocompleteTag) {
    this.registeredAutocompleteTags.push(tag);
  }

  registerProducts(tag: Tag) {
    if (this.registeredProductTags.push(tag) === 1) {
      this.lazyInitProducts();
    }
  }

  hasActiveSuggestion() {
    return this.registeredAutocompleteTags.some((tag) => tag.isActive());
  }

  updateSearchTerms = (query: string) =>
    this.app.flux.saytSuggestions(query)

  updateProducts = ({ suggestions: [suggestion] }: Store.Autocomplete) =>
    this.app.flux.saytProducts(suggestion)
}

export default AutocompleteService;

export interface AutocompleteTag extends Tag {
  isActive(): boolean;
}
