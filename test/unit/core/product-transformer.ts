import ProductTransformer, { DEFAULT_TRANSFORM, TransformUtils } from '../../../src/core/product-transformer';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite('Product Transformation', ({ expect, spy, stub }) => {

  describe('ProductTransformer', () => {
    describe('transformer()', () => {
      it('should wrap ProductTransformer.transform()', () => {
        const structure: any = { a: 'b' };
        const product: any = { c: 'd' };
        const transform = stub(ProductTransformer, 'transform');

        ProductTransformer.transformer(structure)(product);

        expect(transform).to.be.calledWith(product, structure);
      });
    });

    describe('transform()', () => {
      it('should extract base product data', () => {
        const effectiveStructure = { a: 'b' };
        const structure: any = { c: 'd' };
        const product: any = { e: 'f' };
        const transformedProduct: any = { g: 'h' };
        const extendStructure = stub(TransformUtils, 'extendStructure').returns(effectiveStructure);
        const remap = stub(TransformUtils, 'remap').returns(transformedProduct);

        const result = ProductTransformer.transform(product, structure);

        expect(result).to.eql({ data: transformedProduct, variants: [transformedProduct] });
        expect(extendStructure).to.be.calledWith(product, product, structure);
        expect(remap).to.be.calledWith(product, effectiveStructure);
      });

      it('should apply user transform', () => {
        const transformedProduct = { e: 'f' };
        const userTransform = spy(() => transformedProduct);
        const product: any = { c: 'd' };
        const cloned = { g: 'h' };
        const extendStructure = stub(TransformUtils, 'extendStructure');
        const clone = stub(utils, 'clone').returns(cloned);
        stub(TransformUtils, 'remap');

        ProductTransformer.transform(product, <any>{ a: 'b', _transform: userTransform });

        expect(clone).to.be.calledWith(product);
        expect(userTransform).to.be.calledWith(cloned);
        expect(extendStructure).to.be.calledWith(product, transformedProduct, { a: 'b' });
      });

      it('should use product if user transform returns falsy', () => {
        const product: any = { c: 'd' };
        const extendStructure = stub(TransformUtils, 'extendStructure');
        stub(TransformUtils, 'remap');

        ProductTransformer.transform(product, <any>{ a: 'b', _transform: () => null });

        expect(extendStructure).to.be.calledWith(product, product, { a: 'b' });
      });

      it('should unpack variant data', () => {
        const effectiveStructure = { a: 'b' };
        const variantInfo = { i: 'j' };
        const structure: any = { c: 'd', _variant: variantInfo };
        const product: any = { e: 'f' };
        const remapped: any = { g: 'h' };
        const variants = [{ k: 'l' }, { m: 'n' }];
        const extendStructure = stub(TransformUtils, 'extendStructure').returns(effectiveStructure);
        const unpackVariants = stub(TransformUtils, 'unpackVariants').returns(variants);
        stub(TransformUtils, 'remap').returns(remapped);

        const result = ProductTransformer.transform(product, structure);

        expect(result).to.eql({ data: { g: 'h', k: 'l' }, variants: [{ g: 'h', k: 'l' }, { g: 'h', m: 'n' }] });
        expect(extendStructure).to.be.calledWith(product, product, { c: 'd' });
        // tslint:disable-next-line max-line-length
        expect(unpackVariants).to.be.calledWith(variantInfo, product, remapped, { c: 'd' }, DEFAULT_TRANSFORM);
      });

      it('should apply user transform to variant data', () => {
        const effectiveStructure = { a: 'b' };
        const variantInfo = { i: 'j' };
        const transformedProduct = { o: 'p' };
        const userTransform = spy(() => transformedProduct);
        const structure: any = { c: 'd', _variant: variantInfo, _transform: userTransform };
        const product: any = { e: 'f' };
        const remapped: any = { g: 'h' };
        const unpackVariants = stub(TransformUtils, 'unpackVariants').returns([{ k: 'l' }, { m: 'n' }]);
        stub(TransformUtils, 'extendStructure').returns(effectiveStructure);
        stub(TransformUtils, 'remap').returns(remapped);

        ProductTransformer.transform(product, structure);

        // tslint:disable-next-line max-line-length
        expect(unpackVariants).to.be.calledWith(variantInfo, transformedProduct, remapped, { c: 'd' }, userTransform);
      });
    });
  });

  describe('TransformUtils', () => {
    describe('extendStructure()', () => {
      it('should add new keys from transformedProduct to the structure', () => {
        const original = { a: 'b', e: 'f' };
        const transformed = { a: 'i', c: 'd', e: 'j', g: 'h' };
        const structure: any = { k: 'l', m: 'n' };

        const extended = TransformUtils.extendStructure(original, transformed, structure);

        expect(extended).to.eql({ k: 'l', m: 'n', c: 'c', g: 'g' });
      });
    });

    describe('remap()', () => {
      it('should remap paths from product based on structure', () => {
        const data: any = { a: 'b', c: 'd', e: 'j' };
        const defaults = { c: 'e', f: 'g', h: 'i' };
        const structure: any = { k: 'a', l: 'c', m: 'f' };

        const remapped = TransformUtils.remap(data, structure, defaults);

        expect(remapped).to.eql({ k: 'b', l: 'd', m: 'g' });
      });
    });
  });
});
