import { Events, Routes } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Service from '../../../src/services/pastPurchases';
import StoreFront from '../../../src/storefront';
import suite from './_suite';

suite('PastPurchase Service', ({ expect, spy, itShouldExtendBaseService }) => {
  let app: StoreFront;
  let service: Service;
  let on: sinon.SinonSpy;

  beforeEach(() => {
    on = spy();
    app = <any>{ flux: { on } };
    service = new Service(app, {});
  });

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);

    it('should listen for AUTOCOMPLETE_QUERY_UPDATED and PASTPURCHASE_CHANGED', () => {
      const receiveSaytPastPurchases = spy();
      service['app'].flux.actions = <any>{ receiveSaytPastPurchases };
      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED);
      on.getCall(0).args[1]();
      expect(receiveSaytPastPurchases).to.be.calledWithExactly([]);
      expect(on).to.be.calledWithExactly(Events.PAST_PURCHASE_CHANGED, service.fetchProducts, service);
    });
  });

  describe('init()', () => {
    it('should fetch past purchase skus', () => {
      const dispatch = spy();
      const fetchPastPurchasesAction = { c: 'f' };
      const fetchPastPurchases = spy(() => fetchPastPurchasesAction);
      service['app'] = <any>{
        flux: {
          store: { dispatch },
          actions: { fetchPastPurchases }
        }
      };

      service.init();

      expect(dispatch).to.be.calledWithExactly(fetchPastPurchasesAction);
      expect(fetchPastPurchases).to.be.called;
    });
  });

  describe('fetchProducts()', () => {
    it('should save state', () => {
      const saveState = spy();
      app.flux = <any>{ saveState };

      service.fetchProducts();

      expect(saveState).to.be.calledWith(Routes.PAST_PURCHASE);
    });
  });
});
