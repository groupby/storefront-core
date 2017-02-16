import { Request } from 'groupby-api';
import Service from './services/service';

export interface Configuration {
  customerId: string;
  structure: Structure;

  collection?: string;
  area?: string;
  language?: string;
  visitorId?: string;
  sessionId?: string;

  tags?: { [key: string]: any };

  services?: { [key: string]: Service<any> };

  query?: Partial<Request>;

  stylish?: boolean;
  initialSearch?: boolean;
  simpleAttach?: boolean;
}

export interface SimpleStructure {
  title: string;
  price: string;
  id?: string;
  url?: string;

  _transform?: (metadata: any) => any;
}

export interface Structure extends SimpleStructure {
  _variant?: {
    field: string;
    structure?: Partial<SimpleStructure>;
  };
}

export interface Configurable<T> { }
