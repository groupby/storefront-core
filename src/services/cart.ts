import FluxCapacitor, { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/service';
import LazyService from '../core/service/lazy';
import Tag from '../core/tag';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';

@core
class CartService extends LazyService {

  lazyInit() {
    console.log('lazy init')
    this.app.flux.on(Events.CREATE_CART, this.createCart);
  }

  createCart = () => {
    //get visitorId and sessionId from tracker
    console.log('creating')
    this.readCookie();
    
    const visitorId = 'visitorId';
    const sessionId = 'sessionId';
    this.app.flux.createCart(visitorId, sessionId);
  }

  readCookie = () => {
    const cookies = new Window().document.cookie;
    const sessionId = cookies.slice(14, 39);
    const visitorId = cookies.slice(55);
    
    console.log('visitor', visitorId, sessionId);
  }

}

export default CartService;
