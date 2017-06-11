import UrlBeautifier from '.';
import DetailsUrlGenerator from './details/generator';
import DetailsUrlParser from './details/parser';
import NavigationUrlGenerator from './navigation/generator';
import NavigationUrlParser from './navigation/parser';
import SearchUrlGenerator from './search/generator';
import SearchUrlParser from './search/parser';

namespace BeautifierFactory {
  export function create(beautifier: UrlBeautifier): UrlBeautifier.Beautifiers {
    const detailsParser = new DetailsUrlParser(beautifier);
    const detailsGenerator = new DetailsUrlGenerator(beautifier);
    const navigationParser = new NavigationUrlParser(beautifier);
    const navigationGenerator = new NavigationUrlGenerator(beautifier);
    const searchParser = new SearchUrlParser(beautifier);
    const searchGenerator = new SearchUrlGenerator(beautifier);

    return {
      search: {
        parse: searchParser.parse,
        build: searchGenerator.build
      },
      navigation: {
        parse: navigationParser.parse,
        build: navigationGenerator.build
      },
      details: {
        parse: detailsParser.parse,
        build: detailsGenerator.build
      }
    };
  }
}

export default BeautifierFactory;
