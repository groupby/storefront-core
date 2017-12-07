import FluxCapacitor, { Events, Selectors, Store } from '@storefront/flux-capacitor';
import * as Cookie from 'js-cookie';
import { core } from '../core/service';
import LazyService from '../core/service/lazy';
import Tag from '../core/tag';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';

@core
class CartService extends LazyService {
  lazyInit() {
    this.app.flux.on(Events.CREATE_CART, this.createCart);
  }

  createCart = () => {
    console.log('create');
    const { visitorId, sessionId } = this.readCookie();

    this.app.flux.createCart(visitorId, sessionId);
  }

  readCookie = () => {

    const  { visitorId, sessionId }  = this.app.flux.store.getState().data.present.cart;
    return { visitorId, sessionId };
  }

}

export default CartService;
