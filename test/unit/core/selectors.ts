import { Selectors as FluxSelectors, Store } from '@storefront/flux-capacitor';
import ProductTransformer from '../../../src/core/product-transformer';
import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('Selectors', ({ expect, spy, stub }) => {
  const state: any = { b: 2 };

  describe('productTransformer', () => {
    it('should return productTransformer with config.structure passed in', () => {
      const transformer = { a: 1 };
      const structure = { c: 3 };
      const configSelector = stub(FluxSelectors, 'config').returns({ structure });
      const productTransformer = stub(ProductTransformer, 'transformer').returns(transformer);

      const returnedTransformer = Selectors.productTransformer(state);

      expect(configSelector).to.be.calledWithExactly(state);
      expect(productTransformer).to.be.calledWithExactly(structure);
      expect(returnedTransformer).to.eql(transformer);
    });
  });

  describe('transformedProducts', () => {
    it('should select products from fluxcapacitor and apply transform to those products', () => {
      const transformer = spy((x) => ({ data: { v: x } }));
      const idField = 'hello';
      const recommendations = { idField };
      const arr = [{ data: 1, meta: 'a' }, { data: 2, meta: 'b' }, { data: 3, meta: 'c' }];
      const configSelector = stub(FluxSelectors, 'config').returns({ recommendations });
      const productsSelector = stub(FluxSelectors, 'productsWithPastPurchase').returns(arr);
      const productTransformer = stub(Selectors, 'productTransformer').returns(transformer);
      const expectedArr = [{ data: { v: 1 }, meta: 'a' }, { data: { v: 2 }, meta: 'b' }, { data: { v: 3 }, meta: 'c' }];

      const returnedArr = Selectors.transformedProducts(state);

      expect(configSelector).to.be.calledWithExactly(state);
      expect(productTransformer).to.be.calledWithExactly(state);
      expect(productsSelector).to.be.calledWithExactly(state, idField);
      expect(returnedArr).to.eql(expectedArr);
    });
  });

  describe('transformedDetailsProduct', () => {
    it('should return transformed product if details.product is defined', () => {
      const transformer = spy((x) => x);
      const data = { a: 1 };
      const details = { data };
      const detailsSelector = stub(FluxSelectors, 'details').returns(details);
      const productTransformer = stub(Selectors, 'productTransformer').returns(transformer);

      const returnedProduct = Selectors.transformedDetailsProduct(state);

      expect(detailsSelector).to.be.calledWithExactly(state);
      expect(productTransformer).to.be.calledWithExactly(state);
      expect(returnedProduct).to.eql(data);
    });

    it('should return undefined if details is undefined', () => {
      const detailsSelector = stub(FluxSelectors, 'details').returns(undefined);

      const returnedProduct = Selectors.transformedDetailsProduct(state);

      expect(detailsSelector).to.be.calledWithExactly(state);
      expect(returnedProduct).to.be.undefined;
    });

    it('should return undefined if details.product is undefined', () => {
      const details = { product: undefined };
      const detailsSelector = stub(FluxSelectors, 'details').returns(details);

      const returnedProduct = Selectors.transformedDetailsProduct(state);

      expect(detailsSelector).to.be.calledWithExactly(state);
      expect(returnedProduct).to.be.undefined;
    });
  });

  describe('transformedRecommendationsProducts', () => {
    it('should select recommendationsproducts from fluxcapacitor and apply transform to those products', () => {
      const transformer = spy((x) => x);
      const arr = [{ data: 1, meta: 'a' }, { data: 2, meta: 'b' }, { data: 3, meta: 'c' }];
      const productsSelector = stub(FluxSelectors, 'recommendationsProducts').returns(arr);
      const productTransformer = stub(Selectors, 'productTransformer').returns(transformer);

      const returnedArr = Selectors.transformedRecommendationsProducts(state);

      expect(productsSelector).to.be.calledWithExactly(state);
      expect(productTransformer).to.be.calledWithExactly(state);
      expect(returnedArr).to.eql(arr);
    });
  });
});