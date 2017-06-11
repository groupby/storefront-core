import UrlBeautifier from '../../../../src/core/url-beautifier';
import * as DetailsGenerator from '../../../../src/core/url-beautifier/details/generator';
import * as DetailsParser from '../../../../src/core/url-beautifier/details/parser';
import Factory from '../../../../src/core/url-beautifier/factory';
import * as NavigationGenerator from '../../../../src/core/url-beautifier/navigation/generator';
import * as NavigationParser from '../../../../src/core/url-beautifier/navigation/parser';
import * as SearchGenerator from '../../../../src/core/url-beautifier/search/generator';
import * as SearchParser from '../../../../src/core/url-beautifier/search/parser';
import suite, { refinement } from '../../_suite';

const URL_BEAUTIFIER: any = { a: 'b' };
suite('BeautifierFactory', ({ expect, stub }) => {
  let config: any;

  beforeEach(() => config = URL_BEAUTIFIER.config = {});

  describe('create()', () => {
    it('should create all beautifiers', () => {
      const detailsGenerator = { build: () => null };
      const detailsParser = { parse: () => null };
      const navigationGenerator = { build: () => null };
      const navigationParser = { parse: () => null };
      const searchGenerator = { build: () => null };
      const searchParser = { parse: () => null };
      const detailsGeneratorStub = stub(DetailsGenerator, 'default').returns(detailsGenerator);
      const detailsParserStub = stub(DetailsParser, 'default').returns(detailsParser);
      const navigationGeneratorStub = stub(NavigationGenerator, 'default').returns(navigationGenerator);
      const navigationParserStub = stub(NavigationParser, 'default').returns(navigationParser);
      const searchGeneratorStub = stub(SearchGenerator, 'default').returns(searchGenerator);
      const searchParserStub = stub(SearchParser, 'default').returns(searchParser);

      const beautifiers = Factory.create(URL_BEAUTIFIER);

      expect(beautifiers).to.eql({
        details: {
          parse: detailsParser.parse,
          build: detailsGenerator.build,
        },
        navigation: {
          parse: navigationParser.parse,
          build: navigationGenerator.build,
        },
        search: {
          parse: searchParser.parse,
          build: searchGenerator.build,
        }
      });
      expect(detailsGeneratorStub).to.be.calledWith(URL_BEAUTIFIER);
      expect(detailsParserStub).to.be.calledWith(URL_BEAUTIFIER);
      expect(navigationGeneratorStub).to.be.calledWith(URL_BEAUTIFIER);
      expect(navigationParserStub).to.be.calledWith(URL_BEAUTIFIER);
      expect(searchGeneratorStub).to.be.calledWith(URL_BEAUTIFIER);
      expect(searchParserStub).to.be.calledWith(URL_BEAUTIFIER);
    });
  });

  describe('compatibility', () => {
    describe('details', () => {
      const request = {
        title: 'dress',
        id: '293014',
        refinements: [
          refinement('brand', 'h&m'),
          refinement('colour', 'blue'),
          refinement('colour', 'red')
        ]
      };
      let generator;
      let parser;

      beforeEach(() => {
        generator = new DetailsGenerator.default(URL_BEAUTIFIER);
        parser = new DetailsParser.default(URL_BEAUTIFIER);
      });

      it('should convert from detail object to a URL and back with reference keys', () => {
        config.refinementMapping = [{ c: 'colour' }, { b: 'brand' }];

        expect(parser.parse(generator.build(request))).to.eql(request);
      });

      it('should convert from URL to a detail and back with reference keys', () => {
        const url = '/dress/h%26m/blue/red/bcc/293014';
        config.refinementMapping = [{ c: 'colour' }, { b: 'brand' }];

        expect(generator.build(parser.parse(url))).to.eq(url);
      });

      it('should convert from detail object to a URL and back without reference keys', () => {
        config.useReferenceKeys = false;

        expect(parser.parse(generator.build(request))).to.eql(request);
      });

      it('should convert from URL to a detail and back without reference keys', () => {
        const url = '/dress/h%26m/brand/blue/colour/red/colour/293014';
        config.useReferenceKeys = false;

        expect(generator.build(parser.parse(url))).to.eq(url);
      });
    });

    describe('search', () => {
      const request = {
        query: 'dress',
        refinements: [refinement('brand', 'h&m')]
      };
      let generator;
      let parser;

      beforeEach(() => {
        generator = new SearchGenerator.default(URL_BEAUTIFIER);
        parser = new SearchParser.default(URL_BEAUTIFIER);
      });

      it('should convert from query object to a URL and back with reference keys', () => {
        config.params = { refinements: 'refinements' };
        config.refinementMapping = [{ b: 'brand' }];
        config.useReferenceKeys = true;
        config.queryToken = 's';

        expect(parser.parse(generator.build(request))).to.eql(request);
      });

      it('should convert from URL to a query and back with reference keys', () => {
        const url = '/dress/h%26m/qb';
        config.params = { refinements: 'refinements' };
        config.refinementMapping = [{ b: 'brand' }];
        config.useReferenceKeys = true;
        config.queryToken = 'q';

        expect(generator.build(parser.parse(url))).to.eq(url);
      });

      it('should convert from query object to a URL and back without reference keys', () => {
        config.params = { refinements: 'refinements' };

        expect(parser.parse(generator.build(request))).to.eql(request);
      });

      it('should convert from URL to a query and back without reference keys', () => {
        const url = '/dress/h%26m/brand';
        config.params = { refinements: 'refinements' };

        expect(generator.build(parser.parse(url))).to.eq(url);
      });
    });
  });
});
