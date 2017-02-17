import * as core from '../src/core';
import services from '../src/services';
import StoreFront from '../src/storefront';
import { expect, sinon } from './_suite';

describe('StoreFront', () => {
  let system: sinon.SinonStub;
  let bootstrap: sinon.SinonSpy;
  let initServices: sinon.SinonSpy;
  let initMixin: sinon.SinonSpy;
  let registerTags: sinon.SinonSpy;

  beforeEach(() => {
    bootstrap = sinon.spy();
    initServices = sinon.spy();
    initMixin = sinon.spy();
    registerTags = sinon.spy();
    system = sinon.stub(core, 'System')
      .callsFake((app) => {
        app.log = { info: () => null };
        return { bootstrap, initServices, initMixin, registerTags };
      });
  });
  afterEach(() => {
    sinon.restore();
    if (StoreFront._instance) {
      delete StoreFront._instance;
    }
  });

  describe('constructor()', () => {
    it('should be a singleton', () => {
      const storefront = new StoreFront(<any>{});

      expect(storefront).to.be.ok;
      expect(StoreFront._instance).to.eq(storefront);
      expect(new StoreFront(<any>{})).to.eq(storefront);
    });

    it('should intialize system', () => {
      const app = new StoreFront(<any>{});

      expect(system.calledWith(app)).to.be.true;
    });

    it('should bootstrap system', () => {
      const config: any = {};
      new StoreFront(config); // tslint:disable-line:no-unused-new

      expect(bootstrap.calledWith(services, config)).to.be.true;
    });

    it('should have default empty configuration', () => {
      new StoreFront(); // tslint:disable-line:no-unused-new

      expect(bootstrap.calledWith(services, {})).to.be.true;
    });

    it('should intialize services', () => {
      new StoreFront(<any>{}); // tslint:disable-line:no-unused-new

      expect(initServices.called).to.be.true;
    });

    it('should intialize base riot mixin', () => {
      new StoreFront(<any>{}); // tslint:disable-line:no-unused-new

      expect(initMixin.called).to.be.true;
    });
  });
});
