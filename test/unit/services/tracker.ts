import { Events } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import ProductTransformer from '../../../src/core/product-transformer';
import { BaseService, CORE } from '../../../src/core/service';
import * as utils from '../../../src/core/utils';
import Service from '../../../src/services/tracker';
import suite from '../_suite';

const CUSTOMER_ID = 'myCustomer';
const AREA = 'myArea';

suite('Tracker Service', ({ expect, spy, stub }) => {
  let tracker: sinon.SinonStub;
  let transformer: sinon.SinonStub;

  beforeEach(() => {
    tracker = stub(utils, 'GbTracker');
    transformer = stub(ProductTransformer, 'transformer');
  });

  describe('constructor()', () => {
    it('should initialize GbTracker client', () => {
      const app: any = { config: { customerId: CUSTOMER_ID, area: AREA }, flux: { on: () => null } };

      new Service(app, {});

      expect(tracker).to.be.calledWith(CUSTOMER_ID, AREA);
    });

    it('should initialize ProductTransformer', () => {
      const structure = { a: 'b' };
      const transform = () => null;
      const app: any = { config: { structure }, flux: { on: () => null } };
      transformer.returns(transform);

      const service = new Service(app, {});

      expect(transformer).to.be.calledWith(structure);
      expect(service.transform).to.eq(transform);
    });

    it('should listen for events', () => {
      const on = spy();
      const app: any = { config: {}, flux: { on } };

      const service = new Service(app, {});

      expect(on).to.have.callCount(6)
        .and.calledWith(Events.BEACON_SEARCH, service.sendSearchEvent)
        .and.calledWith(Events.BEACON_VIEW_CART, service.sendViewCartEvent)
        .and.calledWith(Events.BEACON_ADD_TO_CART, service.sendAddToCartEvent)
        .and.calledWith(Events.BEACON_REMOVE_FROM_CART, service.sendRemoveFromCartEvent)
        .and.calledWith(Events.BEACON_VIEW_PRODUCT, service.sendViewProductEvent)
        .and.calledWith(Events.BEACON_ORDER, service.sendOrderEvent);
    });
  });

  describe('init()', () => {
    it('should setup visitor information', () => {
      const autoSetVisitor = spy();
      const visitorId = '1234';
      const app: any = { config: { visitorId }, flux: { on: () => null } };
      tracker.returns({ autoSetVisitor, disableWarnings: () => expect.fail() });

      new Service(app, { warnings: true }).init();

      expect(autoSetVisitor).to.be.calledWith(visitorId);
    });

    it('should disable warnings', () => {
      const disableWarnings = spy();
      const visitorId = '1234';
      const app: any = { config: { visitorId }, flux: { on: () => null } };
      tracker.returns({ disableWarnings, autoSetVisitor: () => null });

      new Service(app, {}).init();

      expect(disableWarnings).to.be.called;
    });
  });
});
