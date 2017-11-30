import { Selectors as FluxSelectors, Store } from '@storefront/flux-capacitor';
import Configuration from './configuration';
import ProductTransformer from './product-transformer';

namespace Selectors {
  export const productTransformer = (state: Store.State) => {
    const config: Partial<Configuration> = FluxSelectors.config(state);

    return ProductTransformer.transformer(config.structure);
  };

  export const transformedProducts = (state: Store.State) => {
    const config: Partial<Configuration> = FluxSelectors.config(state);

    return FluxSelectors.productsWithPastPurchase(state, config.recommendations.idField)
      .map(({ data, meta }) => ({ ...productTransformer(state)(data), meta }));
  };

  export const transformedDetailsProduct = (state: Store.State) => {
    const details: Store.Details = FluxSelectors.details(state);

    if (details && details.data) {
      return productTransformer(state)(details.data);
    }
  };

  export const transformedRecommendationsProducts = (state: Store.State) => {
    return FluxSelectors.recommendationsProducts(state).map(productTransformer(state));
  };
}

export default Selectors;