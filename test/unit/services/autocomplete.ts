import { Events } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import * as utils from '../../../src/core/utils';
import Service from '../../../src/services/autocomplete';
import * as autocompleteService from '../../../src/services/autocomplete';
import suite from './_suite';

suite('Autocomplete Service', ({ expect, spy, stub, itShouldBeCore, itShouldExtendBaseService }) => {
  let service: Service;

  beforeEach(() => service = new Service(<any>{}, <any>{}));

  itShouldBeCore(Service);

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);
  });

  describe('lazyInit()', () => {
    let on;
    beforeEach(() => {
      on = spy();
      service['app'] = <any>{
        flux: { on },
        config: {
          services: { autocomplete: { getPastPurchases: false } },
          recommendations: {}
        }
      };
    });

    it('should listen for AUTOCOMPLETE_QUERY_UPDATED event', () => {
      service['app'].flux.once = <any>(() => expect.fail());
      service['app'].config.recommendations.location = <any>false;
      service.lazyInit();

      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED, service.updateSearchTerms);
    });

    it('should prepare to request location if configured', () => {
      const once = spy();
      service['app'].flux.once = <any>once;
      service['app'].config.recommendations.location = <any>{};

      service.lazyInit();

      expect(once).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED, service.requestLocation);
    });

    it('should call pastPurchases if past purchase enabled', () => {
      service['app'].config.services.autocomplete.getPastPurchases = true;

      service.lazyInit();

      expect(on).to.be.calledTwice
        .and.calledWith()
        .and.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED, service.getPastPurchases);
    });
  });

  describe('lazyInitProducts()', () => {
    it('should listen for AUTOCOMPLETE_QUERY_UPDATED event', () => {
      const on = spy();
      service['app'] = <any>{
        flux: { on },
        config: { services: { autocomplete: { useFirstResult: false } } }
      };

      service.lazyInitProducts();

      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED, service.updateProducts);
    });

    it('should listen for AUTOCOMPLETE_SUGGESTIONS_UPDATED event and then use search terms if enabled', () => {
      const on = spy();
      service['app'] = <any>{
        flux: { on },
        config: { services: { autocomplete: { useFirstResult: true } } }
      };

      service.lazyInitProducts();

      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED, service.updateProductsWithSearchTerms);
    });
  });

  describe('registerAutocomplete()', () => {
    it('should add tag to registeredAutocompleteTags', () => {
      const on = spy();
      const tag: any = { a: 'b', on };

      service.registerAutocomplete(tag);

      expect(service.registeredAutocompleteTags).to.eql([tag]);
      on.args[0][1]();
      expect(service.registeredAutocompleteTags).to.eql([]);
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

      service.updateProducts(query);

      expect(saytProducts).to.be.calledWith(query);
    });
  });

  describe('updateProductsWithSearchTerms()', () => {
    it('should call flux.saytProducts()', () => {
      const query = 'middleschool diaries';
      const saytProducts = spy();
      service['app'] = <any>{ flux: { saytProducts } };

      service.updateProductsWithSearchTerms(<any>{ suggestions: [{ value: query }] });

      expect(saytProducts).to.be.calledWith(query);
    });

    it('should check for first suggestion', () => {
      service['app'] = <any>{ flux: { saytProducts: () => expect.fail() } };

      service.updateProductsWithSearchTerms(<any>{ suggestions: [] });
    });
  });

  describe('updateProductsWithSearchTerms()', () => {
    it('should call flux.saytProducts()', () => {
      const query = 'middleschool diaries';
      const saytPastPurchases = spy();
      service['app'] = <any>{ flux: { saytPastPurchases } };

      service.getPastPurchases(<any>{ suggestions: [{ value: query }] });

      expect(saytPastPurchases).to.be.calledWith(query);
    });

    it('should check for first suggestion', () => {
      service['app'] = <any>{ flux: { saytPastPurchases: () => expect.fail() } };

      service.getPastPurchases(<any>{ suggestions: [] });
    });
  });

  describe('requestLocation()', () => {
    it('should store location when successful', () => {
      const getCurrentPosition = spy();
      stub(utils, 'WINDOW').returns({ navigator: { geolocation: { getCurrentPosition } } });

      service.requestLocation();

      expect(getCurrentPosition).to.be.calledWith(sinon.match((cb) => {
        const dispatch = spy();
        const updateLocationAction = { a: 'b' };
        const updateLocation = spy(() => updateLocationAction);
        const latitude = 142.312;
        const longitude = -45.511;
        service['app'] = <any>{ flux: { store: { dispatch }, actions: { updateLocation } } };

        cb({ coords: { latitude, longitude } });

        expect(updateLocation).to.be.calledWith({ latitude, longitude });
        return expect(dispatch).to.be.calledWith(updateLocationAction);
      }), sinon.match.func);
    });

    it('should log error when unsuccessful', () => {
      const getCurrentPosition = spy();
      stub(utils, 'WINDOW').returns({ navigator: { geolocation: { getCurrentPosition } } });

      service.requestLocation();

      expect(getCurrentPosition).to.be.calledWith(sinon.match.func, sinon.match((cb) => {
        const error = new Error();
        const log = spy();
        service['app'] = <any>{ log: { error: log } };

        cb(error);

        return expect(log).to.be.calledWith('unable to get location', error);
      }));
    });
  });
});
