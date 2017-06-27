import { Events, Selectors } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import { BaseService, CORE } from '../../../src/core/service';
import * as UrlBeautifier from '../../../src/core/url-beautifier';
import { WINDOW } from '../../../src/core/utils';
import Service, { STOREFRONT_APP_ID } from '../../../src/services/url';
import suite from '../_suite';

suite('URL Service', ({ expect, spy, stub }) => {
  const routes = { a: 'b' };
  const beautifier = { refinementMapping: [], queryToken: 'q' };
  let service: Service;
  let urlBeautifier;
  let addEventListener;

  beforeEach(() => {
    addEventListener = stub(WINDOW, 'addEventListener').returns(null);
    urlBeautifier = stub(UrlBeautifier, 'default');
    service = new Service(<any>{}, <any>{ routes, beautifier });
  });

  it('should extend BaseService', () => {
    expect(service).to.be.an.instanceOf(BaseService);
  });

  it('should be a core service', () => {
    expect(Service[CORE]).to.be.true;
  });

  it('should create a new URL Beautifier', () => {
    expect(urlBeautifier).to.be.calledWith(routes, beautifier);
  });

  it('should add popstate listener', () => {
    expect(addEventListener).to.be.calledWith('popstate', service.rewind);
  });

  describe('init()', () => {
    it('should call readInitialUrl()', () => {
      const readInitialUrl = service.readInitialUrl = spy();

      service.init();

      expect(readInitialUrl).to.be.called;
    });
  });

  describe('readInitialUrl()', () => {
    it('should refresh state from URL', () => {
      const href = 'http://my-url';
      const state = { a: 'b' };
      const obj = { route: 'search', request: { c: 'd' } };
      const newState = { e: 'f' };
      const getState = spy(() => state);
      const parse = spy(() => obj);
      const refreshState = service.refreshState = spy();
      stub(WINDOW, 'location').returns({ href });
      stub(Service, 'mergeSearchState').returns(newState);
      service.beautifier = <any>{ parse };
      service['app'] = <any>{ flux: { store: { subscribe: () => null, getState } } };

      service.readInitialUrl();

      expect(parse).to.be.calledWith(href);
      expect(refreshState).to.be.calledWith(newState);
    });

    it('should augment history on state updated', () => {
      const obj = { route: 'search', request: { c: 'd' } };
      const unsubscribe = spy();
      const subscribe = spy(() => unsubscribe);
      const augmentHistory = service.augmentHistory = spy();
      stub(WINDOW, 'location').returns({});
      stub(Service, 'mergeSearchState').returns(null);
      service.refreshState = () => null;
      service.beautifier = <any>{ parse: () => obj };
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
      const data = { a: 'b' };
      const title = 'Search Page';
      const replaceState = spy();
      stub(WINDOW, 'document').returns({ title });
      stub(WINDOW, 'location').returns({ pathname: '/thing1', search: '?q=thing2' });
      stub(WINDOW, 'history').returns({ replaceState });
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts: () => null },
          store: { getState: () => ({ data }), dispatch: () => null },
          once: () => null,
        }
      };

      service.augmentHistory('', {});

      const url = '/thing1?q=thing2';
      expect(replaceState).to.be.calledWith({ url, state: { data }, app: STOREFRONT_APP_ID }, title, url);
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

      service.augmentHistory('', {});

      expect(once).to.be.calledWith(Events.HISTORY_SAVE, service.listenForHistoryChange);
    });

    it('should request products', () => {
      const title = 'Search Page';
      const dispatch = spy();
      const fetchProducts = stub();
      stub(WINDOW, 'document').returns({ title });
      stub(WINDOW, 'location').returns({ pathname: '/thing1', search: '?q=thing2' });
      stub(WINDOW, 'history').returns({ replaceState: () => null });
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts },
          store: { getState: () => ({}), dispatch },
          once: () => null,
        }
      };

      service.augmentHistory('search', {});

      expect(fetchProducts).to.be.called;
      expect(dispatch).to.be.calledWith(fetchProducts());
    });

    it('should request product details', () => {
      const title = 'Search Page';
      const request = { id: 20 };
      const dispatch = spy();
      const fetchProductDetails = stub();
      stub(WINDOW, 'document').returns({ title });
      stub(WINDOW, 'location').returns({ pathname: '/thing1', search: '?q=thing2' });
      stub(WINDOW, 'history').returns({ replaceState: () => null });
      service['app'] = <any>{
        flux: {
          actions: { fetchProductDetails },
          store: { getState: () => ({}), dispatch },
          once: () => null,
        }
      };

      service.augmentHistory('details', request);

      expect(fetchProductDetails).to.be.calledWith(request.id);
      expect(dispatch).to.be.calledWith(fetchProductDetails());
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
      const pageSize = 5;
      const url = '/some/url';
      const query = 'air jordans';
      const route = 'search';
      const refinements = [{ navigationName: 'a', value: 'b'}, { navigationName: 'price', low: 0, high: 10 }];
      const convertedRefinements = [{ field: 'a', value: 'b' }, { field: 'price', low: 0, high: 10 }];
      const sort = ['c', 'd'];
      const collection = 'All';
      const pushState = spy();
      const build = spy(() => url);
      const data = { page: { current: page } };
      stub(WINDOW, 'history').returns({ pushState });
      stub(Selectors, 'query').returns(query);
      stub(Selectors, 'pageSize').returns(pageSize);
      stub(Selectors, 'selectedRefinements').returns(refinements);
      stub(Selectors, 'sort').returns(sort);
      stub(Selectors, 'collection').returns(collection);
      service.beautifier = <any>{ build };
      service['app'].flux = <any>{ emit: () => null };

      service.updateHistory(<any>{ state: { data }, route });

      expect(build).to.be.calledWith(route, {
        query,
        page,
        pageSize,
        refinements: convertedRefinements,
        sort,
        collection
      });
      expect(pushState).to.be.calledWith({ url, state: { data }, app: STOREFRONT_APP_ID }, '', url);
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
      it ('should merge state properly when given new request', () => {
        const state: any = {
          data: {
            a: 'b',
            query: { c: 'd' },
            page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50], selected: 0 } },
            navigations: { i: 'j' },
            sorts: {
              items: [{ field: 'price' }, { field: 'price', descending: true }],
              selected: 0
            },
            collections: { selected: 0 }
          }
        };
        const request: any = {
          page: 14,
          pageSize: 20,
          query: 'grape ape',
          refinements: [
            { type: 'Value', field: 'brand', value: 'nike' },
            { type: 'Value', field: 'colour', value: 'orange' },
            { type: 'Range', field: 'price', low: 20, high: 40 },
          ],
          sort: { field: 'price', descending: true }
        };
        const searchId = 12;

        const newState = Service.mergeSearchState(state, request);

        expect(newState).to.eql({
          data: {
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
                // tslint:disable-next-line max-line-length
                brand: { field: 'brand', label: 'brand', range: false, refinements: [{ value: 'nike' }], selected: [0] },
                // tslint:disable-next-line max-line-length
                colour: { field: 'colour', label: 'colour', range: false, refinements: [{ value: 'orange' }], selected: [0] },
                price: { field: 'price', label: 'price', range: true, refinements: [{ low: 20, high: 40 }], selected: [0] },
              }
            },
            sorts: { items: [{ field: 'price' }, { field: 'price', descending: true }], selected: 1},
            collections: { selected: 0 }
          }
        });
      });

      it('should merge state properly when not given new request', () => {
        const searchId = 13;
        const state: any = {
          session: {
            searchId
          },
          data: {
            a: 'b',
            query: { c: 'd', original: 'whatever' },
            page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50], selected: 0 }, current: 10 },
            navigations: { i: 'j', allIds: ['brand', 'format'], byId: { brand: {}, format: {}} },
            sorts: {
              items: [{ field: 'price' }, { field: 'price', descending: true }],
              selected: 0
            },
            collections: { selected: 0 }
          }
        };
        const request: any = { refinements: [] };

        const newState = Service.mergeSearchState(state, request);

        expect(newState).to.eql(state);
      });
    });
  });
});
