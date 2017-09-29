import * as System from '../../src/core/system';
import Globals from '../../src/globals';
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
  });

  describe('mount()', () => {
    it('should call riot.mount()', () => {
      const args = ['a', 'b', 'c'];
      const mount = spy();
      const app = new StoreFront(CONFIG);
      app.riot = <any>{ mount };

      app.mount(...args);

      expect(mount).to.be.calledWith(...args);
    });
  });

  describe('static', () => {
    describe('mount()', () => {
      it('should call mount() on underlying instance', () => {
        const args = ['a', 'b', 'c'];
        const mount = spy();
        StoreFront._instance = <any>{ mount };

        StoreFront.mount(...args);

        expect(mount).to.be.calledWith(...args);
      });
    });

    describe('register()', () => {
      it('should push to global tags registery', () => {
        const tags = ['a', 'b'];
        const registerTag = () => null;
        stub(Globals, 'getTags').returns(tags);

        StoreFront.register(registerTag);

        expect(tags).to.eql(['a', 'b', registerTag]);
      });
    });
  });
});
