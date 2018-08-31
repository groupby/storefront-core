import { Events, Routes } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Service from '../../../src/services/search';
import StoreFront from '../../../src/storefront';
import suite from './_suite';

suite('Search Service', ({ expect, spy, itShouldExtendBaseService }) => {
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

    it('should listen for SEARCH_CHANGED', () => {
      expect(on).to.be.calledWithExactly(Events.SEARCH_CHANGED, service.fetchProducts);
    });
  });

  describe('init()', () => {
    it('should be a no-op', () => {
      expect(() => service.init()).to.not.throw();
    });
  });

  describe('fetchProducts()', () => {
    it('should emit sayt:hide and save state', () => {
      const saveState = spy();
      const emit = spy();
      app.flux = <any>{ saveState, emit };

      service.fetchProducts();

      expect(emit).to.be.calledWithExactly('sayt:hide');
      expect(saveState).to.be.calledWith(Routes.SEARCH);
    });
  });
});
