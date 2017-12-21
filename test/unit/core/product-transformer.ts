// tslint:disable-next-line max-line-length
import ProductTransformer, { DEFAULT_TRANSFORM, DEFAULT_VARIANT_FIELD, TransformUtils } from '../../../src/core/product-transformer';
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
        const userTransform = spy(() => ({ e: 'f' }));
        const product: any = { c: 'd' };
        const cloned = { g: 'h' };
        const structure: any = { a: 'b', _transform: userTransform };
        const extendStructure = stub(TransformUtils, 'extendStructure');
        const clone = stub(utils, 'clone').returns(cloned);
        stub(TransformUtils, 'remap');

        ProductTransformer.transform(product, structure);

        expect(clone).to.be.calledWith(product);
        expect(userTransform).to.be.calledWith(cloned);
        expect(extendStructure).to.be.calledWith(product, { c: 'd', e: 'f' }, structure);
      });

      it('should use empty object if user transform returns falsy', () => {
        const product: any = { c: 'd' };
        const structure: any = { a: 'b', _transform: () => null };
        const extendStructure = stub(TransformUtils, 'extendStructure');
        stub(TransformUtils, 'remap');

        ProductTransformer.transform(product, structure);

        expect(extendStructure).to.be.calledWith(product, product, structure);
      });

      it('should unpack variant data', () => {
        const variantInfo = { i: 'j' };
        const product: any = { e: 'f' };
        const remapped: any = { g: 'h' };
        const extendStructure = stub(TransformUtils, 'extendStructure').returns({ a: 'b' });
        const unpackVariants = stub(TransformUtils, 'unpackVariants').returns([{ k: 'l' }, { m: 'n' }]);
        stub(TransformUtils, 'remap').returns(remapped);
        stub(TransformUtils, 'combineData').callsFake((x, y) => ({...x, ...y}));

        const result = ProductTransformer.transform(product, <any>{ c: 'd', _variant: variantInfo });

        expect(result).to.eql({ data: { g: 'h', k: 'l' }, variants: [{ g: 'h', k: 'l' }, { g: 'h', m: 'n' }] });
        expect(extendStructure).to.be.calledWith(product, product, { c: 'd' });
        // tslint:disable-next-line max-line-length
        expect(unpackVariants).to.be.calledWith(variantInfo, product, remapped, { c: 'd' });
      });

      it('should apply user transform to variant data', () => {
        const variantInfo = { i: 'j' };
        const product: any = { e: 'f' };
        const remapped: any = { g: 'h' };
        const unpackVariants = stub(TransformUtils, 'unpackVariants').returns([{ k: 'l' }, { m: 'n' }]);
        stub(TransformUtils, 'extendStructure');
        stub(TransformUtils, 'remap').returns(remapped);

        ProductTransformer.transform(product, <any>{ c: 'd', _variant: variantInfo });

        // tslint:disable-next-line max-line-length
        expect(unpackVariants).to.be.calledWith(variantInfo, product, remapped, { c: 'd' });
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

    describe('combineData()', () => {
      it('should overwrite values of data with values of variant', () => {
        const data = { a: 'b', e: 'f', x: 'y' };
        const variant = { a: 'i', e: 'j' };

        const newData = TransformUtils.combineData(data, variant);

        expect(newData).to.eql({ a: 'i', e: 'j', x: 'y' });
      });

      it('should not overwrite values of data with undefined values of variant', () => {
        const data = { a: 'b', e: 'f', x: 'y' };
        const variant = { a: 'i', e: undefined };

        const newData = TransformUtils.combineData(data, variant);

        expect(newData).to.eql({ a: 'i', e: 'f', x: 'y' });
      });
    });

    describe('remap()', () => {
      it('should remap paths from product based on structure', () => {
        const data = { a: 'b', c: 'd', e: 'j' };
        const defaults = { c: 'e', f: 'g', h: 'i' };
        const structure: any = { k: 'a', l: 'c', m: 'f' };

        const remapped = TransformUtils.remap(data, structure, defaults);

        expect(remapped).to.eql({ k: 'b', l: 'd', m: 'g' });
      });

      it('should ignore non-string values', () => {
        const structure: any = { x: false, y: {}, z: () => null };

        expect(() => TransformUtils.remap({}, structure, {})).to.not.throw();
      });
    });

    describe('unpackVariants()', () => {
      it('should return an empty array if no variants found', () => {
        const product = { a: 'b' };
        const get = stub(utils.dot, 'get');

        const unpacked = TransformUtils.unpackVariants({}, product, {}, <any>{});

        expect(get).to.be.calledWithExactly(product, DEFAULT_VARIANT_FIELD);
        expect(unpacked).to.eql([{}]);
      });

      it('should transform and remap variants from structure', () => {
        const variants = [{ c: 'd' }, { e: 'f' }];
        const remappedVariant1 = { g: 'h' };
        const remappedVariant2 = { i: 'j' };
        const product = { a: 'b' };
        const remappedProduct = { k: 'l' };
        const get = stub(utils.dot, 'get').returns(variants);
        const remapper = stub();
        const remapVariant = stub(TransformUtils, 'remapVariant').returns(remapper);
        remapper.withArgs(variants[0]).returns(remappedVariant1);
        remapper.withArgs(variants[1]).returns(remappedVariant2);

        const unpacked = TransformUtils.unpackVariants({
          structure: <any>{ m: 'n', _transform: () => null }
        }, product, remappedProduct, <any>{});

        expect(get).to.be.calledWithExactly(product, DEFAULT_VARIANT_FIELD);
        expect(unpacked).to.eql([remappedVariant1, remappedVariant2]);
        expect(remapVariant).to.be.calledWithExactly(remappedProduct, variants, { m: 'n' });
      });

      it('should use variant transform if provided', () => {
        const variant1 = { c: 'd' };
        const variant2 = { e: 'f' };
        const product = { a: 'b' };
        const transform = spy();
        stub(utils.dot, 'get').returns([variant1, variant2]);
        stub(TransformUtils, 'remapVariant').returns(() => null);

        TransformUtils.unpackVariants({ structure: { _transform: transform } }, product, {}, <any>{});

        expect(transform).to.be.calledWithExactly(variant1, 0, product)
          .and.calledWithExactly(variant2, 1, product);
      });

      it('should default to base transform if none found', () => {
        const variant1 = { c: 'd' };
        const variant2 = { e: 'f' };
        const product = { a: 'b' };
        const transform = spy();
        stub(utils.dot, 'get').returns([variant1, variant2]);
        stub(TransformUtils, 'remapVariant').returns(() => null);

        TransformUtils.unpackVariants({}, product, {}, <any>{ _transform: transform });

        expect(transform).to.be.calledWithExactly(variant1, 0, product)
          .and.calledWithExactly(variant2, 1, product);
      });

      it('should handle falsey transform result', () => {
        const variant1 = { c: 'd' };
        const variant2 = { e: 'f' };
        const product = { a: 'b' };
        const remapper = spy();
        stub(utils.dot, 'get').returns([variant1, variant2]);
        stub(TransformUtils, 'remapVariant').returns(remapper);

        TransformUtils.unpackVariants({}, product, {}, <any>{ _transform: () => null });

        expect(remapper).to.be.calledWith(variant1, 0)
          .and.calledWith(variant2, 1);
      });
    });

    describe('remapVariant()', () => {
      it('should call remap with extended structure', () => {
        const baseProduct = { a: 'b' };
        const variants = [{}, { c: 'd' }, {}];
        const structure: any = { e: 'f' };
        const transformed = { g: 'h' };
        const effectiveStructure = { i: 'j' };
        const extendStructure = stub(TransformUtils, 'extendStructure').returns(effectiveStructure);
        const remap = stub(TransformUtils, 'remap');

        const transform = TransformUtils.remapVariant(baseProduct, variants, structure);
        transform(transformed, 1);

        expect(extendStructure).to.be.calledWithExactly(variants[1], transformed, structure);
        expect(remap).to.be.calledWithExactly(transformed, effectiveStructure, baseProduct);
      });
    });
  });
});
