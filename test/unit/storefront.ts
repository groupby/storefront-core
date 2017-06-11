import * as System from '../../src/core/system';
import services from '../../src/services';
import StoreFront from '../../src/storefront';
import suite from './_suite';

suite('StoreFront', ({ expect, spy, stub }) => {
  const CONFIG: any = { options: {} };
  let system: sinon.SinonStub;
  let bootstrap: sinon.SinonSpy;
  let initServices: sinon.SinonSpy;
  let initMixin: sinon.SinonSpy;
  let registerTags: sinon.SinonSpy;

  beforeEach(() => {
    bootstrap = spy();
    initServices = spy();
    initMixin = spy();
    registerTags = spy();
    system = stub(System, 'default')
      .callsFake((app) => {
        app.log = { info: () => null };
        app.flux = {
          on: () => null,
          store: { dispatch: () => null },
          actions: { startApp: () => null }
        };
        return { bootstrap, initServices, initMixin, registerTags };
      });
  });
  afterEach(() => delete StoreFront._instance);

  describe('constructor()', () => {
    it('should be a singleton', () => {
      const storefront = new StoreFront(CONFIG);

      expect(storefront).to.be.ok;
      expect(StoreFront._instance).to.eq(storefront);
      expect(new StoreFront(CONFIG)).to.eq(storefront);
    });

    it('should intialize system', () => {
      const app = new StoreFront(CONFIG);

      expect(system).to.be.calledWith(app);
    });

    it('should bootstrap system', () => {
      new StoreFront(CONFIG); // tslint:disable-line:no-unused-new

      expect(bootstrap).to.be.calledWith(services, CONFIG);
    });

    it('should have default empty configuration', () => {
      new StoreFront(); // tslint:disable-line:no-unused-new

      expect(bootstrap).to.be.calledWith(services, { options: {} });
    });

    it('should intialize services', () => {
      new StoreFront(CONFIG); // tslint:disable-line:no-unused-new

      expect(initServices).to.be.called;
    });

    it('should intialize base riot mixin', () => {
      new StoreFront(CONFIG); // tslint:disable-line:no-unused-new

      expect(initMixin).to.be.called;
    });
  });
});
