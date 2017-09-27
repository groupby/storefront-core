import { Events } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import { BaseService } from '../../../src/core/service';
import Service from '../../../src/services/details';
import StoreFront from '../../../src/storefront';
import suite from '../_suite';

suite('Details Service', ({ expect, spy }) => {
  let app: StoreFront;
  let service: Service;
  let on: sinon.SinonSpy;

  beforeEach(() => {
    on = spy();
    app = <any>{ flux: { on } };
    service = new Service(app, {});
  });

  describe('constructor()', () => {
    it('should extend BaseService', () => {
      expect(service).to.be.an.instanceOf(BaseService);
    });

    it('should listen for DETAILS_UPDATED', () => {
      expect(on).to.be.calledWithExactly(Events.DETAILS_UPDATED, service.fetchDetails);
    });
  });

  describe('fetchDetails()', () => {
    it('should dispatch a fetchProductDetails() action', () => {
      const id = '193';
      const fetchProductDetailsAction = { a: 'b' };
      const product: any = { c: 'd', id };
      const fetchProductDetails = spy(() => fetchProductDetailsAction);
      const dispatch = spy();
      app.flux = <any>{ actions: { fetchProductDetails }, store: { dispatch } };

      service.fetchDetails(product);

      expect(fetchProductDetails).to.be.calledWithExactly(id);
      expect(dispatch).to.be.calledWithExactly(fetchProductDetailsAction);
    });
  });
});
