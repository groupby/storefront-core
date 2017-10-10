import { Events, Selectors } from '@storefront/flux-capacitor';
import Service from '../../../src/services/collections';
import * as collectionsService from '../../../src/services/collections';
import suite from './_suite';

suite('Collections Service', ({ expect, spy, stub, itShouldBeCore, itShouldExtendBaseService }) => {
  let service: Service;

  beforeEach(() => service = new Service(<any>{}, <any>{}));

  itShouldBeCore(Service);

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);
  });

  describe('lazyInit()', () => {
    it('should listen for RECALL_CHANGED event', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };
      stub(service,'fetchCollectionCounts');

      service.lazyInit();

      expect(on).to.be.calledWith(Events.RECALL_CHANGED, service.waitForResults);
    });

    it('should call fetchCollectionsCount', () => {
      const on = spy();
      const fetchCollectionsCount = stub(service,'fetchCollectionCounts');
      service['app'] = <any>{ flux: { on } };

      service.lazyInit();

      expect(fetchCollectionsCount).to.be.calledOnce;
    });
  });

  describe('waitForResults()', () => {
    it('should wait for FETCH_SEARCH_DONE', () => {
      const once = spy();
      service['app'] = <any>{ flux: { once } };

      service.waitForResults();

      expect(once).to.be.calledWith(Events.PRODUCTS_UPDATED, service.fetchCollectionCounts);
    });
  });

  describe('fetchCollectionCounts()', () => {
    it('should call flux.countRecords() for each collection', () => {
      const state = { a: 'b' };
      const countRecords = spy();
      const activeCollection = 'mainProducts';
      const otherCollection1 = 'otherProducts';
      const otherCollection2 = 'additionalProducts';
      const collection = stub(Selectors, 'collection').returns(activeCollection);
      // tslint:disable-next-line max-line-length
      const collections = stub(Selectors, 'collections').returns({ allIds: [otherCollection1, activeCollection, otherCollection2] });
      service['app'] = <any>{ flux: { store: { getState: () => state }, countRecords } };

      service.fetchCollectionCounts();

      expect(countRecords).to.be.calledWith(otherCollection1)
        .and.calledWith(otherCollection2)
        .and.not.calledWith(activeCollection);
    });
  });
});
