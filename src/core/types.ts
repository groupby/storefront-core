import { TagMixin } from 'riot';
import StoreFront from '../storefront';

export namespace Structure {
  export interface Base {
    id: string;
    title: string;
    price: string;

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

export type GlobalMixin = TagMixin & {
  shouldUpdate?: boolean | ((data: object, nextOpts: object) => boolean);
};

export interface CustomMixins {
  [key: string]: TagMixin;
}
