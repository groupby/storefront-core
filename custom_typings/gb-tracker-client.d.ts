declare module 'gb-tracker-client' {
  interface TrackerClient {
    enableWarnings(): void;
    disableWarnings(): void;
    setStrictMode(): void;

    sendAutoSearchEvent(data: any): void;
    sendAddToCartEvent(data: any): void;
    sendOrderEvent(data: any): void;
    sendSearchEvent(data: any): void;
    sendViewProductEvent(data: any): void;
    setVisitor(visitorId: any, sessionId: any): void;
    new (customerId: any, area: any);
  }

  const gbTracker: TrackerClient;

  export = gbTracker;
}
