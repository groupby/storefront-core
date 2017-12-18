import UrlBeautifier from '.';
import DetailsUrlGenerator from './details/generator';
import DetailsUrlParser from './details/parser';
import NavigationUrlGenerator from './navigation/generator';
import NavigationUrlParser from './navigation/parser';
import PastPurchaseUrlGenerator from './pastPurchase/generator';
import PastPurchaseUrlParser from './pastPurchase/parser';
import SearchUrlGenerator from './search/generator';
import SearchUrlParser from './search/parser';

namespace BeautifierFactory {
  export function create(beautifier: UrlBeautifier): UrlBeautifier.Beautifiers {
    return {
      search: this.makeUrlHandler(beautifier, SearchUrlParser, SearchUrlGenerator),
      pastpurchase: this.makeUrlHandler(beautifier, PastPurchaseUrlParser, PastPurchaseUrlGenerator),
      navigation: this.makeUrlHandler(beautifier, NavigationUrlParser, NavigationUrlGenerator),
      details: this.makeUrlHandler(beautifier, DetailsUrlParser, DetailsUrlGenerator),
    };
  }

  export function makeUrlHandler(beautifier: UrlBeautifier, urlParser: any, urlGenerator: any) {
    return {
      parse: (new urlParser(beautifier)).parse,
      build: (new urlGenerator(beautifier)).build,
    };
  }
}

export default BeautifierFactory;
