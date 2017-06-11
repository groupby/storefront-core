import DetailsUrlParser from '../../../../../src/core/url-beautifier/details/parser';
import { UrlParser } from '../../../../../src/core/url-beautifier/handler';
import suite, { refinement } from '../../../_suite';

suite('DetailsUrlParser', ({ expect }) => {
  let parser: DetailsUrlParser;

  beforeEach(() => parser = new DetailsUrlParser(<any>{ config: { refinementMapping: [] } }));

  it('should extend UrlParser', () => {
    expect(parser).to.be.an.instanceOf(UrlParser);
  });

  it('should parse a simple URL and return a detail object', () => {
    const expectedDetail = {
      title: 'apples',
      id: '1923',
      refinements: []
    };

    expect(parser.parse('/apples/1923')).to.eql(expectedDetail);
  });

  it('should parse a simple URL, replace \'-\' with \' \' and return a detail object', () => {
    const expectedDetail = {
      title: 'red and delicious apples',
      id: '1923',
      refinements: []
    };

    expect(parser.parse('/red-and-delicious-apples/1923')).to.eql(expectedDetail);
  });

  it('should parse a simple URL, decode special characters and return a detail object', () => {
    const expectedDetail = {
      title: 'red+and+delicious+apples',
      id: '1923',
      refinements: []
    };

    expect(parser.parse('/red%2Band%2Bdelicious%2Bapples/1923')).to.eql(expectedDetail);
  });

  it('should parse a URL with navigation names and values and return a detail object without reference keys', () => {
    parser.config.useReferenceKeys = false;
    const expectedDetail = {
      title: 'satin shiny party dress',
      id: '293014',
      refinements: [refinement('colour', 'blue')]
    };

    expect(parser.parse('/satin-shiny-party-dress/blue/colour/293014')).to.eql(expectedDetail);
  });

  it('should decode special characters in navigation name and values', () => {
    parser.config.useReferenceKeys = false;
    const url = '/satin-shiny-party-dress/h%26m/brand/blue/colour/red/colour/293014';
    const expectedDetail = {
      title: 'satin shiny party dress',
      id: '293014',
      refinements: [refinement('brand', 'h&m'), refinement('colour', 'blue'), refinement('colour', 'red')]
    };

    expect(parser.parse(url)).to.eql(expectedDetail);
  });

  it('should parse a URL with reference keys', () => {
    parser.config.refinementMapping = [{ c: 'colour' }, { b: 'brand' }];
    parser.config.useReferenceKeys = true;
    const expectedDetail = {
      title: 'dress',
      id: '293014',
      refinements: [refinement('brand', 'h&m'), refinement('colour', 'blue'), refinement('colour', 'red')]
    };

    const parsed = parser.parse('/dress/h%26m/blue/red/bcc/293014');

    expect(parsed.id).to.eql(expectedDetail.id);
    expect(parsed.title).to.eql(expectedDetail.title);
    expect(parsed.refinements).to.eql(expectedDetail.refinements);
  });

  describe('error states', () => {
    it('should throw an error if the path has less than two parts', () => {
      expect(() => parser.parse('/dress')).to.throw('path has fewer than two parts');
    });

    it('should throw an error if the path without reference keys has an odd number of parts', () => {
      parser.config.useReferenceKeys = false;

      expect(() => parser.parse('/dress/blue/colour/red/293014'))
        .to.throw('path has an odd number of parts');
    });

    it('should throw an error if the path has wrong number of parts', () => {
      expect(() => parser.parse('/shoe/blue/colour')).to.throw('path has an odd number of parts');
    });

    it('should throw an error if token reference is invalid', () => {
      parser.config.useReferenceKeys = true;

      expect(() => parser.parse('/apples/green/cs/2931')).to.throw('token reference is invalid');
    });
  });
});
