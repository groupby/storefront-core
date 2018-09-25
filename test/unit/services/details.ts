import { Events, Routes } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Service from '../../../src/services/details';
import StoreFront from '../../../src/storefront';
import suite from './_suite';

suite('Details Service', ({ expect, spy, itShouldExtendBaseService }) => {
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

    it('should listen for DETAILS_CHANGED', () => {
      expect(on).to.be.calledWithExactly(Events.DETAILS_CHANGED, service.fetchDetails);
    });
  });

  describe('init()', () => {
    it('should be a no-op', () => {
      expect(() => service.init()).to.not.throw();
    });
  });

  describe('fetchDetails()', () => {
    it('should save state', () => {
      const saveState = spy();
      app.flux = <any>{ saveState };

      service.fetchDetails();

      expect(saveState).to.be.calledWith(Routes.DETAILS);
    });
  });
});
