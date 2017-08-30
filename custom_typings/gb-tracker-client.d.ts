declare module 'gb-tracker-client/slim' {
  class TrackerClient {
    constructor(customerId: string, area: string);

    enableWarnings(): void;
    disableWarnings(): void;
    setStrictMode(strict: boolean): void;

    autoSetVisitor(visitorId?: string): void;
    setVisitor(visitorId: any, sessionId: any): void;
    getVisitorId(): string;
    getSessionId(): string;
    getLoginId(): string;

    setInvalidEventCallback(cb: () => void): void;

    sendAddToCartEvent(data: TrackerClient.CartEvent): void;
    sendViewCartEvent(data: TrackerClient.CartEvent): void;
    sendRemoveFromCartEvent(data: TrackerClient.CartEvent): void;
    sendOrderEvent(data: TrackerClient.OrderEvent): void;
    sendSearchEvent(data: TrackerClient.SearchEvent): void;
    sendAutoSearchEvent(data: TrackerClient.SearchEvent): void;
    sendViewProductEvent(data: TrackerClient.ViewProductEvent): void;
  }
  namespace TrackerClient {
    export const SESSION_COOKIE_KEY: string;
    export const VISITOR_COOKIE_KEY: string;
    export const SESSION_TIMEOUT_SEC: number;
    export const VERSION: string;
    export const VERSION_TIMEOUT_SEC: number;

    export interface Metadata {
      key: string;
      value: string;
    }

    export interface Product {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      collection?: string;
      category?: string;
      sku?: string;
      margin?: number;
      metadata?: Metadata[];
    }

    export interface SearchEvent {
      search: {
        id: string;
        origin: {
          recommendations?: boolean;
          dym?: boolean;
          sayt?: boolean;
          search?: boolean;
          autosearch?: boolean;
          navigation?: boolean;
          collectionSwitcher?: boolean;
        };
      };
      metadata?: Metadata[];
    }

    export interface CartEvent {
      cart: {
        id?: string;
        items: Product[];
        metadata?: Metadata[];
      };
      metadata?: Metadata[];
    }

    export interface OrderEvent {
      cart: {
        id?: string;
        totalItems?: number;
        items: Product[];
        metadata?: Metadata[];
      };
      metadata?: Metadata[];
    }

    export interface ViewProductEvent {
      product: Product;
      metadata?: Metadata[];
    }
  }

  export = TrackerClient;
}
