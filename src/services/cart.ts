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
    this.app.flux.on(Events.CART_ID_UPDATED, this.writeToCookie);
  }

  createCart = () => {
    const { visitorId, sessionId } = this.readCookie();

    this.app.flux.createCart(visitorId, sessionId);
  }

  writeToCookie = (cartId: string) => {
    Cookie.set('gb_cartId', cartId);
  }

  readCookie = () => {
    const cookies = WINDOW().document.cookie;
    // if (this in cookies)

    // need to get cart
    const { cart } = this.app.flux.store.getState().data.present;
    // const { cartId } = this.app.flux.selectors.cart;
    const sessionId = Cookie.get('gbi_sessionId');
    const visitorId = Cookie.get('gbi_visitorId');
    return { visitorId, sessionId };
  }

}

export default CartService;
