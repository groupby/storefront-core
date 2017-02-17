import StoreFront from '../storefront';

export namespace Structure {
  export interface Base {
    id: string;
    title: string;
    price: string;

    url?: string;
  }

  export interface Tranformable extends Base {
    _transform?: (metadata: any) => any;
  }

  export interface Variant {
    field: string;
    structure: Partial<Structure.Tranformable>;
  }
}

export interface Structure extends Structure.Tranformable {
  _variant?: Partial<Structure.Variant>;
}

export namespace Service {
  export namespace Constructor {
    export type Map = { [key: string]: Constructor };
  }

  export interface Constructor {
    new (app: StoreFront, config: any): Service;
  }

  export type Map = { [key: string]: Service };

  export type Options<T> = Service.Constructor | T | false;
}

export interface Service {
  init(services: Service.Map): void;
}
