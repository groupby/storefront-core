import { Adapters } from '@storefront/flux-capacitor';
import { UrlGenerator } from '../../../../../src/core/url-beautifier/handler';
import SearchUrlGenerator from '../../../../../src/core/url-beautifier/search/generator';
import suite, { refinement } from '../../../_suite';

const REQUEST = { refinements: [] };

suite('SearchUrlGenerator', ({ expect, stub }) => {
  let config: any;
  let generator: SearchUrlGenerator;
  let data = {
    page: {
      sizes: {
        items: [12, 13, 14],
        selected: 0
      },
      first: 1
    },
    sorts: {
      items: [ { field: 'price', descending: true }, { field: 'price' }],
      selected: 0
    },
    collections: {
      selected: 'All'
    }
  };

  beforeEach(() => {
    config = { params: {}, refinementMapping: [] };
    generator = new SearchUrlGenerator(<any>{ config });
    stub(Adapters.Configuration, 'initialState').returns({ data });
  });

  it('should convert a simple query to a URL', () => {
    const query = 'red apples';
    config.queryToken = 'x';
    config.useReferenceKeys = true;

    expect(generator.build(<any>{ ...REQUEST, query })).to.have.eq('/red-apples/x');
  });

  it('should convert a simple query to a URL without reference keys', () => {
    const query = 'red apples';

    expect(generator.build(<any>{ ...REQUEST, query })).to.have.eq('/red-apples');
  });

  it('should convert a value refinement query to a URL', () => {
    config.refinementMapping = [{ c: 'brand' }];
    config.useReferenceKeys = true;

    expect(generator.build(<any>{ refinements: [refinement('brand', 'DeWalt')] })).to.have.eq('/DeWalt/c');
  });

  it('should convert a multiple refinements on same field a URL', () => {
    const refinements = [refinement('brand', 'De Walt'), refinement('brand', 'Henson')];
    config.useReferenceKeys = true;
    config.refinementMapping = [{ b: 'brand' }];

    expect(generator.build(<any>{ refinements })).to.have.eq('/De-Walt/Henson/bb');
  });

  it('should convert a multiple refinements on same field a URL without reference keys', () => {
    const query = 'tool';
    const refinements = [refinement('brand', 'De Walt'), refinement('brand', 'Henson')];

    expect(generator.build(<any>{ query, refinements })).to.eq('/tool/De-Walt/brand/Henson/brand');
  });

  it('should convert a sorted refinements list on same field a URL without reference keys', () => {
    const query = 'shoe';
    const refinements = [
      refinement('colour', 'blue'),
      refinement('Brand', 'nike'),
      refinement('Brand', 'adidas'),
      refinement('colour', 'red'),
      refinement('kids', '5-10 years')
    ];

    expect(generator.build(<any>{ query, refinements }))
      .to.eq('/shoe/adidas/Brand/nike/Brand/blue/colour/red/colour/5%252D10-years/kids');
  });

  it('should convert a refinement with a slash to a URL', () => {
    config.refinementMapping = [{ b: 'brand' }, { c: 'category' }, { a: 'ages' }];
    config.params.refinements = 'refs';
    config.useReferenceKeys = true;

    expect(generator.build(<any>{
      refinements: [
        refinement('brand', 'De/Walt'),
        refinement('category', 'All Formal Dresses'),
        refinement('ages', '20-30 years'),
        refinement('kids', '5-10 years')
      ]
    })).to.eq('/De%2FWalt/All-Formal-Dresses/20%252D30-years/bca?refs=kids:5%252D10-years');
  });

  it('should convert a refinement with a plus to a URL', () => {
    config.refinementMapping = [{ b: 'brand' }];
    config.useReferenceKeys = true;

    expect(generator.build(<any>{ refinements: [refinement('brand', 'De+Walt')] })).to.have.eq('/De%2BWalt/b');
  });

  it('should convert a multiple refinement query to a URL', () => {
    const refinements = [refinement('brand', 'Farmer John'), refinement('height', '20in')];
    config.useReferenceKeys = true;
    config.refinementMapping = [{ b: 'brand' }, { h: 'height' }];

    expect(generator.build(<any>{ refinements })).to.have.eq('/Farmer-John/20in/bh');
  });

  it('should convert query and refinements to a URL', () => {
    const request: any = { query: 'cool sneakers', refinements: [refinement('colour', 'green')] };
    config.useReferenceKeys = true;
    config.queryToken = 'q';
    config.refinementMapping = [{ c: 'colour' }];

    expect(generator.build(request)).to.have.eq('/cool-sneakers/green/qc');
  });

  it('should not convert range refinements to a URL', () => {
    config.useReferenceKeys = true;
    config.refinementMapping = [{ p: 'price' }];

    expect(() => generator.build(<any>{ refinements: [refinement('price', 20, 40)] }))
      .to.throw('cannot map range refinements');
  });

  it('should convert unmapped refinements to a query parameter', () => {
    const refinements = [
      refinement('colour', 'dark purple'),
      refinement('price', 100, 250),
      refinement('price', 100, 220),
      refinement('price', 10, 50),
      refinement('colour', 'a'),
      refinement('brand brands', 'nike shoes')
    ];
    config.useReferenceKeys = true;
    config.params = { refinements: 'refinements' };

    expect(generator.build(<any>{ refinements }))
      // tslint:disable-next-line max-line-length
      .to.eq('/?refinements=brand-brands:nike-shoes,colour:a,colour:dark-purple,price:10..50,price:100..220,price:100..250');
  });

  it('should convert sort to a query parameter', () => {
    config.params = { sort: 'sort' };

    expect(generator.build(<any>{ ...REQUEST, sort: { field: 'price' } }))
    .to.eq('/?sort=price:false');
  });

  it('should convert collection to a query parameter', () => {
    config.params = { collection: 'collection' };

    expect(generator.build(<any>{ ...REQUEST, collection: 'All Stuff' }))
    .to.eq('/?collection=All-Stuff');
  });

  it('should convert pageSize to a query parameter', () => {
    config.params = { pageSize: 'page_size' };

    expect(generator.build(<any>{ ...REQUEST, pageSize: 24 })).to.eq('/?page_size=24');
  });

  it('should convert skip to a query parameter', () => {
    config.params = { page: 'page' };

    expect(generator.build(<any>{ ...REQUEST, page: 4 })).to.eq('/?page=4');
  });

  it('should convert skip and pageSize to a query parameter', () => {
    config.useReferenceKeys = true;
    config.params = { pageSize: 'page_size', page: 'page' };

    expect(generator.build(<any>{ ...REQUEST, pageSize: 30, page: 2 }))
    .to.eq('/?page=2&page_size=30');
  });

  it('should convert query with skip, page size and unmapped refinements to a URL without reference keys', () => {
    const request: any = {
      query: 'red apples',
      refinements: [refinement('colour', 'dark purple'), refinement('price', 100, 220)],
      page: 4,
      pageSize: 19
    };
    config.params = { pageSize: 'page_size', page: 'page', refinements: 'refinements' };

    expect(generator.build(request))
    .to.eq('/red-apples/dark-purple/colour?page=4&page_size=19&refinements=price:100..220');
  });

  it('should convert query with unmapped refinements to a URL with reference keys', () => {
    const request: any = {
      query: 'long red dress',
      refinements: [
        refinement('category', 'evening wear'),
        refinement('category', 'formal'),
        refinement('size', 'large'),
        refinement('shipping', 'true')
      ]
    };
    config.useReferenceKeys = true;
    config.params = { pageSize: 'page_size', page: 'page', refinements: 'refinements' };
    config.queryToken = 'q';
    config.refinementMapping = [{ c: 'category' }];

    const url = generator.build(request);

    expect(url).to.eq(`/long-red-dress/evening-wear/formal/qcc?refinements=shipping:true,size:large`);
  });

  it('should not put default state in URL', () => {
    const request: any = {
      query: 'whatever',
      collection: 'All',
      page: 1,
      pageSize: 12,
      sort: data.sorts.items[data.sorts.selected],
      refinements: [
        refinement('category', 'evening wear'),
        refinement('category', 'formal'),
      ]
    };
    config.useReferenceKeys = true;
    config.params = {
      pageSize: 'page_size',
      page: 'page',
      refinements: 'refinements',
      collection: 'collection',
      sort: 'sort'
    };
    config.queryToken = 'q';

    const url = generator.build(request);

    expect(url).to.eq('/whatever/q?refinements=category:evening-wear,category:formal');
  });

  describe('canonical URLs', () => {
    const ref1 = refinement('colour', 'orange');
    const ref2 = refinement('brand', 'De Walt');
    const ref3 = refinement('category', 'Drills');

    it('should create canonical URLs', () => {
      const refinements = [ref3, ref1, ref2];
      const otherRefinements = [ref1, ref2, ref3];
      config.refinementMapping = [{ c: 'colour' }, { b: 'brand' }, { h: 'category' }];

      expect(generator.build(<any>{ refinements }))
      .to.eq(generator.build(<any>{ refinements: otherRefinements }));
    });

    it('should create canonical URLs with multiple refinements on same field', () => {
      config.useReferenceKeys = true;
      config.refinementMapping = [{ b: 'brand' }];

      expect(generator.build(<any>{ refinements: [refinement('brand', 'Henson'), refinement('brand', 'De Walt')] }))
      .to.have.eq('/De-Walt/Henson/bb');
    });

    it('should create canonical query parameters', () => {
      expect(generator.build(<any>{ refinements: [ref1, ref2, ref3] }))
      .to.eq(generator.build(<any>{ refinements: [ref3, ref1, ref2] }));
    });

    it('should combine mapped and unmapped refinements with query and suffix', () => {
      config.useReferenceKeys = true;
      config.refinementMapping = [{ b: 'brand' }, { c: 'category' }];
      config.queryToken = 's';
      config.params = { refinements: 'refs' };
      config.suffix = 'index.php';

      const url = generator.build(<any>{ query: 'power drill', refinements: [ref1, ref3, ref2] });

      expect(url).to.have.eq('/power-drill/De-Walt/Drills/sbc/index.php?refs=colour:orange');
      expect(url).to.eq(generator.build(<any>{ query: 'power drill', refinements: [ref2, ref1, ref3] }));
    });
  });

  // pull out into integration tests
  it('should convert query with a slash to a URL', () => {
    const query = 'red/apples';

    expect(generator.build(<any>{ ...REQUEST, query })).to.have.eq('/red%2Fapples');
  });

  it('should convert query with a plus to a URL', () => {
    const query = 'red+apples';
    config.useReferenceKeys = true;
    config.queryToken = 'q';

    expect(generator.build(<any>{ ...REQUEST, query })).to.have.eq('/red%2Bapples/q');
  });
});
