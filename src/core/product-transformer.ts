import { Store } from '@storefront/flux-capacitor';
import { Structure } from './types';
import { clone, dot } from './utils';

export const DEFAULT_VARIANT_FIELD = 'variants';
export const DEFAULT_TRANSFORM = (data) => data;

// structure only picks from un-transformed product
// any keys the user adds will also be added by default
// otherwise there must be a structure mapping
// assume variant is of the same form as product, so use base structure as defaults
namespace ProductTransformer {

  export function transformer(structure: Structure) {
    return (product: Store.Product) => ProductTransformer.transform(product, structure);
  }

  export function transform(product: Store.Product, structure: Structure) {
    const { _transform: userTransform = DEFAULT_TRANSFORM, _variant: variantInfo, ...baseStructure } = structure;
    const transformedProduct = userTransform(clone(product, false)) || product;
    const effectiveStructure = Utils.extendStructure(product, transformedProduct, baseStructure);
    const data = Utils.remap(transformedProduct, effectiveStructure);

    if (variantInfo) {
      // tslint:disable-next-line max-line-length
      const variants = Utils.unpackVariants(variantInfo, transformedProduct, data, baseStructure, userTransform)
        .map((variant) => ({ ...data, ...variant }));

      return { data: variants[0], variants };
    } else {
      return { data, variants: [data] };
    }
  }
}

export default ProductTransformer;

namespace Utils {
  // tslint:disable-next-line max-line-length
  export function unpackVariants(variantInfo: Partial<Structure.Variant>, product: any, remappedProduct: any, baseStructure: Structure.Base, defaultTransform: (data: any) => any) {
    const { field = DEFAULT_VARIANT_FIELD, structure = {} } = variantInfo;
    const variants = dot.get(product, field);

    if (variants) {
      const { _transform: transform = <any>defaultTransform, ...variantStructure } = { ...baseStructure, ...structure };

      return variants
        .map((variant, index) => transform({ ...variant }, index, product) || variant)
        .map((transformed, index) => {
          const effectiveStructure = Utils.extendStructure(variants[index], transformed, variantStructure);
          return Utils.remap(transformed, effectiveStructure, remappedProduct);
        });
    } else {
      return [{}];
    }
  }

  export function extendStructure(originalData: any, transformedData: any, structure: Structure.Base) {
    const newKeys = Object.keys(transformedData).filter((key) => !(key in originalData));
    return newKeys.reduce((struct, key) => Object.assign(struct, { [key]: key }), { ...structure });
  }

  export function remap(product: Store.Product, structure: Partial<Structure>, defaults: any = {}) {
    return Object.keys(structure)
      .reduce((data, key) => Object.assign(data, {
        [key]: dot.get(product, structure[key], defaults[structure[key]])
      }), {});
  }
}

export { Utils as TransformUtils };
