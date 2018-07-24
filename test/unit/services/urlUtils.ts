import { Events, Selectors } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import CoreSelectors from '../../../src/core/selectors';
import { BaseService, CORE } from '../../../src/core/service';
import * as UrlBeautifier from '../../../src/core/url-beautifier';
import * as CoreUtils from '../../../src/core/utils';
import Utils from '../../../src/services/urlUtils';
import suite from './_suite';

suite('URL Service', ({ expect, spy, stub }) => {
  let win;

  beforeEach(() => {
    win = { addEventListener: spy() };
    stub(CoreUtils, 'WINDOW').returns(win);
  });

  describe('static', () => {
    describe('getBasePath()', () => {
      it('should get base URL path', () => {
        const baseURI = 'http://example.com/base/path';
        win.document = { baseURI };
        win.location = { pathname: '/not/base/path' };

        expect(Utils.getBasePath()).to.eq('/base/path');
      });

      it('should return the empty string for no defined base tag', () => {
        const pathname = '/base/path';
        const baseURI = `http://example.com${pathname}`;
        win.document = { baseURI };
        win.location = { pathname };

        expect(Utils.getBasePath()).to.eq('');
      });

      it('should strip trailing slashes', () => {
        const baseURI = 'http://example.com/base/path/';
        win.document = { baseURI };
        win.location = { pathname: '/not/base/path' };

        expect(Utils.getBasePath()).to.eq('/base/path');
      });
    });

    describe('detailsUrlState()', () => {
      it('should return details url state', () => {
        const state: any = 'state';
        const ret = { data: 'dat' };
        const details = stub(CoreSelectors, 'transformedDetailsProduct').returns(ret);
        expect(Utils.detailsUrlState(state)).to.eql({
          data: ret.data,
          variants: [],
        });
        expect(details).to.be.calledWithExactly(state);
      });
    });

    describe('navigationUrlState()', () => {
      it('should return navigation url state', () => {
        const state: any = 'state';
        expect(Utils.navigationUrlState(state)).to.eql({});
      });
    });

    describe('pastPurchaseUrlState()', () => {
      it('should return pastPurchase url state', () => {
        const state: any = 'state';
        const sorts = { selected: 1, items: ['a', 'b', 'c'] };
        const query = 'q';
        const page = 'p';
        const pageSize = 's';
        const selected = [
          { navigationName: 'f', value: 'c', type: 'Value' },
          { navigationName: 'r', value: 'j', type: 'Value' },
        ];
        const refinements = [{ field: 'f', value: 'c' }, { field: 'r', value: 'j' }];
        const pastPurchaseSort = stub(Selectors, 'pastPurchaseSort').returns(sorts);
        const pastPurchaseQuery = stub(Selectors, 'pastPurchaseQuery').returns(query);
        const pastPurchasePage = stub(Selectors, 'pastPurchasePage').returns(page);
        const pastPurchasePageSize = stub(Selectors, 'pastPurchasePageSize').returns(pageSize);
        const pastPurchaseSelectedRefinements = stub(Selectors, 'pastPurchaseSelectedRefinements').returns(selected);
        expect(Utils.pastPurchaseUrlState(state)).to.eql({
          query,
          page,
          pageSize,
          sort: sorts.items[sorts.selected],
          refinements,
          collection: null,
        });
        expect(pastPurchaseSort).to.be.calledWithExactly(state);
        expect(pastPurchaseQuery).to.be.calledWithExactly(state);
        expect(pastPurchasePage).to.be.calledWithExactly(state);
        expect(pastPurchasePageSize).to.be.calledWithExactly(state);
        expect(pastPurchaseSelectedRefinements).to.be.calledWithExactly(state);
      });
    });

    describe('getNavigations()', () => {
      it('should return correct allIds and byId', () => {
        const refinements = [
          { field: 'colors', value: 'blue' },
          { field: 'brand', value: 'nike' },
          { field: 'colors', value: 'red' },
          { field: 'price', low: '1', high: '3' },
        ];
        const request: any = { refinements };
        const expectedAllIds = ['colors', 'brand', 'price'];
        const expectedById = {
          colors: {
            field: 'colors',
            label: 'colors',
            range: false,
            refinements: [{ value: 'blue' }, { value: 'red' }],
            selected: [0, 1],
          },
          brand: {
            field: 'brand',
            label: 'brand',
            range: false,
            refinements: [{ value: 'nike' }],
            selected: [0],
          },
          price: {
            field: 'price',
            label: 'price',
            range: true,
            refinements: [{ low: '1', high: '3' }],
            selected: [0],
          },
        };

        const { allIds, byId } = Utils.getNavigations(request);

        expect(allIds).to.be.eql(expectedAllIds);
        expect(byId).to.be.eql(expectedById);
      });
    });

    describe('mergePastPurchaseState()', () => {
      it('should merge state properly when given new request', () => {
        const state: any = {
          data: {
            present: {
              other: {},
              pastPurchases: {
                query: { c: 'd' },
                page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50], selected: 0 } },
                navigations: {},
                sort: {
                  items: [{ field: 'price' }, { field: 'price', descending: true }],
                  selected: 0,
                },
              },
            },
          },
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
          sort: { field: 'price', descending: true },
        };
        const searchId = 12;
        const nav = { allIds: ['a'], byId: { a: '1' } };
        const navigations = stub(Utils, 'getNavigations').returns(nav);

        const newState = Utils.mergePastPurchaseState(state, request);

        expect(newState).to.eql({
          data: {
            present: {
              other: {},
              pastPurchases: {
                query: 'grape ape',
                page: {
                  e: 'f',
                  current: 14,
                  sizes: { g: 'h', items: [10, 20, 50], selected: 1 },
                },
                navigations: nav,
                sort: { items: [{ field: 'price' }, { field: 'price', descending: true }], selected: 0 },
              },
            },
          },
        });
      });

      it('should merge state properly when not given new request', () => {
        const searchId = 13;
        const state: any = {
          session: {
            searchId,
          },
          data: {
            present: {
              a: 'b',
              pastPurchases: {
                query: { c: 'd', original: 'whatever' },
                page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50], selected: 0 }, current: 10 },
                navigations: { i: 'j', allIds: ['brand', 'format'], byId: { brand: {}, format: {} } },
                sort: {
                  items: [{ field: 'price' }, { field: 'price', descending: true }],
                  selected: 0,
                },
              },
              collections: { selected: 0 },
            },
          },
        };
        const request: any = { refinements: [] };

        const newState = Utils.mergePastPurchaseState(state, request);

        expect(newState).to.eql(state);
      });
    });

    describe('mergeSearchState()', () => {
      it('should merge state properly when given new request', () => {
        const state: any = {
          data: {
            present: {
              a: 'b',
              query: { c: 'd' },
              page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50], selected: 0 } },
              navigations: { i: 'j' },
              sorts: {
                items: [{ field: 'price' }, { field: 'price', descending: true }],
                selected: 0,
              },
              collections: { selected: 0 },
            },
          },
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
          sort: { field: 'price', descending: true },
        };
        const searchId = 12;

        const newState = Utils.mergeSearchState(state, request);

        expect(newState).to.eql({
          data: {
            present: {
              a: 'b',
              query: {
                c: 'd',
                original: 'grape ape',
              },
              page: {
                e: 'f',
                current: 14,
                sizes: { g: 'h', items: [10, 20, 50], selected: 1 },
              },
              navigations: {
                i: 'j',
                allIds: ['brand', 'colour', 'price'],
                byId: {
                  // tslint:disable-next-line max-line-length
                  brand: {
                    field: 'brand',
                    label: 'brand',
                    range: false,
                    refinements: [{ value: 'nike' }],
                    selected: [0],
                  },
                  // tslint:disable-next-line max-line-length
                  colour: {
                    field: 'colour',
                    label: 'colour',
                    range: false,
                    refinements: [{ value: 'orange' }],
                    selected: [0],
                  },
                  price: {
                    field: 'price',
                    label: 'price',
                    range: true,
                    refinements: [{ low: 20, high: 40 }],
                    selected: [0],
                  },
                },
              },
              sorts: { items: [{ field: 'price' }, { field: 'price', descending: true }], selected: 1 },
              collections: { selected: 0 },
            },
          },
        });
      });

      it('should merge state properly when not given new request', () => {
        const searchId = 13;
        const state: any = {
          session: {
            searchId,
          },
          data: {
            present: {
              a: 'b',
              query: { c: 'd', original: 'whatever' },
              page: { e: 'f', sizes: { g: 'h', items: [10, 20, 50], selected: 0 }, current: 10 },
              navigations: { i: 'j', allIds: ['brand', 'format'], byId: { brand: {}, format: {} } },
              sorts: {
                items: [{ field: 'price' }, { field: 'price', descending: true }],
                selected: 0,
              },
              collections: { selected: 0 },
            },
          },
        };
        const request: any = { refinements: [] };

        const newState = Utils.mergeSearchState(state, request);

        expect(newState).to.eql(state);
      });
    });
  });
});
