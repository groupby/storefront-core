import { TagMixin } from 'riot';
import StoreFront from '../storefront';

export namespace Structure {
  export interface Base {
    /**
     * The record field that contains the product ID.
     */
    id: string;
    /**
     * The record field that contains the product title.
     */
    title: string;
    /**
     * The record field that contains the product price.
     */
    price: string;

    /**
     * The record field that contains the product URL.
     */
    url?: string;
  }

  export interface Tranformable<T> extends Base {
    _transform?: T;
  }

  export interface Variant {
    field: string;
    structure: Partial<Structure.Tranformable<(variantData: any, index: number, baseData: any) => any>>;
  }
}

export interface Structure extends Structure.Tranformable<(data: any) => any> {
  _variant?: Partial<Structure.Variant>;
}

/**
 * The type of the `shouldUpdate` function. This function is used to determine if a component should perform an update.
 *
 * @param data An object with a property called `state` that contains the component's state.
 * @param nextOpts An object that contains the component's props.
 * @return `true` if the component should update, `false` otherwise.
 */
export type ShouldUpdateFunction = ((data: object, nextOpts: object) => boolean);

export interface GlobalMixin extends TagMixin {
  /**
   * The function to use when determining if a component should update.
   *
   * * If `true`, use the function provided by StoreFront, which allows a
   *   component to update only if its props, state or aliases have changed.
   * * If `false`, do not use a `shouldUpdate` function. Components will always update.
   * * If a function is provided, use the given function.
   */
  shouldUpdate?: boolean | ShouldUpdateFunction;
}

/**
 * A collection of named mixins, where the property name is the name of the mixin.
 */
export interface CustomMixins {
  [key: string]: TagMixin;
}
