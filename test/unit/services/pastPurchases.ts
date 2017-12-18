import { Events } from '@storefront/flux-capacitor';
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

    it('should listen for PASTPURCHASES_CHANGED', () => {
      const receiveSaytPastPurchases = spy();
      service['app'].flux.actions = <any>{ receiveSaytPastPurchases };
      expect(on).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED);
      on.getCall(0).args[1]();
      expect(receiveSaytPastPurchases).to.be.calledWithExactly([]);
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
});
