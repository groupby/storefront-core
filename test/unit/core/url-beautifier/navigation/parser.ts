import { UrlParser } from '../../../../../src/core/url-beautifier/handler';
import NavigationUrlParser from '../../../../../src/core/url-beautifier/navigation/parser';
import suite, { refinement } from '../../../_suite';

const QUERY = { a: 'b' };

suite('NavigationUrlParser', ({ expect }) => {
  let config: any;
  let parser: NavigationUrlParser;

  beforeEach(() => {
    config = { navigations: { Apples: QUERY } };
    parser = new NavigationUrlParser(<any>{ config });
  });

  it('should extend UrlParser', () => {
    expect(parser).to.be.an.instanceOf(UrlParser);
  });

  it('should parse URL and return the associated query', () => {
    expect(parser.parse('/Apples')).to.be.eql(QUERY);
  });

  it('should parse URL with encoded characters', () => {
    const navigationName = 'Red apples/cherries';
    config.navigations[navigationName] = QUERY;

    expect(parser.parse('/Red-apples%2Fcherries')).to.be.eql(QUERY);
  });

  it('should parse URL with hyphen', () => {
    const navigationName = 'Red apples';
    config.navigations[navigationName] = QUERY;

    expect(parser.parse('/' + encodeURIComponent(navigationName))).to.be.eql(QUERY);
  });

  describe('error states', () => {
    it('should parse URL and throw an error if associated query is not found', () => {
      expect(() => parser.parse('/Orange')).to.throw('no navigation mapping found for Orange');
    });

    it('should parse URL and throw an error if the path has more than one part', () => {
      expect(() => parser.parse('/Apples/Orange')).to.throw('path contains more than one part');
    });
  });
});
