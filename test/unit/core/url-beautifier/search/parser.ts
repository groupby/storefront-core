import { UrlParser } from '../../../../../src/core/url-beautifier/handler';
import SearchUrlParser from '../../../../../src/core/url-beautifier/search/parser';
import suite, { refinement } from '../../../_suite';
import * as utils from '../../../../../src/core/url-beautifier/utils';

const QUERY = { a: 'b' };

suite('SearchUrlParser', ({ expect }) => {
  let config: any;
  let parser: SearchUrlParser;

  beforeEach(() => {
    config = {
      params: {
        page: 'page',
        pageSize: 'page_size',
        refinements: 'refinements',
        sort: 'sort',
        collection: 'collection'
      },
      queryToken: 'q',
      refinementMapping: [],
      suffix: 'index.html'
    };
    parser = new SearchUrlParser(<any>{ config });
  });

  it('should parse simple query URL', () => {
    config.useReferenceKeys = true;

    expect(parser.parse('/apples/q').query).to.eq('apples');
  });

  it('should parse URL with a slash in the query', () => {
    config.useReferenceKeys = true;

    expect(parser.parse('/red%2Fapples/q').query).to.eq('red/apples');
  });

  it('should parse URL with a plus in the query', () => {
    config.useReferenceKeys = true;

    expect(parser.parse('/red%2Bapples/q').query).to.eq('red+apples');
  });

  it('should parse simple query URL with dash and without reference keys', () => {
    expect(parser.parse('/red-apples').query).to.eq('red apples');
  });

  it('should parse simple query URL with custom token', () => {
    config.useReferenceKeys = true;
    config.queryToken = 'c';

    expect(parser.parse('/sneakers/c').query).to.eq('sneakers');
  });

  it('should extract a value refinement from URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ c: 'colour' }];

    expect(parser.parse('/green/c').refinements).to.eql([refinement('colour', 'green')]);
  });

  it('should extract a multiple value refinements for field from URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ c: 'colour' }];

    expect(parser.parse('/green/blue/cc?sort=test:true')).to.eql({
      query: undefined,
      refinements: [
        refinement('colour', 'green'),
        refinement('colour', 'blue')
      ],
      sort: { field: 'test', descending: true }
    });
  });

  it('should extract a value refinement with a slash from URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ b: 'brand' }];

    expect(parser.parse('/De%2FWalt/b').refinements).to.eql([refinement('brand', 'De/Walt')]);
  });

  it('should extract a value refinement with a plus from URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ b: 'brand' }];

    expect(parser.parse('/De%2BWalt/b').refinements).to.eql([refinement('brand', 'De+Walt')]);
  });

  it('should extract a value refinement with an escaped character from URL', () => {
    config.useReferenceKeys = true;
    config.params.refinements = 'refs';

    utils.SEPARATORS.forEach((separator) =>
      expect(parser.parse(`/?refs=breadcrumb_cat1:Gifts\\${separator}Audio`).refinements)
        .to.eql([refinement('breadcrumb_cat1', `Gifts${separator}Audio`)]));
  });

  it('should extract multiple refinements from URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ c: 'colour', b: 'brand' }];

    expect(parser.parse('/dark-purple/Wellingtons/cb').refinements).to.eql([
      refinement('colour', 'dark purple'),
      refinement('brand', 'Wellingtons')
    ]);
  });

  it('should extract a query and refinement from URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ c: 'colour' }];

    expect(parser.parse('/sneakers/green/red/qcc')).to.eql({
      query: 'sneakers',
      refinements: [
        refinement('colour', 'green'),
        refinement('colour', 'red')
      ]
    });
  });

  it('should extract query and value refinements from URL without reference keys', () => {
    // tslint:disable-next-line max-line-length
    expect(parser.parse('/shoe/blue/colour/red-green/colour/adidas/Brand/nike/Brand?refinements=brand-thing:nike,price:1..5'))
      .to.eql({
        query: 'shoe',
        refinements: [
          refinement('colour', 'blue'),
          refinement('colour', 'red green'),
          refinement('Brand', 'adidas'),
          refinement('Brand', 'nike'),
          refinement('brand thing', 'nike'),
          refinement('price', 1, 5)
        ]
      });
  });

  it('should extract value refinements from URL without reference keys', () => {
    expect(parser.parse('/blue/colour/red/colour/adidas/Brand/nike/Brand/coco-channel/brand-name').refinements).to.eql([
      refinement('colour', 'blue'),
      refinement('colour', 'red'),
      refinement('Brand', 'adidas'),
      refinement('Brand', 'nike'),
      refinement('brand name', 'coco channel')
    ]);
  });

  it('should extract unmapped query from URL parameters', () => {
    expect(parser.parse('/?refinements=height:20in,price:20..30,brand-name:coco-channel').refinements).to.eql([
      refinement('height', '20in'),
      refinement('price', 20, 30),
      refinement('brand name', 'coco channel')
    ]);
  });

  it('should extract query and range refinements from URL without reference key', () => {
    const url = '/long-red-dress/evening%2Fwear/category%2Bdressy/formal/category?refinements=price:50..200';

    expect(parser.parse(url)).to.eql({
      query: 'long red dress',
      refinements: [
        refinement('category+dressy', 'evening/wear'),
        refinement('category', 'formal'),
        refinement('price', 50, 200)
      ]
    });
  });

  it('should extract page size from URL', () => {
    expect(parser.parse('/?page_size=5').pageSize).to.eq(5);
  });

  it('should extract page from URL', () => {
    expect(parser.parse('/?page=2').page).to.eq(2);
  });

  it('should extract page and page size from URL', () => {
    const page = 3;
    const pageSize = 6;
    const skip = (page - 1) * pageSize;

    const request = parser.parse('/?page=3&page_size=6');

    expect(request.page).to.eq(3);
    expect(request.pageSize).to.eq(6);
  });

  it('should extract sort from URL', () => {
    const request = parser.parse('/?sort=variants.AdjustedPrice:true');

    expect(request.sort).to.eql({ field: 'variants.AdjustedPrice', descending: true });
  });

  it('should extract collection from URL', () => {
    const request = parser.parse('/?collection=variants.AdjustedPrice');

    expect(request.collection).to.eql('variants.AdjustedPrice');
  });

  it('should ignore suffix', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ h: 'height' }];
    config.suffix = 'index.html';

    expect(parser.parse('/20in/h/index.html?refinements=price:20..30').refinements).to.eql([
      refinement('height', '20in'),
      refinement('price', 20, 30)
    ]);
  });

  it('should extract mapped and unmapped refinements with query and suffix', () => {
    const refs = [refinement('category', 'Drills'), refinement('brand', 'DeWalt'), refinement('colour', 'orange')];
    config.useReferenceKeys = true;
    config.refinementMapping = [{ s: 'colour' }, { c: 'category' }];
    config.params.refinements = 'nav';
    config.queryToken = 'n';
    config.suffix = 'index.html';

    const request = parser.parse('/power-drill/orange/Drills/nsc/index.html?nav=brand:DeWalt');

    expect(request.query).to.eql('power drill');
    expect(request.refinements).to.have.deep.members(refs);
  });

  it('should extract mapped and unmapped refinements with query and suffix from URL without reference keys', () => {
    const url = '/power-drill/DeWalt/brand/Drills/category/orange/colour/index.html';
    config.suffix = 'index.html';

    const request = parser.parse(url);

    expect(request.query).to.eq('power drill');
    expect(request.refinements).to.eql([
      refinement('brand', 'DeWalt'),
      refinement('category', 'Drills'),
      refinement('colour', 'orange')
    ]);
  });

  it('should extract deeply nested URL', () => {
    config.useReferenceKeys = true;

    const request = parser.parse('http://example.com/my/nested/path/power-drill/q');

    expect(request.query).to.eql('power drill');
  });

  it('should extract mapped and unmapped refinements with query and suffix', () => {
    const url = '/power-drill/orange/Drills/nsc/index.html?nav=brand:DeWalt';
    config.useReferenceKeys = true;
    config.refinementMapping = [{ s: 'colour' }, { c: 'category' }];
    config.params = { refinements: 'nav' };
    config.queryToken = 'n';

    const request = parser.parse(url);

    expect(request.query).to.eq('power drill');
    expect(request.refinements).to.have.deep.members([
      refinement('category', 'Drills'),
      refinement('brand', 'DeWalt'),
      refinement('colour', 'orange')
    ]);
  });

  describe('error states', () => {
    it('should error on invalid reference keys', () => {
      config.useReferenceKeys = true;
      config.refinementMapping = [{ c: 'colour' }, { b: 'brand' }];

      expect(() => parser.parse('/power-drill/orange/Drills/qccb'))
        .to.throw('token reference is invalid');
    });

    it('should error on unrecognized key', () => {
      config.useReferenceKeys = true;
      config.refinementMapping = [{ c: 'colour' }];

      expect(() => parser.parse('/Drills/b')).to.throw('unexpected token \'b\' found in reference');
    });
  });
});
