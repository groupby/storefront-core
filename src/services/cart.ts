import FluxCapacitor, {
  Events,
  Selectors,
  Store
} from "@storefront/flux-capacitor";
import { core } from "../core/service";
import LazyService from "../core/service/lazy";
import Tag from "../core/tag";
import { WINDOW } from "../core/utils";
import StoreFront from "../storefront";
import * as Cookie from "js-cookie";
@core
class CartService extends LazyService {
  lazyInit() {
    this.app.flux.on(Events.CREATE_CART, this.createCart);
  }

  createCart = () => {
    const { visitorId, sessionId } = this.readCookie();

    this.app.flux.createCart(visitorId, sessionId);
  };

  readCookie = () => {
    const cookies = WINDOW().document.cookie;
    const sessionId = Cookie.get("gbi_sessionId");
    const visitorId = Cookie.get("gbi_visitorId");
    return { visitorId, sessionId }
  };
}

export default CartService;
