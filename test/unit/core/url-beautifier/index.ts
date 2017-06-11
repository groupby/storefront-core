import UrlBeautifier from '../../../../src/core/url-beautifier';
import BeautifierFactory from '../../../../src/core/url-beautifier/factory';
import suite, { refinement } from '../../_suite';

const ROUTES: any = {
  search: '/search',
  navigation: '/navigation',
  details: '/details'
};

suite('URL beautifier', ({ expect, spy, stub }) => {
  let config: any;
  let beautifier: UrlBeautifier;
  let beautifiers: UrlBeautifier.Beautifiers;

  beforeEach(() => {
    beautifiers = <any>{};
    config = { refinementMapping: [], queryToken: 'q' };
    stub(BeautifierFactory, 'create').returns(beautifiers);
    beautifier = new UrlBeautifier(ROUTES, config);
  });

  describe('build()', () => {
    it('should call search url generator', () => {
      const build = spy();
      const request = { a: 'b' };
      beautifiers.search = <any>{ build };

      beautifier.build('search', request);

      expect(build).to.have.been.calledWith(request);
    });

    it('should call navigation url generator', () => {
      const name = 'Apples';
      const build = spy();
      beautifiers.navigation = <any>{ build };

      beautifier.build('navigation', name);

      expect(build).to.have.been.calledWith(name);
    });

    it('should call details url generator', () => {
      const detail = {
        title: 'Apples',
        id: '12345',
        refinements: []
      };
      const build = spy();
      beautifiers.details = <any>{ build };

      beautifier.build('details', detail);

      expect(build).to.have.been.calledWith(detail);
    });
  });

  describe('parse()', () => {
    it('should call search url parser', () => {
      const parse = spy();
      beautifiers.search = <any>{ parse };

      beautifier.parse('http://example.com/search/apples/green/qc');

      expect(parse).to.have.been.calledWith('/apples/green/qc');
    });

    it('should call details url parser', () => {
      const parse = spy();
      beautifiers.details = <any>{ parse };

      beautifier.parse('http://example.com/details/apples/green/qc/1045');

      expect(parse).to.have.been.calledWith('/apples/green/qc/1045');
    });

    it('should call navigation url parser', () => {
      const parse = spy();
      beautifiers.navigation = <any>{ parse };

      beautifier.parse('http://example.com/navigation/Apples');

      expect(parse).to.have.been.calledWith('/Apples');
    });

    describe('error state', () => {
      it('should throw an error if prefix is none of query, detail or navigation', () => {
        expect(() => beautifier.parse('/my/nested/path/power-drill/q')).to.throw('invalid route');
      });
    });
  });

  describe('configuration errors', () => {
    it('should not allow refinement mapping with non-character tokens', () => {
      config = { useReferenceKeys: true, refinementMapping: [{ br: 'brand' }] };

      expect(() => new UrlBeautifier(<any>{}, config)).to.throw("token 'br' must be a single character");
    });

    it('should not allow refinement mapping with vowel tokens', () => {
      config = { useReferenceKeys: true, refinementMapping: [{ u: 'brand' }] };

      expect(() => new UrlBeautifier(<any>{}, config)).to.throw("token 'u' must not be a vowel");
    });

    it('should not allow duplicate refinement tokens', () => {
      config = { useReferenceKeys: true, refinementMapping: [{ c: 'brand' }, { c: 'price' }] };

      expect(() => new UrlBeautifier(<any>{}, config)).to.throw("token 'c' must be unique");
    });

    it('should not allow non-character query token', () => {
      config = { queryToken: 'qu', refinementMapping: [] };

      expect(() => new UrlBeautifier(<any>{}, config)).to.throw("token 'qu' must be a single character");
    });

    it('should not allow vowel query token', () => {
      config = { queryToken: 'e', refinementMapping: [] };

      expect(() => new UrlBeautifier(<any>{}, config)).to.throw("token 'e' must not be a vowel");
    });

    it('should not allow duplicates between query and refinement tokens', () => {
      config = {
        queryToken: 'k',
        refinementMapping: [{ k: 'brand' }]
      };

      expect(() => new UrlBeautifier(<any>{}, config)).to.throw("token 'k' must be unique");
    });
  });
});
