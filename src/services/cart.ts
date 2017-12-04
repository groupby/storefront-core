import FluxCapacitor, { Actions, ActionCreators, Events, Selectors, Store } from '@storefront/flux-capacitor';
import * as Cookie from 'js-cookie';
import { core } from '../core/service';
import LazyService from '../core/service/lazy';
import Tag from '../core/tag';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';

@core
class CartService extends LazyService {
  lazyInit() {
    // this.app.flux.on(Events.ADD_TO_CART, this.addToCart);
  }

  addToCart = () => {
      // this.app.flux.store.dispatch(ActionCreators.addToCart, );
  }
}

export default CartService;