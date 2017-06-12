import { Events, Selectors } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import * as UrlBeautifier from '../../../src/core/url-beautifier';
import { WINDOW } from '../../../src/core/utils';
import Service, { STOREFRONT_APP_ID } from '../../../src/services/url';
import suite from '../_suite';

suite('URL service', ({ expect, spy, stub }) => {
  let service: Service;

  beforeEach(() => service = new Service(<any>{}, <any>{}));

  describe('init()', () => {
    it('should create a new URL Beautifier', () => {
      const routes = { a: 'b' };
      const beautifier = { c: 'd' };
      const urlBeautifier = stub(UrlBeautifier, 'default');
      stub(WINDOW, 'addEventListener');
      service.readInitialUrl = () => null;
      service['opts'] = <any>{ routes, beautifier };

      service.init();

      expect(urlBeautifier).to.be.calledWith(routes, beautifier);
    });

    it('should add popstate listener', () => {
      const addEventListener = stub(WINDOW, 'addEventListener');
      stub(UrlBeautifier, 'default');
      service.readInitialUrl = () => null;

      service.init();

      expect(addEventListener).to.be.calledWith('popstate', service.rewind);
    });

    it('should call readInitialUrl()', () => {
      const readInitialUrl = service.readInitialUrl = spy();
      stub(WINDOW, 'addEventListener');
      stub(UrlBeautifier, 'default');

      service.init();

      expect(readInitialUrl).to.be.called;
    });
  });

  describe('readInitialUrl()', () => {
    it('should refresh state from URL', () => {
      const href = 'http://my-url';
      const state = { a: 'b' };
      const request = { c: 'd' };
      const newState = { e: 'f' };
      const getState = spy(() => state);
      const parse = spy(() => request);
      const refreshState = service.refreshState = spy();
      const mergeSearchState = stub(Service, 'mergeSearchState').returns(newState);
      stub(WINDOW, 'location').returns({ href });
      service.beautifier = <any>{ parse };
      service['app'] = <any>{ flux: { store: { subscribe: () => null, getState } } };

      service.readInitialUrl();

      expect(parse).to.be.calledWith(href);
      expect(mergeSearchState).to.be.calledWith(state, request);
      expect(refreshState).to.be.calledWith(newState);
    });

    it('should augment history on state updated', () => {
      const unsubscribe = spy();
      const subscribe = spy(() => unsubscribe);
      const augmentHistory = service.augmentHistory = spy();
      stub(Service, 'mergeSearchState');
      stub(WINDOW, 'location').returns({});
      service.refreshState = () => null;
      service.beautifier = <any>{ parse: () => null };
      service['app'] = <any>{ flux: { store: { subscribe, getState: () => null } } };

      service.readInitialUrl();

      expect(subscribe).to.be.calledWith(sinon.match((cb) => {
        cb();

        expect(unsubscribe).to.be.called;
        return expect(augmentHistory).to.be.called;
      }));
    });

    it('should listen for any future change on failure', () => {
      const warn = spy();
      const listenForHistoryChange = service.listenForHistoryChange = spy();
      stub(WINDOW, 'location').throws();
      service['app'] = <any>{ log: { warn } };

      service.readInitialUrl();

      expect(warn).to.be.calledWith('unable to parse state from url');
      expect(listenForHistoryChange).to.be.called;
    });
  });

  describe('augmentHistory()', () => {
    it('should replace current window history', () => {
      const state = { a: 'b' };
      const title = 'Search Page';
      const replaceState = spy();
      stub(WINDOW, 'document').returns({ title });
      stub(WINDOW, 'location').returns({ pathname: '/thing1', search: '?q=thing2' });
      stub(WINDOW, 'history').returns({ replaceState });
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts: () => null },
          store: { getState: () => ({ data: state }), dispatch: () => null },
          once: () => null,
        }
      };

      service.augmentHistory();

      const url = '/thing1?q=thing2';
      expect(replaceState).to.be.calledWith({ url, state, app: STOREFRONT_APP_ID }, title, url);
    });

    it('should update products and wait for after first state change', () => {
      const title = 'Search Page';
      const once = spy();
      const dispatch = spy();
      const fetchProductsAction = { a: 'b' };
      stub(WINDOW, 'document').returns({ title });
      stub(WINDOW, 'location').returns({ pathname: '/thing1', search: '?q=thing2' });
      stub(WINDOW, 'history').returns({ replaceState: () => null });
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts: () => fetchProductsAction },
          store: { getState: () => ({}), dispatch },
          once,
        }
      };

      service.augmentHistory();

      expect(once).to.be.calledWith(Events.HISTORY_SAVE, service.listenForHistoryChange);
      expect(dispatch).to.be.calledWith(fetchProductsAction);
    });
  });

  describe('listenForHistoryChange()', () => {
    it('should listen for HISTORY_SAVE', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };

      service.listenForHistoryChange();

      expect(on).to.be.calledWith(Events.HISTORY_SAVE, service.updateHistory);
    });
  });

  describe('updateHistory()', () => {
    it('should create urls search state from state', () => {
      const page = 48;
      const url = '/some/url';
      const query = 'air jordans';
      const refinements = ['a', 'b'];
      const pushState = spy();
      const build = spy(() => url);
      const state = { page: { current: page } };
      stub(WINDOW, 'history').returns({ pushState });
      stub(Selectors, 'query').returns(query);
      stub(Selectors, 'pageSize').returns(5);
      stub(Selectors, 'selectedRefinements').returns(refinements);
      service.beautifier = <any>{ build };

      service.updateHistory(<any>{ data: state });

      expect(build).to.be.calledWith('search', { query, page, pageSize: 5, refinements });
      expect(pushState).to.be.calledWith({ url, state, app: STOREFRONT_APP_ID });
    });
  });

  describe('rewind()', () => {
    it('should refresh state from history', () => {
      const state = { a: 'b' };
      const refreshState = service.refreshState = spy();

      service.rewind(<any>{ state: { state, app: STOREFRONT_APP_ID } });

      expect(refreshState).to.be.calledWith(state);
    });

    it('should not refresh state from history if no stored state', () => {
      service.refreshState = (): any => expect.fail();

      service.rewind(<any>{ state: {} });
    });

    it('should not refresh state from history if not storefront state', () => {
      service.refreshState = (): any => expect.fail();

      service.rewind(<any>{ state: { state: {} } });
    });
  });

  describe('refreshState()', () => {
    it('should dispatch refreshState action', () => {
      const refreshStateAction = { a: 'b' };
      const state = { c: 'd' };
      const dispatch = spy();
      const refreshState = spy(() => refreshStateAction);
      service['app'] = <any>{ flux: { store: { dispatch }, actions: { refreshState } } };

      service.refreshState(state);

      expect(refreshState).to.be.calledWith(state);
      expect(dispatch).to.be.calledWith(refreshStateAction);
    });
  });

  describe('static', () => {
    describe('mergeSearchState()', () => {
      const state: any = {
        data: {
          a: 'b',
          query: { c: 'd' },
          page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50] } },
          navigations: { i: 'j' }
        }
      };
      const request: any = {
        page: 14,
        pageSize: 20,
        query: 'grape ape',
        refinements: [
          { type: 'Value', navigationName: 'brand', value: 'nike' },
          { type: 'Value', navigationName: 'colour', value: 'orange' },
          { type: 'Range', navigationName: 'price', low: 20, high: 40 },
        ],
      };

      const newState = Service.mergeSearchState(state, request);

      expect(newState).to.eql({
        a: 'b',
        query: {
          c: 'd',
          original: 'grape ape'
        },
        page: {
          e: 'f',
          current: 14,
          sizes: { g: 'h', items: [10, 20, 50], selected: 1 }
        },
        navigations: {
          i: 'j',
          allIds: ['brand', 'colour', 'price'],
          byId: {
            brand: { field: 'brand', label: 'brand', range: false, refinements: [{ value: 'nike' }], selected: [0] },
            // tslint:disable-next-line max-line-length
            colour: { field: 'colour', label: 'colour', range: false, refinements: [{ value: 'orange' }], selected: [0] },
            price: { field: 'price', label: 'price', range: true, refinements: [{ low: 20, high: 40 }], selected: [0] },
          }
        }
      });
    });
  });
});
