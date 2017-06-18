import { Events } from '@storefront/flux-capacitor';
import { BaseService } from '../../../src/core/service';
import Service from '../../../src/services/autocomplete';
import * as autocompleteService from '../../../src/services/autocomplete';
import suite from '../_suite';

suite('Autocomplete Service', ({ expect, spy }) => {
  let service: Service;

  beforeEach(() => service = new Service(<any>{}, <any>{}));

  it('should extend BaseService', () => {
    expect(service).to.be.an.instanceOf(BaseService);
  });

  describe('lazyInit()', () => {
    it('should listen for AUTOCOMPLETE_QUERY_UPDATED event', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };

      service.lazyInit();

      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED, service.updateSearchTerms);
    });
  });

  describe('lazyInitProducts()', () => {
    it('should listen for AUTOCOMPLETE_SUGGESTIONS_UPDATED event', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };

      service.lazyInitProducts();

      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED, service.updateProducts);
    });
  });

  describe('registerAutocomplete()', () => {
    it('should add tag to registeredAutocompleteTags', () => {
      const tag: any = { a: 'b' };

      service.registerAutocomplete(tag);

      expect(service.registeredAutocompleteTags).to.eql([tag]);
    });
  });

  describe('registerProducts()', () => {
    it('should add tag to registeredProductTags and call lazyInitProducts() if first registered', () => {
      const tag: any = { a: 'b' };
      const lazyInitProducts = service.lazyInitProducts = spy();

      service.registerProducts(tag);

      expect(service.registeredProductTags).to.eql([tag]);
      expect(lazyInitProducts).to.be.called;
    });

    it('should not call lazyInitProducts() if already initialized', () => {
      const tag: any = { a: 'b' };
      const registered: any = { c: 'd' };
      service.registeredProductTags = [registered];
      service.lazyInitProducts = () => expect.fail();

      service.registerProducts(tag);

      expect(service.registeredProductTags).to.eql([registered, tag]);
    });
  });

  describe('hasActiveSuggestion()', () => {
    it('should return true if any autocomplete tag has an active selection', () => {
      // tslint:disable-next-line max-line-length
      service.registeredAutocompleteTags = <any>[{ isActive: () => false }, { isActive: () => false }, { isActive: () => true }];

      expect(service.hasActiveSuggestion()).to.be.true;
    });

    it('should return false if no autocomplete tag has an active selection', () => {
      // tslint:disable-next-line max-line-length
      service.registeredAutocompleteTags = <any>[{ isActive: () => false }, { isActive: () => false }, { isActive: () => false }];

      expect(service.hasActiveSuggestion()).to.be.false;
    });
  });

  describe('updateSearchTerms()', () => {
    it('should call flux.saytSuggestions()', () => {
      const query = 'middleschool diaries';
      const saytSuggestions = spy();
      service['app'] = <any>{ flux: { saytSuggestions } };

      service.updateSearchTerms(query);

      expect(saytSuggestions).to.be.calledWith(query);
    });
  });

  describe('updateProducts()', () => {
    it('should call flux.saytProducts()', () => {
      const query = 'middleschool diaries';
      const saytProducts = spy();
      service['app'] = <any>{ flux: { saytProducts } };

      service.updateProducts(<any>{ suggestions: [query] });

      expect(saytProducts).to.be.calledWith(query);
    });
  });
});
